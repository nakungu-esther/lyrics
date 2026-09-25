import { Router } from "express";
import {
  GOSPEL_SUBGENRES,
  GOSPEL_VIDEO_TEMPLATE_CATALOG,
  SONG_GENRES,
} from "../lib/genreCatalog.js";

export const genresRouter = Router();

genresRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      genres: [...SONG_GENRES],
      gospelSubgenres: [...GOSPEL_SUBGENRES],
      gospelVideoTemplates: [...GOSPEL_VIDEO_TEMPLATE_CATALOG],
      note: "Genre and language are independent (e.g. Genre: Gospel, Language: Luganda).",
    },
  });
});
