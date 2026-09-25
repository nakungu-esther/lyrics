import { prisma } from "../lib/prisma.js";
import { getArtistForUser } from "./artistService.js";
import { assertSongOwnedByUser, SongServiceError } from "./songService.js";
import { getStorageProvider } from "../storage/index.js";
import {
  allowedMimeTypes,
  extensionForMime,
  maxBytesForResource,
  type UploadResourceType,
} from "../storage/mediaPolicy.js";
import { buildObjectKey, isObjectKeyAllowed } from "../storage/objectKeys.js";
import { env } from "../config/env.js";
import { createAudioProcessingJob } from "./processingJobService.js";

export class UploadServiceError extends Error {
  constructor(
    public code:
      | "VALIDATION"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "FILE_TOO_LARGE"
      | "STORAGE"
      | "CONFLICT",
    message: string,
  ) {
    super(message);
  }
}

const limits = () => ({
  audioMb: env.maxAudioFileSizeMb,
  videoMb: env.maxVideoFileSizeMb,
  imageMb: env.maxImageFileSizeMb,
});

export async function presignUpload(input: {
  userId: string;
  resourceType: UploadResourceType;
  songId?: string;
  artistId?: string;
  filename?: string;
  contentType: string;
  size: number;
}) {
  const mime = input.contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  const allowed = allowedMimeTypes(input.resourceType);
  if (!allowed.has(mime)) {
    throw new UploadServiceError("VALIDATION", "Unsupported content type");
  }

  const maxBytes = maxBytesForResource(input.resourceType, limits());
  if (input.size <= 0 || input.size > maxBytes) {
    throw new UploadServiceError("FILE_TOO_LARGE", "File exceeds size limit");
  }

  await assertResourceOwnership(input.userId, input.resourceType, {
    songId: input.songId,
    artistId: input.artistId,
  });

  const artist = await getArtistForUser(input.userId);
  const objectKey = buildObjectKey({
    resourceType: input.resourceType,
    userId: input.userId,
    artistId: artist?.id ?? input.artistId,
    songId: input.songId,
    contentType: mime,
    originalFilename: input.filename,
  });

  const storage = getStorageProvider();
  const result = await storage.createUploadUrl({
    objectKey,
    contentType: mime,
    maxSizeBytes: maxBytes,
    expiresInSeconds: env.uploadUrlExpiresSeconds,
  });

  return {
    uploadUrl: result.uploadUrl,
    objectKey: result.objectKey,
    expiresIn: result.expiresIn,
    method: result.method,
    headers: result.headers,
  };
}

export async function completeUpload(input: {
  userId: string;
  resourceType: UploadResourceType;
  songId?: string;
  artistId?: string;
  objectKey: string;
  contentType: string;
  size: number;
}) {
  const mime = input.contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!allowedMimeTypes(input.resourceType).has(mime)) {
    throw new UploadServiceError("VALIDATION", "Unsupported content type");
  }

  const maxBytes = maxBytesForResource(input.resourceType, limits());
  if (input.size <= 0 || input.size > maxBytes) {
    throw new UploadServiceError("FILE_TOO_LARGE", "File exceeds size limit");
  }

  const artist = await assertResourceOwnership(input.userId, input.resourceType, {
    songId: input.songId,
    artistId: input.artistId,
  });

  if (
    !isObjectKeyAllowed(input.objectKey, input.resourceType, {
      userId: input.userId,
      songId: input.songId,
      artistId: artist?.id,
    })
  ) {
    throw new UploadServiceError("VALIDATION", "Invalid object key");
  }

  const storage = getStorageProvider();
  const exists = await storage.objectExists(input.objectKey);
  if (!exists) {
    throw new UploadServiceError("NOT_FOUND", "Uploaded object not found");
  }

  let processingJobId: string | undefined;

  if (input.resourceType.startsWith("SONG_") || input.resourceType === "MUSIC_VIDEO") {
    if (!input.songId) throw new UploadServiceError("VALIDATION", "songId required");
    await applySongMedia(input.songId, input.userId, input.resourceType, {
      objectKey: input.objectKey,
      contentType: mime,
      size: BigInt(input.size),
    });
    if (input.resourceType === "SONG_AUDIO") {
      processingJobId = await createAudioProcessingJob(input.songId);
    }
  } else {
    throw new UploadServiceError("VALIDATION", "Artist media complete not enabled in this step");
  }

  return { objectKey: input.objectKey, contentType: mime, size: input.size, processingJobId };
}

async function assertResourceOwnership(
  userId: string,
  resourceType: UploadResourceType,
  ids: { songId?: string; artistId?: string },
) {
  if (resourceType.startsWith("SONG_") || resourceType === "MUSIC_VIDEO") {
    if (!ids.songId) throw new UploadServiceError("VALIDATION", "songId required");
    await assertSongOwnedByUser(ids.songId, userId);
    return getArtistForUser(userId);
  }
  if (resourceType === "ARTIST_PROFILE" || resourceType === "ARTIST_COVER") {
    const artist = await getArtistForUser(userId);
    if (!artist) throw new UploadServiceError("FORBIDDEN", "Artist profile required");
    return artist;
  }
  throw new UploadServiceError("VALIDATION", "Unknown resource type");
}

