import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { SUPPORTED_LANGUAGES } from "../lib/languageCatalog.js";

export const languagesRouter = Router();

languagesRouter.get("/", async (_req, res) => {
  const rows = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  if (rows.length === 0) {
    res.json({
      languages: SUPPORTED_LANGUAGES.map((l) => ({
        code: l.code,
        name: l.name,
        flag: l.flag,
      })),
    });
    return;
  }

  res.json({
    languages: rows.map((r) => {
      const meta = SUPPORTED_LANGUAGES.find((l) => l.code === r.code);
      return {
        code: r.code,
        name: r.name,
        flag: meta?.flag ?? "🌐",
      };
    }),
  });
});
