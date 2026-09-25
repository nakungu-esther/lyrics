import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { getStorageProvider } from "../storage/index.js";
import { processedAudioObjectKey } from "../storage/objectKeys.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export type AudioProbeResult = {
  durationSeconds: number;
  codec: string | null;
  sampleRate: number | null;
  channels: number | null;
  bitrate: number | null;
  format: string | null;
};

export type ProgressReporter = (progress: number, message: string) => Promise<void>;

function tempJobDir(jobId: string): string {
  const base = env.workerTempDir || path.join(os.tmpdir(), "lyricshub");
  return path.join(base, jobId);
}

export async function probeAudioFile(filePath: string): Promise<AudioProbeResult> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const stream = data.streams.find((s) => s.codec_type === "audio");
      resolve({
        durationSeconds: data.format.duration ?? 0,
        codec: stream?.codec_name ?? null,
        sampleRate: stream?.sample_rate ? Number(stream.sample_rate) : null,
        channels: stream?.channels ?? null,
        bitrate: data.format.bit_rate ? Number(data.format.bit_rate) : null,
        format: data.format.format_name ?? null,
      });
    });
  });
}

export async function normalizeAudioForTranscription(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioChannels(env.audioTargetChannels)
      .audioFrequency(env.audioTargetSampleRate)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("error", reject)
      .on("end", () => resolve())
      .save(outputPath);
  });
}

async function cleanupDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}

/**
 * Runs FFmpeg normalization for one AUDIO processing job.
 * Original object in storage is never modified.
 */
export async function runAudioProcessingJob(input: {
  songId: string;
  jobId: string;
  /** Legacy multipart uploads that stored files under lib/storage paths */
  legacySourceRelativePath?: string;
  reportProgress: ProgressReporter;
}): Promise<void> {
  const { songId, jobId, legacySourceRelativePath, reportProgress } = input;
  const workDir = tempJobDir(jobId);
  const legacyExt =
    legacySourceRelativePath && path.extname(legacySourceRelativePath)
      ? path.extname(legacySourceRelativePath)
      : ".bin";
  const sourceLocal = path.join(
    workDir,
    legacySourceRelativePath ? `source${legacyExt}` : "source.bin",
  );
  const processedLocal = path.join(workDir, "processed.wav");

  await fs.mkdir(workDir, { recursive: true });

  try {
    await reportProgress(5, "Preparing");

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      throw new Error("Song not found");
    }

    const storage = getStorageProvider();
    let sourceObjectKey = song.audioObjectKey;

    if (!sourceObjectKey && legacySourceRelativePath) {
      const { absolutePath } = await import("../lib/storage.js");
      const legacyPath = absolutePath(legacySourceRelativePath);
      await fs.copyFile(legacyPath, sourceLocal);
    } else if (sourceObjectKey) {
      const exists = await storage.objectExists(sourceObjectKey);
      if (!exists) {
        throw new Error("Original audio not found in storage");
      }
      await reportProgress(10, "Downloading original audio");
      await storage.getObjectToFile(sourceObjectKey, sourceLocal);
    } else {
      throw new Error("No audio uploaded for this song");
    }

    await reportProgress(20, "Inspecting audio");
    const probe = await probeAudioFile(sourceLocal);

    await reportProgress(40, "Processing audio");
    await normalizeAudioForTranscription(sourceLocal, processedLocal);

    const stat = await fs.stat(processedLocal);
    const outKey = processedAudioObjectKey(songId);
    const contentType = "audio/wav";

    await reportProgress(80, "Uploading processed audio");
    await storage.putFileFromPath(outKey, processedLocal, contentType);

    const previousProcessedKey = song.processedAudioObjectKey;

    await prisma.$transaction([
      prisma.song.update({
        where: { id: songId },
        data: {
          durationSeconds: probe.durationSeconds,
          audioCodec: probe.codec,
          audioSampleRate: probe.sampleRate,
          audioChannels: probe.channels,
          audioBitrate: probe.bitrate,
          processedAudioObjectKey: outKey,
          processedAudioContentType: contentType,
          processedAudioSize: BigInt(stat.size),
          processedAudioUploadedAt: new Date(),
          status: "AUDIO_READY",
        },
      }),
      prisma.processingJob.update({
        where: { id: jobId },
        data: {
          metadata: {
            probe,
            processedObjectKey: outKey,
            originalObjectKey: sourceObjectKey,
          },
        },
      }),
    ]);

    if (previousProcessedKey && previousProcessedKey !== outKey) {
      await storage.deleteObject(previousProcessedKey).catch(() => {});
    }

    await reportProgress(95, "Finalizing");
  } finally {
    await cleanupDir(workDir);
  }
}
