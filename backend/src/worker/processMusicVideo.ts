import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { absolutePath, publicFileUrl } from "../lib/storage.js";
import type { SongPipelinePayload } from "../queues/songProcessing.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function extractAudio(input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("192k")
      .format("mp3")
      .on("error", reject)
      .on("end", () => resolve())
      .save(output);
  });
}

function probeDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data.format.duration ?? 0);
    });
  });
}

export async function processMusicVideo(payload: SongPipelinePayload): Promise<void> {
  const { songId, jobId } = payload;
  const videoRelative =
    payload.sourceRelativePath ?? `video/${songId}/source.mp4`;

  await prisma.processingJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", progress: 10, message: "Extracting audio from video…" },
  });

  try {
    const videoPath = absolutePath(videoRelative);
    const outRelative = `audio/${songId}/processed.mp3`;
    const outPath = absolutePath(outRelative);

    await extractAudio(videoPath, outPath);
    const duration = await probeDuration(videoPath);

    const backgroundVideoUrl = publicFileUrl(videoRelative);
    const audioUrl = publicFileUrl(outRelative);

    await prisma.$transaction([
      prisma.song.update({
        where: { id: songId },
        data: {
          mediaSource: "MUSIC_VIDEO",
          backgroundVideoUrl,
          audioUrl,
          musicVideoObjectKey: videoRelative,
          durationSeconds: duration,
          status: "PROCESSING",
        },
      }),
      prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          progress: 100,
          message: "Video uploaded — audio extracted",
        },
      }),
    ]);

    const { continueStudioAfterMusicVideo } = await import(
      "../services/creatorStudioService.js"
    );
    await continueStudioAfterMusicVideo(songId);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        progress: 100,
        error: message,
        message: "Music video processing failed",
      },
    });
    await prisma.song.update({
      where: { id: songId },
      data: { status: "DRAFT" },
    });
  }
}

export async function saveMusicVideoUpload(
  tempPath: string,
  songId: string,
  originalName: string,
): Promise<string> {
  const ext = path.extname(originalName) || ".mp4";
  const key = `video/${songId}/source${ext}`;
  const dest = absolutePath(key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.rename(tempPath, dest).catch(async () => {
    await fs.copyFile(tempPath, dest);
    await fs.unlink(tempPath).catch(() => {});
  });
  return key;
}
