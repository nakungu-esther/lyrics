import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  AlbumOption,
  AudioProcessingStatus,
  CreateSongInput,
  Song,
  UpdateSongInput,
} from "../features/songs/types";

function unwrapSong(body: { data?: { song: Song }; song?: Song }): Song {
  const song = body.data?.song ?? body.song;
  if (!song) throw new Error("Invalid song response");
  return song;
}

function unwrapSongs(body: { data?: { songs: Song[] }; songs?: Song[] }): Song[] {
  return body.data?.songs ?? body.songs ?? [];
}

export async function fetchArtistSongs(): Promise<Song[]> {
  const body = await apiGet<{ data?: { songs: Song[] }; songs?: Song[] }>(
    "/api/v1/artists/me/songs",
  );
  return unwrapSongs(body);
}

export async function fetchSong(id: string): Promise<Song> {
  const body = await apiGet<{ data?: { song: Song }; song?: Song }>(
    `/api/v1/songs/${id}`,
  );
  return unwrapSong(body);
}

export async function createSong(input: CreateSongInput): Promise<Song> {
  const body = await apiPost<{ data?: { song: Song }; song?: Song }>(
    "/api/v1/songs",
    input,
  );
  return unwrapSong(body);
}

export async function updateSong(id: string, input: UpdateSongInput): Promise<Song> {
  const body = await apiPatch<{ data?: { song: Song }; song?: Song }>(
    `/api/v1/songs/${id}`,
    input,
  );
  return unwrapSong(body);
}

export async function deleteSong(id: string): Promise<void> {
  await apiDelete(`/api/v1/songs/${id}`);
}

export async function fetchAudioProcessingStatus(
  songId: string,
): Promise<AudioProcessingStatus> {
  const body = await apiGet<{ success: boolean; data: AudioProcessingStatus }>(
    `/api/v1/songs/${songId}/processing-status`,
  );
  return body.data;
}

export async function retryAudioProcessing(songId: string): Promise<string> {
  const body = await apiPost<{ success: boolean; data: { jobId: string } }>(
    `/api/v1/songs/${songId}/retry-processing`,
    {},
  );
  return body.data.jobId;
}

export async function fetchArtistAlbums(): Promise<AlbumOption[]> {
  const body = await apiGet<{ data?: { albums: AlbumOption[] } }>(
    "/api/v1/artists/me/albums",
  );
  return body.data?.albums ?? [];
}
