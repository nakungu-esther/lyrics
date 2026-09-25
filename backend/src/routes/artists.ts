import { Router } from "express";

import multer from "multer";

import path from "node:path";

import { z } from "zod";

import { authenticate } from "../middleware/auth.js";

import { requireArtistProfile } from "../middleware/requireArtistProfile.js";

import { requireRole } from "../middleware/requireRole.js";

import { env } from "../config/env.js";

import { saveUploadedFile } from "../lib/storage.js";

import {

  artistCreateSchema,

  artistUpdateSchema,

} from "../lib/artistSocialLinks.js";

import {

  requestArtistVerification,

  searchArtistsByName,

} from "../services/artistClaimService.js";

import {

  ArtistServiceError,

  assertArtistOwner,

  createArtistProfile,

  getArtistDashboardStats,

  getArtistForUser,

  getPublicArtistById,

  toArtistPrivateView,

  updateArtistProfile,

} from "../services/artistService.js";

import {

  SongServiceError,

  listAlbumsForArtistUser,

  listSongsForArtistUser,

} from "../services/songService.js";



const UUID_RE =

  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;



const upload = multer({

  dest: path.join(env.storageRoot, "temp"),

  limits: { fileSize: 10 * 1024 * 1024 },

});



export const artistsRouter = Router();



artistsRouter.get("/search", authenticate, async (req, res) => {

  const q = String(req.query.q ?? "");

  const artists = await searchArtistsByName(q);

  res.json({ success: true, data: { artists } });

});



artistsRouter.get("/me", authenticate, async (req, res) => {

  const artist = await getArtistForUser(req.auth!.id);

  if (!artist) {

    res.json({ success: true, data: { artist: null } });

    return;

  }

  res.json({

    success: true,

    data: { artist: await toArtistPrivateView(artist) },

  });

});

artistsRouter.get(
  "/me/songs",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  requireArtistProfile,
  async (req, res) => {
    try {
      const songs = await listSongsForArtistUser(req.auth!.id);
      res.json({ success: true, data: { songs } });
    } catch (err) {
      if (err instanceof SongServiceError) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      throw err;
    }
  },
);

artistsRouter.get(
  "/me/albums",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  requireArtistProfile,
  async (req, res) => {
    try {
      const albums = await listAlbumsForArtistUser(req.auth!.id);
      res.json({ success: true, data: { albums } });
    } catch (err) {
      if (err instanceof SongServiceError) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      throw err;
    }
  },
);

artistsRouter.post("/", authenticate, async (req, res) => {

  const parsed = artistCreateSchema.safeParse(req.body);

  if (!parsed.success) {

    res.status(400).json({

      success: false,

      message: "Validation failed",

      errors: [parsed.error.flatten()],

    });

    return;

  }



  try {

    const artist = await createArtistProfile(req.auth!.id, parsed.data);

    res.status(201).json({ success: true, data: { artist } });

  } catch (err) {

    if (err instanceof ArtistServiceError) {

      const status = err.code === "ARTIST_EXISTS" ? 409 : 400;

      res.status(status).json({ success: false, message: err.message });

      return;

    }

    throw err;

  }

});



artistsRouter.patch("/me", authenticate, async (req, res) => {

  const parsed = artistUpdateSchema.safeParse(req.body);

  if (!parsed.success) {

    res.status(400).json({

      success: false,

      message: "Validation failed",

      errors: [parsed.error.flatten()],

    });

    return;

  }



  try {

    const artist = await updateArtistProfile(req.auth!.id, parsed.data);

    res.json({ success: true, data: { artist } });

  } catch (err) {

    if (err instanceof ArtistServiceError) {

      const status = err.code === "NOT_FOUND" ? 404 : 403;

      res.status(status).json({ success: false, message: err.message });

      return;

    }

    throw err;

  }

});



artistsRouter.post("/me", authenticate, (_req, res) => {

  res.status(410).json({

    success: false,

    message: "Use POST /api/v1/artists with your artist details",

  });

});



artistsRouter.post(

  "/me/upload-image",

  authenticate,

  requireArtistProfile,

  upload.single("file"),

  async (req, res) => {

    if (!req.file) {

      res.status(400).json({ success: false, message: "No file uploaded" });

      return;

    }

    const kind = (req.body.kind as string) === "cover" ? "cover" : "profile";

    const artist = req.artist!;

    const ext = path.extname(req.file.originalname) || ".jpg";

    const key = `images/artists/${artist.id}/${kind}${ext}`;

    const url = await saveUploadedFile(req.file.path, key);

    const updated = await updateArtistProfile(req.auth!.id, {

      ...(kind === "cover" ? { coverImageUrl: url } : { profileImageUrl: url }),

    });

    res.json({ success: true, data: { url, artist: updated } });

  },

);



artistsRouter.get(

  "/me/dashboard",

  authenticate,

  requireRole("ARTIST", "ADMIN"),

  requireArtistProfile,

  async (req, res) => {

    const stats = await getArtistDashboardStats(req.artist!.id);

    const row = await getArtistForUser(req.auth!.id);

    const artist = row ? await toArtistPrivateView(row) : null;

    res.json({ success: true, data: { stats, artist } });

  },

);



const claimSchema = z.object({ evidence: z.string().max(5000).optional() });



artistsRouter.post("/:id/verify-request", authenticate, async (req, res) => {

  const id = String(req.params.id);

  if (!UUID_RE.test(id)) {

    res.status(400).json({ success: false, message: "Invalid artist id" });

    return;

  }



  try {

    await assertArtistOwner(id, req.auth!.id);

  } catch (err) {

    if (err instanceof ArtistServiceError) {

      const status = err.code === "NOT_FOUND" ? 404 : 403;

      res.status(status).json({ success: false, message: err.message });

      return;

    }

    throw err;

  }



  const parsed = claimSchema.safeParse(req.body);

  if (!parsed.success) {

    res.status(400).json({ success: false, message: "Validation failed" });

    return;

  }



  try {

    const verification = await requestArtistVerification(

      id,

      req.auth!.id,

      parsed.data.evidence,

    );

    res.status(201).json({ success: true, data: { verification } });

  } catch (e) {

    const msg = e instanceof Error ? e.message : "Error";

    const status = msg === "FORBIDDEN" ? 403 : msg === "NOT_FOUND" ? 404 : 400;

    res.status(status).json({ success: false, message: msg });

  }

});



/** Public artist profile — must be registered after /me and other literal paths */

artistsRouter.get("/:id", async (req, res) => {

  const id = String(req.params.id);

  if (!UUID_RE.test(id)) {

    res.status(404).json({ success: false, message: "Artist not found" });

    return;

  }



  const artist = await getPublicArtistById(id);

  if (!artist) {

    res.status(404).json({ success: false, message: "Artist not found" });

    return;

  }



  res.json({ success: true, data: { artist } });

});


