import { createClient } from "./supabase/client";

export async function getSignedUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from("photos")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? "";
}

export async function getSignedUrls(
  paths: string[]
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const supabase = createClient();
  const { data } = await supabase.storage
    .from("photos")
    .createSignedUrls(paths, 3600);
  if (!data) return {};
  const result: Record<string, string> = {};
  data.forEach((item) => {
    if (item.signedUrl && item.path) {
      result[item.path] = item.signedUrl;
    }
  });
  return result;
}
