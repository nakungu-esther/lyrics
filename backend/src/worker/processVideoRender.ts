import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs/promises";
import path from "node:path";
import { buildAssContentFromTemplate } from "../lib/assSubtitle.js";
import { buildTemplateRenderPlan } from "../lib/templateRenderPlan.js";
import { prisma } from "../lib/prisma.js";
import { absolutePath, keyFromPublicUrl, publicFileUrl } from "../lib/storage.js";
import { trackEvent } from "../services/analyticsService.js";
import { notifyUser } from "../services/notificationService.js";
import { getActiveLyrics } from "../services/lyricsService.js";
import type { VideoRenderPayload } from "../queues/videoRender.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function processVideoRender(payload: VideoRenderPayload): Promise<void> {
  const { renderJobId, videoProjectId } = payload;

  const renderJob = await prisma.renderJob.findUniqueOrThrow({
    where: { id: renderJobId },
  });

  await prisma.renderJob.update({
    where: { id: renderJobId },
    data: {
      status: "PROCESSING",
      progress: 10,
      message: "Applying template…",
      startedAt: new Date(),
    },
  });

  try {
    const project = await prisma.videoProject.findUniqueOrThrow({
      where: { id: videoProjectId },
      include: { song: true, template: true },
    });

    const lyrics = await getActiveLyrics(project.songId);
    if (!lyrics) throw new Error("No active lyrics");

    const plan = buildTemplateRenderPlan({
      templateConfig: project.template.config,
      customizations: project.customizations,
      exportFormat: renderJob.exportFormat,
      resolutionHeight: renderJob.resolutionHeight,
      hasBackgroundVideo: Boolean(project.song.backgroundVideoUrl),
      hasCoverImage: Boolean(project.song.coverImageUrl),
    });

    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: {
        aspect: plan.export.aspect,
        progress: 20,
        message: "Building subtitles…",
      },
    });

    const lines = lyrics.sections.flatMap((sec) =>
      sec.lines.map((line) => ({
        text: line.text,
        startTime: line.startTime ?? 0,
        endTime: line.endTime ?? (line.startTime ?? 0) + 4,
        words: line.words.map((w) => ({
          text: w.text,
          startTime: w.startTime,
          endTime: w.endTime,
        })),
      })),
    );

    const assContent = buildAssContentFromTemplate(
      lines,
      plan.style,
      plan.width,
      plan.height,
    );
    const workDir = absolutePath(`render/${videoProjectId}/${renderJobId}`);
    await fs.mkdir(workDir, { recursive: true });
    const assPath = path.join(workDir, "subs.ass");
    await fs.writeFile(assPath, assContent, "utf8");

    const outRelative = `video/renders/${videoProjectId}/${renderJobId}.mp4`;
    const outPath = absolutePath(outRelative);

    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: { status: "RENDERING", progress: 45, message: "FFmpeg rendering…" },
    });

    const audioKey = project.song.audioUrl ? keyFromPublicUrl(project.song.audioUrl) : null;
    if (!audioKey) throw new Error("Song has no audio");
    const audioPath = absolutePath(audioKey);

    const assEsc = assPath.replace(/\\/g, "/").replace(/:/g, "\\:");
    const scaleFilter = `scale=${plan.width}:${plan.height}:force_original_aspect_ratio=decrease,pad=${plan.width}:${plan.height}:(ow-iw)/2:(oh-ih)/2,ass='${assEsc}'`;

    if (plan.useUploadedVideo && project.song.backgroundVideoUrl) {
      const videoKey = keyFromPublicUrl(project.song.backgroundVideoUrl);
      if (!videoKey) throw new Error("Invalid background video URL");
      const bgPath = absolutePath(videoKey);
      await renderToFile(outPath, (cmd) =>
        cmd.input(bgPath).input(audioPath).outputOptions([
          `-vf ${scaleFilter}`,
          "-c:v libx264",
          "-preset fast",
          "-crf 23",
          "-c:a aac",
          "-shortest",
        ]),
      );
    } else if (plan.gradientFilter) {
      const duration = project.song.durationSeconds ?? 180;
      await renderToFile(outPath, (cmd) =>
        cmd
          .input(`${plan.gradientFilter}:d=${duration}`)
          .inputFormat("lavfi")
          .input(audioPath)
          .outputOptions([
            `-vf ass='${assEsc}'`,
            "-c:v libx264",
            "-preset fast",
            "-crf 23",
            "-c:a aac",
            "-shortest",
          ]),
      );
    } else {
      const duration = project.song.durationSeconds ?? 180;
      const bgColor = plan.solidBackgroundColor.replace("#", "0x");
      await renderToFile(outPath, (cmd) =>
        cmd
          .input(`color=c=${bgColor}:s=${plan.width}x${plan.height}:d=${duration}`)
          .inputFormat("lavfi")
          .input(audioPath)
          .outputOptions([
            `-vf ass='${assEsc}'`,
            "-c:v libx264",
            "-preset fast",
            "-crf 23",
            "-c:a aac",
            "-shortest",
          ]),
      );
    }

    const outputVideoUrl = publicFileUrl(outRelative);

    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        message: "Render complete",
        outputVideoUrl,
        width: plan.width,
        height: plan.height,
        completedAt: new Date(),
      },
    });

    await trackEvent({
      eventType: "VIDEO_VIEW",
      userId: project.ownerUserId,
      songId: project.songId,
      meta: { renderJobId, videoProjectId },
    });

    await notifyUser(
      project.ownerUserId,
      "Video ready",
      "Your lyric video finished rendering.",
      { linkUrl: outputVideoUrl },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Render failed";
    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: {
        status: "FAILED",
        progress: 100,
        message,
        error: message,
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

function renderToFile(
  outPath: string,
  configure: (cmd: ffmpeg.FfmpegCommand) => ffmpeg.FfmpegCommand,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    configure(ffmpeg()).save(outPath).on("error", reject).on("end", () => resolve());
  });
}
