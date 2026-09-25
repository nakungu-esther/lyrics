import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  listPlaylists,
  removeSongFromPlaylist,
} from "../services/playlistService.js";

export const playlistsRouter = Router();

playlistsRouter.use(authenticate);

playlistsRouter.get("/me", async (req, res) => {
  const playlists = await listPlaylists(req.auth!.id);
  res.json({ playlists });
});

playlistsRouter.post("/", async (req, res) => {
  const schema = z.object({ title: z.string().min(1).max(120) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }
  const playlist = await createPlaylist(req.auth!.id, parsed.data.title);
  res.status(201).json({ playlist });
});

playlistsRouter.delete("/:id", async (req, res) => {
  const result = await deletePlaylist(req.auth!.id, String(req.params.id));
  res.json({ deleted: result.count > 0 });
});

playlistsRouter.post("/:id/songs", async (req, res) => {
  const schema = z.object({ songId: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }
  try {
    const playlists = await addSongToPlaylist(
      req.auth!.id,
      String(req.params.id),
      parsed.data.songId,
    );
    res.json({ playlists });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    res.status(400).json({ error: { code: "BAD_REQUEST", message: msg } });
  }
});

playlistsRouter.delete("/:id/songs/:songId", async (req, res) => {
  try {
    const playlists = await removeSongFromPlaylist(
      req.auth!.id,
      String(req.params.id),
      String(req.params.songId),
    );
    res.json({ playlists });
  } catch {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Playlist not found" } });
  }
});
