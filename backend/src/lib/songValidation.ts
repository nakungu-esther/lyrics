import { z } from "zod";
import { isKnownSongGenre, validateGenrePair } from "./genreCatalog.js";

const optionalDate = z  .string()
  .optional()
  .refine(
    (value) => {
      if (!value?.trim()) return true;
      const d = new Date(value);
      return !Number.isNaN(d.getTime());
    },
    { message: "Invalid release date" },
  );

const genreField = z
  .string()
  .max(80)
  .optional()
  .refine(
    (value) => {
      if (!value?.trim()) return true;
      return isKnownSongGenre(value.trim());
    },
    { message: "Unknown genre" },
  );

const subgenreField = z.string().max(80).optional();

function refineGenrePair<
  T extends { genre?: string; subgenre?: string },
>(data: T, ctx: z.RefinementCtx): void {
  const check = validateGenrePair(data.genre, data.subgenre);
  if (!check.ok) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.message, path: ["subgenre"] });
  }
}

export const createSongSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    genre: genreField,
    subgenre: subgenreField,
    releaseDate: optionalDate,
    albumId: z.string().uuid().optional().nullable(),
  })
  .superRefine(refineGenrePair);

export const updateSongSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    genre: genreField,
    subgenre: subgenreField,
    releaseDate: optionalDate,
    albumId: z.string().uuid().optional().nullable(),
  })
  .superRefine(refineGenrePair);
export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;
