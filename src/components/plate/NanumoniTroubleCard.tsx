import { AlertTriangle, Camera, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NanumoniTroubleCard({
  title,
  message,
  tips,
  onRetake,
  onReupload,
  onRetry,
}: {
  title: string;
  message: string;
  tips?: string[];
  onRetake: () => void;
  onReupload: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-spice/40 bg-spice/5">
      <div className="flex items-start gap-3 border-b border-spice/30 bg-spice/10 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spice/20 text-spice">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base leading-snug">{title}</p>
          <p className="mt-0.5 text-sm text-foreground/85">{message}</p>
        </div>
      </div>
      {tips && tips.length > 0 && (
        <ul className="space-y-1.5 px-4 py-3 text-sm">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-spice">•</span>
              <span className="text-foreground/85">{t}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 glass-soft border-t border-border/60 px-4 py-3">
        <Button onClick={onRetake} className="shadow-warm">
          <Camera className="h-4 w-4" /> Retake photo
        </Button>
        <Button variant="outline" onClick={onReupload}>
          <Upload className="h-4 w-4" /> Reupload
        </Button>
        {onRetry && (
          <Button variant="ghost" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        )}
      </div>
    </div>
  );
}
