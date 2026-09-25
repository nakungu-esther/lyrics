export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

export async function uniqueSongSlug(
  artistId: string,
  title: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (await exists(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
