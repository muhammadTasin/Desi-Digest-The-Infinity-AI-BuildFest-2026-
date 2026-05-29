export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export function normalizeImageMimeType(value?: string | null): AllowedImageMimeType | null {
  if (!value) return null;
  const normalized = value.toLowerCase();

  if (normalized === "image/png") return "image/png";
  if (normalized === "image/jpeg") return "image/jpeg";
  if (normalized === "image/jpg") return "image/jpeg";
  if (normalized === "image/webp") return "image/webp";

  return null;
}

export function getImageMimeType(file: File): AllowedImageMimeType | null {
  const detectedFromType = normalizeImageMimeType(file.type);
  if (detectedFromType) return detectedFromType;
  if (file.type) return null;

  const name = file.name.toLowerCase();

  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg")) return "image/jpeg";
  if (name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";

  return null;
}

export function isAllowedImageMimeType(value?: string | null): value is AllowedImageMimeType {
  return Boolean(normalizeImageMimeType(value));
}

export function parseImageDataUrl(dataUrl: string): {
  imageBase64: string;
  mimeType: AllowedImageMimeType;
} | null {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) return null;

  const mimeType = normalizeImageMimeType(match[1]);
  if (!mimeType) return null;

  return {
    mimeType,
    imageBase64: match[2],
  };
}
