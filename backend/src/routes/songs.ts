import { Router } from "express";

import multer from "multer";

import path from "node:path";

import { v4 as uuidv4 } from "uuid";

import { z } from "zod";

import { authenticate, optionalAuthenticate } from "../middleware/auth.js";

import { loadArtist } from "../middleware/loadArtist.js";

import { requireRole } from "../middleware/requireRole.js";

import { env } from "../config/env.js";

import { prisma } from "../lib/prisma.js";

import { createSongSchema, updateSongSchema } from "../lib/songValidation.js";

import { uniqueSongSlug } from "../lib/slug.js";

import { saveUploadedFile } from "../lib/storage.js";


import { createAndEnqueueJob, enqueuePipelineJob } from "../queues/songProcessing.js";
import { createAudioProcessingJob } from "../services/processingJobService.js";

import { getArtistForUser } from "../services/artistService.js";


import {

  SongServiceError,

  createSongDraft,

  deleteSongForUser,

  getSongForOptionalOwner,

  getSongForUser,

  listSongsForArtistUser,

  updateSongForUser,

} from "../services/songService.js";

import { saveMusicVideoUpload } from "../worker/processMusicVideo.js";



const upload = multer({

  dest: path.join(env.storageRoot, "temp"),

  limits: { fileSize: 100 * 1024 * 1024 },

});



const videoUpload = multer({

  dest: path.join(env.storageRoot, "temp"),

  limits: { fileSize: 500 * 1024 * 1024 },

});



export const songsRouter = Router();



function mapSongError(err: unknown, res: import("express").Response): boolean {

  if (err instanceof SongServiceError) {

    const status =

      err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 400;

    res.status(status).json({ success: false, message: err.message });

    return true;

  }

  return false;

}



songsRouter.get(
  "/me",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {

  try {

    const songs = await listSongsForArtistUser(req.auth!.id);

    res.json({ success: true, data: { songs } });

  } catch (err) {

    if (mapSongError(err, res)) return;

    throw err;

  }

  },
);

songsRouter.get(
  "/:id/language",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {
    try {
      const { getSongLanguageStatus } = await import("../services/songLanguageService.js");
      const data = await getSongLanguageStatus(String(req.params.id), req.auth!.id);
      res.json({ success: true, data });
    } catch (err) {
      if (mapSongError(err, res)) return;
      throw err;
    }
  },
);

songsRouter.get(
  "/:id/processing-status",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {
    try {
      const { getAudioProcessingStatus } = await import(
        "../services/processingJobService.js"
      );
      const data = await getAudioProcessingStatus(String(req.params.id), req.auth!.id);
      res.json({
        success: true,
        data: {
          status: data.status,
          progress: data.progress,
          stage: data.stage,
          error: data.error,
          jobId: data.jobId,
          songStatus: data.songStatus,
          processedAudioReady: data.processedAudioReady,
        },
      });
    } catch (err) {
      if (mapSongError(err, res)) return;
      throw err;
    }
  },
);

songsRouter.post(
  "/:id/retry-processing",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {
    try {
      const { retryAudioProcessing } = await import("../services/processingJobService.js");
      const jobId = await retryAudioProcessing(String(req.params.id), req.auth!.id);
      res.json({ success: true, data: { jobId } });
    } catch (err) {
      if (mapSongError(err, res)) return;
      throw err;
    }
  },
);

songsRouter.get(
  "/:id/audio-url",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {
    try {
      const { getSongMediaDownloadUrl } = await import("../services/uploadService.js");
      const data = await getSongMediaDownloadUrl(
        String(req.params.id),
        req.auth!.id,
        "audio",
      );
      res.json({ success: true, data });
    } catch (err) {
      const { UploadServiceError } = await import("../services/uploadService.js");
      if (err instanceof UploadServiceError) {
        const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 400;
        res.status(status).json({ success: false, message: err.message });
        return;
      }
      throw err;
    }
  },
);

songsRouter.get(
  "/:id/cover-url",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {
    try {
      const { getSongMediaDownloadUrl } = await import("../services/uploadService.js");
      const data = await getSongMediaDownloadUrl(
        String(req.params.id),
        req.auth!.id,
        "cover",
      );
      res.json({ success: true, data });
    } catch (err) {
      const { UploadServiceError } = await import("../services/uploadService.js");
      if (err instanceof UploadServiceError) {
        const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 400;
        res.status(status).json({ success: false, message: err.message });
        return;
      }
      throw err;
    }
  },
);

