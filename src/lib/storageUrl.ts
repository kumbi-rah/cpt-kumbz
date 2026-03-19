import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Generate a signed URL for a file in the trip-photos bucket.
 * Falls back to the raw path if signing fails.
 */
export async function getSignedStorageUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("trip-photos")
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed URL:", error);
    return "";
  }
  return data.signedUrl;
}

/**
 * Generate signed URLs for multiple storage paths in one call.
 */
export async function getSignedStorageUrls(
  storagePaths: string[]
): Promise<Map<string, string>> {
  if (storagePaths.length === 0) return new Map();

  const { data, error } = await supabase.storage
    .from("trip-photos")
    .createSignedUrls(storagePaths, SIGNED_URL_EXPIRY);

  if (error || !data) {
    console.error("Failed to create signed URLs:", error);
    return new Map();
  }

  const map = new Map<string, string>();
  data.forEach((item) => {
    if (item.signedUrl && item.path) {
      map.set(item.path, item.signedUrl);
    }
  });
  return map;
}
