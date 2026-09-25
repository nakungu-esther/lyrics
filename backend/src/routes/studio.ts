import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { getStudioPipelineStatus } from "../services/creatorStudioService.js";
import { getActiveLyrics } from "../services/lyricsService.js";
import { getVideoProjectForOwner } from "../services/videoProjectService.js";
import { assertSongOwnedByUser } from "../services/songService.js";

export const studioRouter = Router();

studioRouter.use(authenticate);

studioRouter.get("/songs/:songId", async (req, res) => {
  const songId = String(req.params.songId);
  try {
    await assertSongOwnedByUser(songId, req.auth!.id);
  } catch {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Song not found" } });
    return;
  }

  const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });
  const pipeline = await getStudioPipelineStatus(songId);
  const lyrics = await getActiveLyrics(songId);

  let editor = null;
  if (pipeline.projectId) {
    editor = await getVideoProjectForOwner(pipeline.projectId, req.auth!.id);
  }

  res.json({
    song: {
      id: song.id,
      title: song.title,
      creatorStudioMode: song.creatorStudioMode,
      audioUrl: song.audioUrl,
      backgroundVideoUrl: song.backgroundVideoUrl,
      durationSeconds: song.durationSeconds,
      detectedLanguageCode: song.detectedLanguageCode,
      languageConfirmed: song.languageConfirmed,
    },
    pipeline,
    lyrics,
    editor,
  });
});
