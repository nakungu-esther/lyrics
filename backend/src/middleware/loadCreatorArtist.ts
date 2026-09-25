import type { NextFunction, Request, Response } from "express";
import { ensureCreatorArtist } from "../services/artistService.js";

/** Any logged-in user can create clip-based lyric videos (creates a personal artist profile if needed). */
export async function loadCreatorArtist(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Login required" } });
    return;
  }
  try {
    const artist = await ensureCreatorArtist(req.auth.id);
    req.artist = { id: artist.id, slug: artist.slug, name: artist.name };
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start creator session";
    res.status(400).json({ error: { code: "BAD_REQUEST", message } });
  }
}