async function applySongMedia(
  songId: string,
  userId: string,
  resourceType: UploadResourceType,
  media: { objectKey: string; contentType: string; size: bigint },
) {
  const song = await assertSongOwnedByUser(songId, userId);
  const storage = getStorageProvider();
  const now = new Date();

  let oldKey: string | null = null;

  const data: Record<string, unknown> = {};

  if (resourceType === "SONG_AUDIO") {
    oldKey = song.audioObjectKey;
    data.audioObjectKey = media.objectKey;
    data.audioContentType = media.contentType;
    data.audioSize = media.size;
    data.audioUploadedAt = now;
    data.audioUrl = null;
    data.processedAudioObjectKey = null;
    data.processedAudioContentType = null;
    data.processedAudioSize = null;
    data.processedAudioUploadedAt = null;
    data.audioCodec = null;
    data.audioSampleRate = null;
    data.audioChannels = null;
    data.audioBitrate = null;
    data.durationSeconds = null;
  } else if (resourceType === "SONG_COVER") {
    oldKey = song.coverObjectKey;
    data.coverObjectKey = media.objectKey;
    data.coverContentType = media.contentType;
    data.coverSize = media.size;
    data.coverUploadedAt = now;
    data.coverImageUrl = null;
  } else if (resourceType === "MUSIC_VIDEO") {
    oldKey = song.musicVideoObjectKey;
    data.musicVideoObjectKey = media.objectKey;
    data.musicVideoContentType = media.contentType;
    data.musicVideoSize = media.size;
    data.musicVideoUploadedAt = now;
    data.backgroundVideoUrl = null;
  }

  await prisma.song.update({
    where: { id: songId },
    data: data as Parameters<typeof prisma.song.update>[0]["data"],
  });

  if (oldKey && oldKey !== media.objectKey) {
    await storage.deleteObject(oldKey).catch(() => {
      /* keep DB reference to new key even if old blob delete fails */
    });
  }
}

export async function getSongMediaDownloadUrl(
  songId: string,
  userId: string | undefined,
  kind: "audio" | "cover" | "music-video",
) {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) throw new UploadServiceError("NOT_FOUND", "Song not found");

  const isOwner =
    userId &&
    (await prisma.artist.findFirst({
      where: { id: song.artistId, ownerUserId: userId },
    }));

  if (!isOwner && song.status !== "PUBLISHED") {
    throw new UploadServiceError("FORBIDDEN", "Not allowed");
  }

  let objectKey: string | null = null;
  if (kind === "audio") objectKey = song.audioObjectKey;
  if (kind === "cover") objectKey = song.coverObjectKey;
  if (kind === "music-video") objectKey = song.musicVideoObjectKey;

  if (!objectKey) {
    throw new UploadServiceError("NOT_FOUND", "Media not uploaded");
  }

  const storage = getStorageProvider();
  return storage.createDownloadUrl({
    objectKey,
    expiresInSeconds: env.downloadUrlExpiresSeconds,
  });
}

export async function removeSongMedia(
  songId: string,
  userId: string,
  resourceType: UploadResourceType,
) {
  await assertSongOwnedByUser(songId, userId);
  const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });
  const storage = getStorageProvider();

  let objectKey: string | null = null;
  const data: Record<string, null> = {};

  if (resourceType === "SONG_AUDIO") {
    objectKey = song.audioObjectKey;
    data.audioObjectKey = null;
    data.audioContentType = null;
    data.audioSize = null;
    data.audioUploadedAt = null;
    data.audioUrl = null;
  } else if (resourceType === "SONG_COVER") {
    objectKey = song.coverObjectKey;
    data.coverObjectKey = null;
    data.coverContentType = null;
    data.coverSize = null;
    data.coverUploadedAt = null;
    data.coverImageUrl = null;
  } else if (resourceType === "MUSIC_VIDEO") {
    objectKey = song.musicVideoObjectKey;
    data.musicVideoObjectKey = null;
    data.musicVideoContentType = null;
    data.musicVideoSize = null;
    data.musicVideoUploadedAt = null;
    data.backgroundVideoUrl = null;
  }

  await prisma.song.update({
    where: { id: songId },
    data: data as Parameters<typeof prisma.song.update>[0]["data"],
  });

  if (objectKey) {
    await storage.deleteObject(objectKey).catch(() => {});
  }
}

export function serializeSongMedia(song: {
  audioObjectKey: string | null;
  audioContentType: string | null;
  audioSize: bigint | null;
  audioUploadedAt: Date | null;
  processedAudioObjectKey: string | null;
  processedAudioContentType: string | null;
  processedAudioSize: bigint | null;
  processedAudioUploadedAt: Date | null;
  coverObjectKey: string | null;
  coverContentType: string | null;
  coverSize: bigint | null;
  coverUploadedAt: Date | null;
  musicVideoObjectKey: string | null;
  musicVideoContentType: string | null;
  musicVideoSize: bigint | null;
  musicVideoUploadedAt: Date | null;
}) {
  return {
    audio: song.audioObjectKey
      ? {
          uploaded: true,
          contentType: song.audioContentType,
          size: song.audioSize ? Number(song.audioSize) : null,
          uploadedAt: song.audioUploadedAt?.toISOString() ?? null,
          processed: Boolean(song.processedAudioObjectKey),
          processedAt: song.processedAudioUploadedAt?.toISOString() ?? null,
        }
      : { uploaded: false },
    cover: song.coverObjectKey
      ? {
          uploaded: true,
          contentType: song.coverContentType,
          size: song.coverSize ? Number(song.coverSize) : null,
          uploadedAt: song.coverUploadedAt?.toISOString() ?? null,
        }
      : { uploaded: false },
    musicVideo: song.musicVideoObjectKey
      ? {
          uploaded: true,
          contentType: song.musicVideoContentType,
          size: song.musicVideoSize ? Number(song.musicVideoSize) : null,
          uploadedAt: song.musicVideoUploadedAt?.toISOString() ?? null,
        }
      : { uploaded: false },
  };
}
