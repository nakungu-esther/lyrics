import path from "node:path";
import type { UploadResourceType } from "./mediaPolicy.js";
import { extensionForMime } from "./mediaPolicy.js";

export function buildObjectKey(input: { resourceType: UploadResourceType; userId: string; artistId?: string; songId?: string; contentType: string; originalFilename?: string }): string {
  const scope = input.songId ? `songs/${input.songId}` : `artists/${input.artistId ?? input.userId}`;
  const folder = input.resourceType === "SONG_AUDIO" ? "audio/original" : input.resourceType === "SONG_COVER" ? "cover" : input.resourceType === "MUSIC_VIDEO" ? "video" : input.resourceType === "ARTIST_PROFILE" ? "profile" : "cover";
  const extension = extensionForMime(input.contentType);
  return `${scope}/${folder}/${crypto.randomUUID()}.${extension}`;
}

export function processedAudioObjectKey(songId: string): string {
  return `songs/${songId}/audio/processed/master.wav`;
}

export function isObjectKeyAllowed(key: string, resourceType: UploadResourceType, ids: { userId: string; songId?: string; artistId?: string }): boolean {
  const normalized = path.posix.normalize(key).replace(/^\.\//, "");
  if (normalized !== key || normalized.includes("..") || normalized.startsWith("/")) return false;
  const prefix = ids.songId ? `songs/${ids.songId}/` : `artists/${ids.artistId ?? ids.userId}/`;
  if (!normalized.startsWith(prefix)) return false;
  const expected = resourceType === "SONG_AUDIO" ? "audio/original/" : resourceType === "SONG_COVER" ? "cover/" : resourceType === "MUSIC_VIDEO" ? "video/" : resourceType === "ARTIST_PROFILE" ? "profile/" : "cover/";
  return normalized.startsWith(prefix + expected);
}