songsRouter.delete(
  "/:id/media",
  authenticate,
  requireRole("ARTIST", "ADMIN"),
  async (req, res) => {
    const bodySchema = z.object({
      resourceType: z.enum(["SONG_AUDIO", "SONG_COVER", "MUSIC_VIDEO"]),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Validation failed" });
      return;
    }
    try {
      const { removeSongMedia } = await import("../services/uploadService.js");
      await removeSongMedia(String(req.params.id), req.auth!.id, parsed.data.resourceType);
      res.json({ success: true, data: { removed: true } });
    } catch (err) {
      if (mapSongError(err, res)) return;
      throw err;
    }
  },
);

/** Public or owner — drafts hidden from non-owners */
songsRouter.get("/:id", optionalAuthenticate, async (req, res) => {
  const song = await getSongForOptionalOwner(String(req.params.id), req.auth?.id);
  if (!song) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  res.json({ success: true, data: { song } });
});

songsRouter.use(authenticate);
songsRouter.use(requireRole("ARTIST", "ADMIN"));

songsRouter.post("/", async (req, res) => {

  const parsed = createSongSchema.safeParse(req.body);

  if (!parsed.success) {

    res.status(400).json({

      success: false,

      message: "Validation failed",

      errors: [parsed.error.flatten()],

    });

    return;

  }



  try {

    const song = await createSongDraft(req.auth!.id, parsed.data);

    res.status(201).json({ success: true, data: { song } });

  } catch (err) {

    if (mapSongError(err, res)) return;

    throw err;

  }

});



songsRouter.patch("/:id", async (req, res) => {

  const parsed = updateSongSchema.safeParse(req.body);

  if (!parsed.success) {

    res.status(400).json({

      success: false,

      message: "Validation failed",

      errors: [parsed.error.flatten()],

    });

    return;

  }



  try {

    const song = await updateSongForUser(String(req.params.id), req.auth!.id, parsed.data);

    res.json({ success: true, data: { song } });

  } catch (err) {

    if (mapSongError(err, res)) return;

    throw err;

  }

});



songsRouter.delete("/:id", async (req, res) => {

  try {

    await deleteSongForUser(String(req.params.id), req.auth!.id);

    res.json({ success: true, data: { deleted: true } });

  } catch (err) {

    if (mapSongError(err, res)) return;

    throw err;

  }

});



// ─── Media upload routes (later phases; not Step 6) ─────────────────────────



songsRouter.post(

  "/music-video",

  videoUpload.single("video"),

  async (req, res) => {

    const bodySchema = z.object({

      title: z.string().min(1).max(200),

      genre: z.string().max(80).optional(),

    });

    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {

      res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });

      return;

    }

    if (!req.file) {

      res.status(400).json({ error: { code: "VALIDATION", message: "Video file required" } });

      return;

    }



    const artist = await getArtistForUser(req.auth!.id);

    if (!artist) {

      res.status(403).json({ success: false, message: "Artist profile required" });

      return;

    }



    const slug = await uniqueSongSlug(artist.id, parsed.data.title, async (s) =>

      Boolean(await prisma.song.findFirst({ where: { artistId: artist.id, slug: s } })),

    );



    const songId = uuidv4();

    const sourceKey = await saveMusicVideoUpload(req.file.path, songId, req.file.originalname);



    const song = await prisma.song.create({

      data: {

        id: songId,

        artistId: artist.id,

        title: parsed.data.title.trim(),

        slug,

        genre: parsed.data.genre?.trim(),

        mediaSource: "MUSIC_VIDEO",

        status: "PROCESSING",

      },

    });



    await prisma.songArtist.create({

      data: { songId: song.id, artistId: artist.id, role: "primary" },

    });



    const job = await prisma.processingJob.create({

      data: {

        songId: song.id,

        jobType: "MUSIC_VIDEO",

        status: "QUEUED",

        progress: 0,

        message: "Uploading music video…",

      },

    });



    await enqueuePipelineJob({

      songId: song.id,

      jobId: job.id,

      jobType: "MUSIC_VIDEO",

      sourceRelativePath: sourceKey,

    });



    res.status(201).json({ song, job: { id: job.id, status: job.status } });

  },

);



