export const RESOURCE_TYPES = [
  "SONG_AUDIO",
  "SONG_COVER",
  "MUSIC_VIDEO",
  "ARTIST_PROFILE",
  "ARTIST_COVER",
] as const;

export type UploadResourceType = (typeof RESOURCE_TYPES)[number];

const MIME_TYPES: Record<UploadResourceType, ReadonlySet<string>> = {
  SONG_AUDIO: new Set(["audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/flac"]),
  SONG_COVER: new Set(["image/jpeg", "image/png", "image/webp"]),
  MUSIC_VIDEO: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  ARTIST_PROFILE: new Set(["image/jpeg", "image/png", "image/webp"]),
  ARTIST_COVER: new Set(["image/jpeg", "image/png", "image/webp"]),
};

export function allowedMimeTypes(resourceType: UploadResourceType): ReadonlySet<string> {
  return MIME_TYPES[resourceType];
}

export function extensionForMime(contentType: string): string {
  const mime = contentType.toLowerCase().split(";")[0]?.trim();
  const extensions: Record<string, string> = {
    "audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/ogg": "ogg",
    "audio/mp4": "m4a", "audio/aac": "aac", "audio/flac": "flac", "image/jpeg": "jpg",
    "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return extensions[mime ?? ""] ?? "bin";
}

export function maxBytesForResource(resourceType: UploadResourceType, limits: { audioMb: number; videoMb: number; imageMb: number }): number {
  return (resourceType === "MUSIC_VIDEO" ? limits.videoMb : resourceType.startsWith("ARTIST_") || resourceType === "SONG_COVER" ? limits.imageMb : limits.audioMb) * 1024 * 1024;
}
