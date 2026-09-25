import type { NextFunction, Request, Response } from "express";
import { getArtistForUser } from "../services/artistService.js";

declare global {
  namespace Express {
    interface Request {
      artist?: { id: string; slug: string; name: string };
    }
  }
}

export async function loadArtist(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Login required" } });
    return;
  }
  const artist = await getArtistForUser(req.auth.id);
  if (!artist) {
    res.status(404).json({
      error: { code: "NO_ARTIST_PROFILE", message: "Create your artist profile first" },
    });
    return;
  }
  req.artist = { id: artist.id, slug: artist.slug, name: artist.name };
  next();
}

export {};