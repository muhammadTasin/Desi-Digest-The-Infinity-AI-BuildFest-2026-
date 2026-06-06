import { parseImageDataUrl } from "@/lib/image-mime";

export async function uploadPlatePhotoToSupabase(imageDataUrl: string): Promise<string | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return null;

    const blob = await (await fetch(imageDataUrl)).blob();
    const payload = parseImageDataUrl(imageDataUrl);
    const contentType = payload?.mimeType ?? "image/jpeg";
    const extension =
      contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `${uid}/${Date.now()}.${extension}`;
    const { error: upErr } = await supabase.storage
      .from("plate-photos")
      .upload(path, blob, { contentType, upsert: false });
    if (!upErr) {
      const { data: pub } = supabase.storage.from("plate-photos").getPublicUrl(path);
      return pub.publicUrl;
    }
  } catch (error) {
    console.error("Failed to upload plate photo:", error);
    // photo upload is best-effort; log still saves
  }
  return null;
}
