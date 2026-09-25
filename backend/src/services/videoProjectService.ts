import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  mergeVideoStyle,
  parseVideoTemplateConfig,
  videoCustomizationSchema,
  type VideoTemplateConfig,
} from "../lib/videoStyle.js";
import { getActiveLyrics } from "./lyricsService.js";

export async function listArtistSongsForVideo(artistId: string) {
  return prisma.song.findMany({
    where: {
      artistId,
      audioUrl: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      mediaSource: true,
      backgroundVideoUrl: true,
      lyrics: {
        where: { isActive: true },
        select: { id: true, status: true, version: true },
      },
    },
  });
}

export async function createVideoProject(input: {
  ownerUserId: string;
  artistId: string;
  songId: string;
  lyricsId: string;
  templateId: string;
  initialExportFormat?: "CANVAS_4_3" | "YOUTUBE_16_9" | "TIKTOK_9_16" | "REELS_9_16" | "SQUARE_1_1";
}) {
  const song = await prisma.song.findFirst({
    where: { id: input.songId, artistId: input.artistId },
  });
  if (!song) throw new Error("SONG_NOT_FOUND");

  const lyrics = await prisma.lyrics.findFirst({
    where: { id: input.lyricsId, songId: input.songId, isActive: true },
  });
  if (!lyrics) throw new Error("LYRICS_NOT_FOUND");

  const template = await prisma.videoTemplate.findFirst({
    where: { id: input.templateId, isActive: true },
  });
  if (!template) throw new Error("TEMPLATE_NOT_FOUND");

  const config = template.config as VideoTemplateConfig;
  const customizations = mergeVideoStyle(config, null);
  const exportHint =
    input.initialExportFormat ?? config.suggestedExportFormat ?? "CANVAS_4_3";

  return prisma.videoProject.create({
    data: {
      songId: input.songId,
      lyricsId: input.lyricsId,
      templateId: input.templateId,
      ownerUserId: input.ownerUserId,
      customizations: {
        ...customizations,
        preferredExportFormat: exportHint,
      } as Prisma.InputJsonValue,
    },
    include: {
      song: { select: { id: true, title: true, audioUrl: true, backgroundVideoUrl: true } },
      template: true,
      lyrics: { select: { id: true, status: true } },
    },
  });
}

export async function getVideoProjectForOwner(projectId: string, ownerUserId: string) {
  const project = await prisma.videoProject.findFirst({
    where: { id: projectId, ownerUserId },
    include: {
      song: true,
      template: true,
      lyrics: { select: { id: true, status: true } },
      renderJobs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!project) return null;

  const lyricsFull = await getActiveLyrics(project.songId);
  const config = project.template.config as VideoTemplateConfig;
  const style = mergeVideoStyle(config, project.customizations);

  const templateConfig = parseVideoTemplateConfig(config);

  return { project, lyrics: lyricsFull, style, templateConfig };
}

export async function updateVideoCustomizations(
  projectId: string,
  ownerUserId: string,
  patch: unknown,
) {
  const project = await prisma.videoProject.findFirst({
    where: { id: projectId, ownerUserId },
    include: { template: true },
  });
  if (!project) throw new Error("NOT_FOUND");

  const config = project.template.config as VideoTemplateConfig;
  const current = mergeVideoStyle(config, project.customizations);
  const merged = videoCustomizationSchema.parse({ ...current, ...(patch as object) });

  return prisma.videoProject.update({
    where: { id: projectId },
    data: { customizations: merged as Prisma.InputJsonValue },
    include: { template: true, song: true },
  });
}

export async function changeVideoProjectTemplate(
  projectId: string,
  ownerUserId: string,
  templateId: string,
): Promise<void> {
  const project = await prisma.videoProject.findFirst({
    where: { id: projectId, ownerUserId },
    include: { template: true },
  });
  if (!project) throw new Error("NOT_FOUND");

  const template = await prisma.videoTemplate.findFirst({
    where: { id: templateId, isActive: true },
  });
  if (!template) throw new Error("TEMPLATE_NOT_FOUND");

  const config = template.config as VideoTemplateConfig;
  const customizations = mergeVideoStyle(config, null);

  await prisma.videoProject.update({
    where: { id: projectId },
    data: {
      templateId,
      customizations: customizations as Prisma.InputJsonValue,
    },
  });
}

export async function listVideoProjects(ownerUserId: string) {
  return prisma.videoProject.findMany({
    where: { ownerUserId },
    orderBy: { updatedAt: "desc" },
    include: {
      song: { select: { id: true, title: true, coverImageUrl: true } },
      template: { select: { slug: true, name: true } },
      renderJobs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}
