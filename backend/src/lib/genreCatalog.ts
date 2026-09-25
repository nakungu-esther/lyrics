/** Song genres — Gospel is a genre, not a language. Language stays on Song.language fields. */

export const SONG_GENRES = [
  "Gospel",
  "Afrobeat",
  "Afropop",
  "Hip Hop",
  "R&B",
  "Zouk",
  "Reggae",
  "Dancehall",
  "Traditional",
  "Worship",
  "Praise",
  "Choral",
] as const;

export type SongGenre = (typeof SONG_GENRES)[number];

/** Optional tags when primary genre is Gospel (e.g. Luganda Gospel + Worship). */
export const GOSPEL_SUBGENRES = [
  "Worship",
  "Praise",
  "Contemporary Gospel",
  "Gospel Choir",
  "Traditional Gospel",
  "Gospel Afrobeat",
  "Gospel Hymns",
] as const;

export type GospelSubgenre = (typeof GOSPEL_SUBGENRES)[number];

/** Lyrics-video templates planned for Gospel (seed separately; listed for UI discovery). */
export const GOSPEL_VIDEO_TEMPLATE_CATALOG = [
  {
    slug: "gospel-worship",
    name: "Worship",
    description: "Calm typography, scripture-inspired visual style, slow lyric transitions.",
  },
  {
    slug: "gospel-praise",
    name: "Praise",
    description: "Energetic animated lyrics, beat-synchronized transitions, brighter motion.",
  },
  {
    slug: "gospel-choir",
    name: "Gospel Choir",
    description: "Choir visual emphasis with synchronized lyric highlighting.",
  },
  {
    slug: "gospel-music-video",
    name: "Gospel Music Video",
    description: "Original music video background with synchronized lyrics overlay.",
  },
] as const;

const genreSet = new Set<string>(SONG_GENRES);
const gospelSubSet = new Set<string>(GOSPEL_SUBGENRES);

export function isKnownSongGenre(value: string): value is SongGenre {
  return genreSet.has(value);
}

export function isKnownGospelSubgenre(value: string): value is GospelSubgenre {
  return gospelSubSet.has(value);
}

export function normalizeGenreInput(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const match = SONG_GENRES.find((g) => g.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

export function validateGenrePair(
  genre: string | null | undefined,
  subgenre: string | null | undefined,
): { ok: true } | { ok: false; message: string } {
  const g = genre?.trim();
  const s = subgenre?.trim();
  if (!s) return { ok: true };
  if (!g) {
    return { ok: false, message: "Set a genre before choosing a Gospel subgenre" };
  }
  if (g.toLowerCase() !== "gospel") {
    return { ok: false, message: "Subgenre is only used when genre is Gospel" };
  }
  if (!isKnownGospelSubgenre(s)) {
    return { ok: false, message: "Unknown Gospel subgenre" };
  }
  return { ok: true };
}
