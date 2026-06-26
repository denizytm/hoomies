export function publicImageUrl(
  bucket: string,
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