const languageConfirmSchema = z.union([
  z.object({
    languages: z.array(z.string().min(2).max(32)).min(1),
  }),
  z.object({
    segments: z
      .array(
        z.object({
          language: z.string().min(2).max(32),
          startTime: z.number().min(0),
          endTime: z.number().positive(),
        }),
      )
      .min(1),
  }),
]);

songsRouter.post("/:id/language/confirm", loadArtist, async (req, res) => {
  const parsed = languageConfirmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed" });
    return;
  }

  const songId = String(req.params.id);
  const song = await prisma.song.findFirst({
    where: { id: songId, artistId: req.artist!.id },
  });
  if (!song) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }

  try {
    const { confirmSongLanguage } = await import("../services/songLanguageService.js");
    const data = await confirmSongLanguage(songId, req.auth!.id, parsed.data);
    res.json({ success: true, data });
  } catch (err) {
    if (mapSongError(err, res)) return;
    throw err;
  }
});

songsRouter.post("/:id/language/retry-detection", loadArtist, async (req, res) => {
  const songId = String(req.params.id);
  const song = await prisma.song.findFirst({
    where: { id: songId, artistId: req.artist!.id },
  });
  if (!song) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  try {
    const { retryLanguageDetectionJob } = await import(
      "../services/languageDetectionService.js"
    );
    const jobId = await retryLanguageDetectionJob(songId, req.auth!.id);
    res.json({ success: true, data: { jobId } });
  } catch (err) {
    if (mapSongError(err, res)) return;
    throw err;
  }
});



songsRouter.post(

  "/upload/with-audio",

  upload.fields([

    { name: "audio", maxCount: 1 },

    { name: "cover", maxCount: 1 },

  ]),

  async (req, res) => {

    const bodySchema = z.object({

      title: z.string().min(1).max(200),

      genre: z.string().max(80).optional(),

      releaseDate: z.string().optional(),

      albumTitle: z.string().max(200).optional(),

    });



    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {

      res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });

      return;

    }



    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const audioFile = files?.audio?.[0];

    if (!audioFile) {

      res.status(400).json({ error: { code: "VALIDATION", message: "Audio file required" } });

      return;

    }



    const artist = await getArtistForUser(req.auth!.id);

    if (!artist) {

      res.status(403).json({ success: false, message: "Artist profile required" });

      return;

    }



    const slug = await uniqueSongSlug(artist.id, parsed.data.title, async (s) =>

      Boolean(await prisma.song.findFirst({ where: { artistId: artist.id, slug: s } })),

    );



    let albumId: string | undefined;

    if (parsed.data.albumTitle?.trim()) {

      const album = await prisma.album.create({

        data: {

          artistId: artist.id,

          title: parsed.data.albumTitle.trim(),

        },

      });

      albumId = album.id;

    }



    const songId = uuidv4();

    const audioExt = path.extname(audioFile.originalname) || ".mp3";

    const sourceKey = `audio/${songId}/source${audioExt}`;

    await saveUploadedFile(audioFile.path, sourceKey);



    let coverImageUrl: string | undefined;

    const coverFile = files?.cover?.[0];

    if (coverFile) {

      const coverExt = path.extname(coverFile.originalname) || ".jpg";

      const coverKey = `images/songs/${songId}/cover${coverExt}`;

      coverImageUrl = await saveUploadedFile(coverFile.path, coverKey);

    }



    const song = await prisma.song.create({

      data: {

        id: songId,

        artistId: artist.id,

        albumId,

        title: parsed.data.title.trim(),

        slug,

        genre: parsed.data.genre?.trim(),

        releaseDate: parsed.data.releaseDate

          ? new Date(parsed.data.releaseDate)

          : undefined,

        coverImageUrl,

        audioObjectKey: sourceKey,

        status: "DRAFT",

      },

    });



    await prisma.songArtist.create({

      data: { songId: song.id, artistId: artist.id, role: "primary" },

    });



    const jobId = await createAudioProcessingJob(song.id);



    const job = await prisma.processingJob.findUniqueOrThrow({ where: { id: jobId } });



    res.status(201).json({

      song,

      job: { id: job.id, status: job.status, progress: job.progress, message: job.message },

    });

  },

);


