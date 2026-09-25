import type { NextFunction, Request, Response } from "express";
import { getArtistForUser } from "../services/artistService.js";
import { roleAtLeast } from "../lib/permissions.js";

/**
 * Requires authenticated ARTIST (or ADMIN) with an existing artist profile.
 */
export async function requireArtistProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  if (req.auth.role !== "ADMIN" && !roleAtLeast(req.auth.role, "ARTIST")) {
    res.status(403).json({
      success: false,
      message: "Artist account required",
    });
    return;
  }

  const artist = await getArtistForUser(req.auth.id);
  if (!artist) {
    res.status(404).json({
      success: false,
      message: "Create your artist profile first",
      error: { code: "NO_ARTIST_PROFILE" },
    });
    return;
  }

  req.artist = { id: artist.id, slug: artist.slug, name: artist.name };
  next();
}
