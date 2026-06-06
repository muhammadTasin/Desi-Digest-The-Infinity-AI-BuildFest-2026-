"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { analyzePlate, type PlateAnalysis } from "@/lib/analyze-plate.functions";
import { ALLOWED_IMAGE_MIME_TYPES, getImageMimeType, parseImageDataUrl } from "@/lib/image-mime";
import { logMeal } from "@/lib/meals.functions";
import { NutritionLabel } from "@/components/NutritionLabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  Heart,
  Leaf,
  Flame,
  X,
  ImagePlus,
  AlertTriangle,
  RefreshCw,
  Wand2,
  Bookmark,
  Wallet,
  ArrowRight,
  UserCog,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import nanumoniAvatar from "@/assets/nanumoni-avatar.jpg";
import { fileToDownscaledDataUrl, MAX_BYTES } from "@/lib/plate/image-utils";
import { uploadPlatePhotoToSupabase } from "@/lib/plate/plate-upload";
import { PlateAnalysisResult } from "@/components/plate/PlateAnalysisResult";
import { NanumoniTroubleCard } from "@/components/plate/NanumoniTroubleCard";


type Props = {
  trigger?: React.ReactNode;
  userContext?: string;
};


export function PlateAnalyzer({ trigger, userContext }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlateAnalysis | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzePlate);
  const log = useServerFn(logMeal);

  const mutation = useMutation({
    mutationFn: async (dataUrl: string) => {
      const payload = parseImageDataUrl(dataUrl);
      if (!payload) throw new Error("Image upload failed. Please reupload the photo.");
      return analyze({ data: { ...payload, userContext } });
    },
    onSuccess: (res) => setAnalysis(res),
    onError: (e) => toast.error(getPlateAnalysisErrorMessage(e)),
  });

  const logMut = useMutation({
    mutationFn: async () => {
      if (!analysis || !analysis.detected) return;
      const n = analysis.nutrition;
      const name = analysis.dishes.map((d) => d.name).join(" + ") || "Plate";
      const hour = new Date().getHours();
      const meal_type =
        hour < 11 ? "breakfast" : hour < 16 ? "lunch" : hour < 20 ? "dinner" : "snack";

      let image_url: string | null = null;
      if (imageDataUrl) {
        image_url = await uploadPlatePhotoToSupabase(imageDataUrl);
      }

      await log({
        data: {
          meal_type,
          name,
          calories: n?.calories ?? 0,
          protein_g: n?.protein_g ?? 0,
          fat_g: n?.fat_g ?? 0,
          carbs_g: n?.carbs_g ?? 0,
          fiber_g: n?.fiber_g ?? 0,
          sodium_mg: n?.sodium_mg ?? 0,
          health_score: analysis.healthScore,
          source: "photo",
          image_url,
          analysis: analysis as unknown as Record<string, unknown>,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["plate-history"] });
      toast.success("Saved to your plate history");
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't log"),
  });

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const mimeType = getImageMimeType(file);
    if (!mimeType || !ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      toast.error("Please upload a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_BYTES * 4) {
      toast.error("Photo too large. Please pick a smaller one.");
      return;
    }
    try {
      const dataUrl = await fileToDownscaledDataUrl(file, mimeType);
      setImageDataUrl(dataUrl);
      setAnalysis(null);
      mutation.mutate(dataUrl);
    } catch {
      toast.error("Image upload failed. Please reupload the photo.");
    }
  }

  function getPlateAnalysisErrorMessage(error: unknown) {
    const message = error instanceof Error ? error.message : String(error || "");
    if (/Unsupported image MIME type/i.test(message)) {
      return "Please upload a PNG, JPG, JPEG, or WEBP image.";
    }
    if (/Invalid or empty image payload|Image payload is required/i.test(message)) {
      return "Image upload failed. Please reupload the photo.";
    }
    if (/couldn't identify food|no food/i.test(message)) {
      return "I couldn't identify food in this image. Try a clearer food photo.";
    }
    return message || "AI analysis failed. Please try again.";
  }

  function reset() {
    setImageDataUrl(null);
    setAnalysis(null);
    mutation.reset();
  }

  function retake() {
    reset();
    // Defer to next tick so the input is mounted/ready
    setTimeout(() => cameraRef.current?.click(), 0);
  }

  function reupload() {
    reset();
    setTimeout(() => fileRef.current?.click(), 0);
  }

  function retryAnalysis() {
    if (!imageDataUrl) return;
    setAnalysis(null);
    mutation.reset();
    mutation.mutate(imageDataUrl);
  }

  function close(o: boolean) {
    setOpen(o);
    if (!o) reset();
  }

  // Derive a "needs retake" signal from the analysis
  const lowQuality =
    analysis &&
    (!analysis.detected ||
      analysis.blurry ||
      analysis.dishes.length === 0);


  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg" className="shadow-warm">
            <Camera className="h-4 w-4" /> 📸 Analyze My Plate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] max-w-2xl overflow-y-auto p-0 sm:w-full">
        <DialogHeader className="glass-nav px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={nanumoniAvatar}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full ring-2 ring-primary/30"
            />
            <div className="min-w-0">
              <DialogTitle className="font-display text-lg">
                Nanumoni is looking at your plate
              </DialogTitle>
              <DialogDescription className="text-xs">
                Uses Edamam image food detection + nutrition databases · Not medical advice
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-5">
          {/* Always-mounted file inputs so retake/reupload work from any state */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {!imageDataUrl && (
            <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-6 text-center">
              <ImagePlus className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-display text-lg">Show Nanumoni your khabar</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Take a clear, top-down photo of your plate. Better light = better answer.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button onClick={() => cameraRef.current?.click()} className="shadow-warm">
                  <Camera className="h-4 w-4" /> Take photo
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Upload from gallery
                </Button>
              </div>
            </div>
          )}

          {imageDataUrl && (
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-border">
              <img
                src={imageDataUrl}
                alt="Your plate"
                className="aspect-video w-full object-cover"
              />
              <button
                onClick={reset}
                className="absolute right-2 top-2 rounded-full glass-soft p-1.5 transition hover:bg-background"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-2 rounded-xl bg-secondary/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm font-medium">
                  Analyzing with your latest profile…
                </p>
              </div>
              <p className="pl-8 text-xs text-muted-foreground">
                Searching food image API, then cross-checking local Desi food data + USDA.
              </p>
            </div>
          )}

          {/* AI request failed entirely (network, gateway, rate limit, etc.) */}
          {mutation.isError && !mutation.isPending && (
            <NanumoniTroubleCard
              title="Analysis did not complete"
              message={getPlateAnalysisErrorMessage(mutation.error)}
              onRetake={retake}
              onReupload={reupload}
              onRetry={imageDataUrl ? retryAnalysis : undefined}
            />
          )}

          {/* Analysis returned but image was blurry / nothing recognized */}
          {analysis && lowQuality && !mutation.isPending && (
            <NanumoniTroubleCard
              title={
                analysis.detectionUnavailable
                  ? "Image food detection is temporarily unavailable"
                  : analysis.blurry
                    ? "The photo is a little blurry, shona"
                    : !analysis.detected
                      ? "Nanumoni can't identify food from this image"
                      : "Nanumoni is not fully sure about this plate"
              }
              message={
                analysis.nanumoniMessage ||
                "Image food detection is temporarily unavailable. You can type the food name and I will search the nutrition database."
              }
              tips={[
                "Hold the phone right over the plate (top-down)",
                "Move near a window or turn on a bright light",
                "Wipe the camera lens — phone lenses get smudgy",
                "Fit the full plate in frame, no fingers on top",
              ]}
              onRetake={retake}
              onReupload={reupload}
            />
          )}

          {/* Good analysis */}
          {analysis && !lowQuality && <PlateAnalysisResult analysis={analysis} />}

          {analysis && imageDataUrl && analysis.detected && !lowQuality && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                onClick={() => logMut.mutate()}
                disabled={logMut.isPending}
                className="shadow-warm"
              >
                <Heart className="h-4 w-4" /> Add to today's log
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  document
                    .getElementById("nanumoni-healthier-tips")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <Wand2 className="h-4 w-4" /> Make it healthier
              </Button>
              <Button variant="outline" onClick={() => logMut.mutate()} disabled={logMut.isPending}>
                <Bookmark className="h-4 w-4" /> Save this plate
              </Button>
              <Button variant="ghost" onClick={reset}>
                <Camera className="h-4 w-4" /> Analyze another
              </Button>
            </div>
          )}

        </div>
      </DialogContent>

    </Dialog>
  );
}
