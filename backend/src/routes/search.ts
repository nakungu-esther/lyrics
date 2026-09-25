import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const querySchema = z.object({
  q: z.string().max(200).optional(),
  language: z.string().max(16).optional(),
  genre: z.string().max(80).optional(),
  subgenre: z.string().max(80).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  artist: z.string().max(120).optional(),
  type: z.enum(["all", "songs", "artists", "albums", "lyrics"]).optional(),
});

export const searchRouter = Router();

searchRouter.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }

  const { q, language, genre, subgenre, year, artist, type = "all" } = parsed.data;
  const term = q?.trim();

  const songWhere = {
    status: "PUBLISHED" as const,
    ...(genre ? { genre: { equals: genre, mode: "insensitive" as const } } : {}),
    ...(subgenre ? { subgenre: { equals: subgenre, mode: "insensitive" as const } } : {}),
    ...(language
      ? {
          OR: [
            { primaryLanguageCode: language },
            { detectedLanguageCode: language },
          ],
        }
      : {}),
    ...(year
      ? {
          releaseDate: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        }
      : {}),
    ...(term
      ? {
          OR: [
            { title: { contains: term, mode: "insensitive" as const } },
            { description: { contains: term, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(artist
      ? {
          artist: {
            name: { contains: artist, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [songs, artists, albums, lyricLines] = await Promise.all([
    type === "all" || type === "songs"
      ? prisma.song.findMany({
          where: songWhere,
          take: 20,
          orderBy: { publishedAt: "desc" },
          include: {
            artist: { select: { id: true, name: true, slug: true } },
          },
        })
      : [],
    type === "all" || type === "artists"
      ? prisma.artist.findMany({
          where: term
            ? {
                OR: [
                  { name: { contains: term, mode: "insensitive" } },
                  { biography: { contains: term, mode: "insensitive" } },
                ],
              }
            : {},
          take: 20,
          orderBy: { name: "asc" },
        })
      : [],
    type === "all" || type === "albums"
      ? prisma.album.findMany({
          where: {
            ...(term
              ? { title: { contains: term, mode: "insensitive" } }
              : {}),
            ...(artist
              ? {
                  artist: {
                    name: { contains: artist, mode: "insensitive" },
                  },
                }
              : {}),
          },
          take: 20,
          include: { artist: { select: { name: true, slug: true } } },
        })
      : [],
    type === "all" || type === "lyrics"
      ? prisma.lyricLine.findMany({
          where: {
            ...(term
              ? { text: { contains: term, mode: "insensitive" } }
              : {}),
            section: {
              lyrics: {
                isActive: true,
                song: {
                  status: "PUBLISHED",
                  ...(language ? { primaryLanguageCode: language } : {}),
                },
              },
            },
          },
          take: 30,
          include: {
            section: {
              include: {
                lyrics: {
                  include: {
                    song: {
                      include: {
                        artist: { select: { name: true, slug: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        })
      : [],
  ]);

  res.json({
    query: { q: term, language, genre, subgenre, year, artist, type },
    results: {
      songs,
      artists,
      albums,
      lyrics: lyricLines.map((line) => ({
        id: line.id,
        text: line.text,
        song: line.section.lyrics.song,
      })),
    },
  });
});
