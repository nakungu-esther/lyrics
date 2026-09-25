import { z } from "zod";

const optionalUrl = z
  .string()
  .url()
  .max(2048)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const artistSocialLinksSchema = z
  .object({
    instagram: optionalUrl,
    youtube: optionalUrl,
    tiktok: optionalUrl,
    facebook: optionalUrl,
    x: optionalUrl,
  })
  .strict()
  .optional();

export type ArtistSocialLinks = z.infer<typeof artistSocialLinksSchema>;

export const artistCreateSchema = z.object({
  name: z.string().min(1).max(120),
  biography: z.string().max(5000).optional(),
  genre: z.string().max(80).optional(),
  location: z.string().max(120).optional(),
  website: z.string().url().max(2048).optional(),
  profileImageUrl: z.string().url().max(2048).optional(),
  coverImageUrl: z.string().url().max(2048).optional(),
  socialLinks: artistSocialLinksSchema,
});

export const artistUpdateSchema = artistCreateSchema.partial();

export type ArtistCreateInput = z.infer<typeof artistCreateSchema>;
export type ArtistUpdateInput = z.infer<typeof artistUpdateSchema>;

export function normalizeSocialLinks(
  links: ArtistSocialLinks | undefined,
): Record<string, string> | undefined {
  if (!links) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(links)) {
    if (value?.trim()) out[key] = value.trim();
  }
  return Object.keys(out).length ? out : undefined;
}
