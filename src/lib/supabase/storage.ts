// Builds a public object URL for a storage bucket path without needing a client.
export function publicImageUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export const LISTING_BUCKET = "listing-photos";
export const AVATAR_BUCKET = "avatars";
