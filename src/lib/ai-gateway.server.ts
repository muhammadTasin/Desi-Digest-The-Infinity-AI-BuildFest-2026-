import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { tryConsumeGeminiQuota } from "@/lib/gemini-quota.server";

export const CHAT_MODEL_NAME = "gemini-2.5-flash-lite" as const;
type AiPhase = "chat" | "explanation";
type AiModelName = typeof CHAT_MODEL_NAME;

export function logAiModelUse(phase: AiPhase, model: AiModelName) {
  console.info("[ai] using model", { phase, model });
}

export function getGeminiApiKey() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }
  return apiKey;
}

export function createGeminiProvider() {
  return createGoogleGenerativeAI({ apiKey: getGeminiApiKey() });
}



export async function generateChatResponse(input: {
  userMessage: string;
  template: string;
  context?: unknown;
  userProfile?: unknown;
}): Promise<{ text: string; usedGemini: boolean; fallbackReason?: string }> {
  const quota = tryConsumeGeminiQuota();
  if (!quota.allowed) return { text: input.template, usedGemini: false, fallbackReason: quota.reason || "Gemini unavailable" };

  try {
    logAiModelUse("chat", CHAT_MODEL_NAME);
    const result = await generateText({
      model: createGeminiProvider()(CHAT_MODEL_NAME),
      system: `You are Nanumoni, a warm Bangladeshi nutrition assistant.
- Reply in the user's language style: Bangla, English, or Banglish (mixed Bangla-English).
- Give practical, budget-aware food advice.
- Prefer Bangladeshi/desi food examples (e.g., local fish, vegetables, dal, rice).
- Keep advice safe and avoid medical diagnosis.
- For diabetes/heart/BP/cholesterol questions, explicitly state this is "general guidance, not medical advice."
- Do not claim any food prevents diabetes or cures disease. Use "diabetes-friendly" or "lower risk choice".
- Recommend seeing a doctor or dietitian for serious medical conditions.
- If factual database data is provided in context, use it accurately.
- If no database data is provided, still answer with general safe nutrition advice.
- Preserve source labels and fallback labels when present in the factual template.`,
      messages: [
        {
          role: "user",
          content: `User Profile: ${JSON.stringify(input.userProfile ?? {})}
User message: ${input.userMessage}

Retrieved database context:
${JSON.stringify(input.context ?? {})}

Factual template/fallback:
${input.template}`,
        },
      ],
    });
    const text = result.text?.trim();
    if (!text) return { text: input.template, usedGemini: false, fallbackReason: "Gemini returned an empty response" };
    return { text: text + "\n\nAI conversation generated from retrieved data", usedGemini: true };
  } catch (error) {
    return {
      text: input.template,
      usedGemini: false,
      fallbackReason: error instanceof Error ? error.message : "Gemini chat failed",
    };
  }
}
