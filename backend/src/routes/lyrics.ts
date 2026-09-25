import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { loadArtist } from "../middleware/loadArtist.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../lib/prisma.js";
import { buildLrcContent, lrcDownloadFilename } from "../lib/lrcExport.js";
import {
  approveLyrics,
  getActiveLyrics,
  saveLyricsDraft,
} from "../services/lyricsService.js";
import { retryTranscriptionForSong } from "../services/transcriptionJobService.js";
import { SongServiceError } from "../services/songService.js";

const editorSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().optional(),
      label: z.string().optional(),
      sectionType: z
        .enum([
          "VERSE",
          "CHORUS",
          "BRIDGE",
          "INTRO",
          "OUTRO",
          "PRE_CHORUS",
          "HOOK",
          "OTHER",
        ])
        .optional(),
      sortOrder: z.number().int(),
      lines: z.array(
        z.object({
          id: z.string().optional(),
          text: z.string(),
          sortOrder: z.number().int(),
          startTime: z.number().nullable().optional(),
          endTime: z.number().nullable().optional(),
          words: z
            .array(
              z.object({
                id: z.string().optional(),
                text: z.string(),
                sortOrder: z.number().int(),
                startTime: z.number(),
                endTime: z.number(),
              }),
            )
            .optional(),
        }),
      ),
    }),
  ),
});

export const lyricsRouter = Router();

lyricsRouter.use(authenticate);
lyricsRouter.use(requireRole("ARTIST", "ADMIN"));

lyricsRouter.post("/song/:songId/transcribe", loadArtist, async (req, res) => {
  const songId = String(req.params.songId);
  const song = await prisma.song.findFirst({
    where: { id: songId, artistId: req.artist!.id },
  });
  if (!song) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Song not found" } });
    return;
  }
  try {
    const { jobId } = await retryTranscriptionForSong(songId, req.auth!.id);
    res.json({ jobId });
  } catch (err) {
    if (err instanceof SongServiceError) {
      const status = err.code === "NOT_FOUND" ? 404 : 400;
      res.status(status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    const message = err instanceof Error ? err.message : "Failed";
    res.status(400).json({ error: { code: "VALIDATION", message } });
  }
});

lyricsRouter.get("/song/:songId/export.lrc", loadArtist, async (req, res) => {
  const songId = String(req.params.songId);
  const song = await prisma.song.findFirst({
    where: { id: songId, artistId: req.artist!.id },
    include: { artist: true },
  });
  if (!song) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Song not found" } });
    return;
  }
  const lyrics = await getActiveLyrics(songId);
  if (!lyrics) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "No lyrics yet" } });
    return;
  }
  const hasWords = lyrics.sections.some((s) =>
    s.lines.some((l) => l.words.length > 0),
  );
  const body = buildLrcContent(lyrics.sections, {
    title: song.title,
    artist: song.artist.name,
    enhanced: hasWords,
  });
  const filename = lrcDownloadFilename({ title: song.title, artist: song.artist.name });
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(body);
});

lyricsRouter.get("/song/:songId", loadArtist, async (req, res) => {
  const songId = String(req.params.songId);
  const song = await prisma.song.findFirst({
    where: { id: songId, artistId: req.artist!.id },
  });
  if (!song) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Song not found" } });
    return;
  }
  const lyrics = await getActiveLyrics(songId);
  res.json({ song, lyrics });
});

lyricsRouter.patch("/:lyricsId/draft", loadArtist, async (req, res) => {
  const parsed = editorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }
  try {
    const lyrics = await saveLyricsDraft(
      String(req.params.lyricsId),
      req.auth!.id,
      parsed.data,
      false,
    );
    res.json({ lyrics });
  } catch {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
  }
});

lyricsRouter.patch("/:lyricsId", loadArtist, async (req, res) => {
  const parsed = editorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }
  try {
    const lyrics = await saveLyricsDraft(
      String(req.params.lyricsId),
      req.auth!.id,
      parsed.data,
      true,
    );
    res.json({ lyrics });
  } catch {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
  }
});

lyricsRouter.post("/:lyricsId/approve", loadArtist, async (req, res) => {
  try {
    const lyrics = await approveLyrics(String(req.params.lyricsId), req.auth!.id);
    res.json({ lyrics });
  } catch {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
  }
});
