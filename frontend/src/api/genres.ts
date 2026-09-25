import { apiGet } from "./client";

export type GenresCatalog = {
  genres: string[];
  gospelSubgenres: string[];
  gospelVideoTemplates: Array<{ slug: string; name: string; description: string }>;
};

export async function fetchGenresCatalog(): Promise<GenresCatalog> {
  const body = await apiGet<{ success: boolean; data: GenresCatalog }>("/api/v1/genres");
  return body.data;
}
