import { createServerFn } from "@tanstack/react-start";
import { generatePersonalizedNudge } from "./smart-health-nudge-ai.server";
import { type MealLog } from "./meals.functions";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateSmartNudge } from "./smart-health-nudge";
import { getPersistentNudgeImage } from "./nudge-image-service.server";

export const getSmartHealthNudgeFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => 
    z.object({
      profile: z.any(),
      recentMeals: z.any(),
      isDemo: z.boolean().default(false),
      chatKeywords: z.array(z.string()).default([])
    }).parse(input)
  )
  .handler(async ({ data }) => {
    try {
      // Attempt full AI generation which now enriches itself
      let nudge = await generatePersonalizedNudge(
        data.profile, 
        data.recentMeals as MealLog[], 
        data.isDemo, 
        data.chatKeywords
      );

      // Force 'water' imageKind if text implies hydration
      const textToSearch = [nudge.titleBn, nudge.titleEn, nudge.messageBn, nudge.messageEn].join(" ").toLowerCase();
      if (textToSearch.includes("pani") || textToSearch.includes("water") || textToSearch.includes("hydration") || textToSearch.includes("পানি")) {
         nudge.imageKind = "water";
      }

      // If somehow imageUrl is missing (e.g., returned from fallback directly in dev), force fetch it here
      if (!nudge.imageUrl) {
        const fallbackImg = await getPersistentNudgeImage(nudge.imageKind);
        if (fallbackImg) {
          nudge.imageUrl = fallbackImg.url;
          nudge.imageSource = fallbackImg.source;
          nudge.imageSourceUrl = fallbackImg.sourceUrl;
        }
      }

      return nudge;
    } catch (e) {
      console.warn("[Smart Nudge] AI generation failed, falling back to deterministic", e);
      // Absolute fallback if everything throws
      const fallbackNudge = generateSmartNudge(data.profile, data.recentMeals as MealLog[], data.isDemo);
      if (!fallbackNudge) throw new Error("Could not generate nudge");

      const textToSearch = [fallbackNudge.titleBn, fallbackNudge.titleEn, fallbackNudge.messageBn, fallbackNudge.messageEn].join(" ").toLowerCase();
      if (textToSearch.includes("pani") || textToSearch.includes("water") || textToSearch.includes("hydration") || textToSearch.includes("পানি")) {
         fallbackNudge.imageKind = "water";
      }
      
      const fallbackImg = await getPersistentNudgeImage(fallbackNudge.imageKind);
      if (fallbackImg) {
        fallbackNudge.imageUrl = fallbackImg.url;
        fallbackNudge.imageSource = fallbackImg.source;
        fallbackNudge.imageSourceUrl = fallbackImg.sourceUrl;
      }
      
      return fallbackNudge;
    }
  });
