import { apiGet, apiPost } from "./client";
import type { SongLanguageStatus } from "../features/songs/languageTypes";

export async function fetchSongLanguage(songId: string): Promise<SongLanguageStatus> {
  const body = await apiGet<{ success: boolean; data: SongLanguageStatus }>(
    `/api/v1/songs/${songId}/language`,
  );
  return body.data;
}

export async function confirmSongLanguage(
  songId: string,
  input:
    | { languages: string[] }
    | {
        segments: Array<{ language: string; startTime: number; endTime: number }>;
      },
): Promise<SongLanguageStatus> {
  const body = await apiPost<{ success: boolean; data: SongLanguageStatus }>(
    `/api/v1/songs/${songId}/language/confirm`,
    input,
  );
  return body.data;
}

export async function retryLanguageDetection(songId: string): Promise<string> {
  const body = await apiPost<{ success: boolean; data: { jobId: string } }>(
    `/api/v1/songs/${songId}/language/retry-detection`,
    {},
  );
  return body.data.jobId;
}

export type LanguageOption = { code: string; name: string; flag: string };

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const body = await apiGet<{ languages: LanguageOption[] }>("/api/v1/languages");
  return body.languages;
}
