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

export const GOSPEL_SUBGENRES = [
  "Worship",
  "Praise",
  "Contemporary Gospel",
  "Gospel Choir",
  "Traditional Gospel",
  "Gospel Afrobeat",
  "Gospel Hymns",
] as const;

export function formatGenreLabel(genre: string | null, subgenre: string | null): string {
  if (!genre) return "—";
  if (genre === "Gospel" && subgenre) return `Gospel · ${subgenre}`;
  return genre;
}
