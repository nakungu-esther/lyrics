import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../lib/prisma.js";
import { reviewArtistVerification } from "../services/artistClaimService.js";
import { ensureVideoTemplates } from "../services/videoTemplateService.js";

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole("ADMIN"));

adminRouter.get("/overview", async (_req, res) => {
  const [users, artists, songs, reports, verifications, templates] = await Promise.all([
    prisma.user.count(),
    prisma.artist.count(),
    prisma.song.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.artistVerification.count({ where: { status: "PENDING" } }),
    prisma.videoTemplate.count(),
  ]);
  res.json({
    stats: { users, artists, songs, openReports: reports, pendingVerifications: verifications, templates },
  });
});

adminRouter.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      role: true,
      displayName: true,
      suspendedAt: true,
      subscriptionPlan: true,
      createdAt: true,
    },
  });
  res.json({ users });
});

adminRouter.post("/users/:id/suspend", async (req, res) => {
  await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { suspendedAt: new Date() },
  });
  res.json({ ok: true });
});

adminRouter.post("/users/:id/unsuspend", async (req, res) => {
  await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { suspendedAt: null },
  });
  res.json({ ok: true });
});

adminRouter.get("/artists", async (_req, res) => {
  const artists = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    take: 100,
    include: { owner: { select: { email: true } } },
  });
  res.json({ artists });
});

adminRouter.get("/songs", async (_req, res) => {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { artist: { select: { name: true } } },
  });
  res.json({ songs });
});

adminRouter.delete("/songs/:id", async (req, res) => {
  await prisma.song.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});

adminRouter.get("/reports", async (_req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ reports });
});

adminRouter.patch("/reports/:id", async (req, res) => {
  const schema = z.object({
    status: z.enum(["OPEN", "REVIEWED", "DISMISSED", "ACTION_TAKEN"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }
  const report = await prisma.report.update({
    where: { id: String(req.params.id) },
    data: { status: parsed.data.status },
  });
  res.json({ report });
});

adminRouter.get("/verifications", async (_req, res) => {
  const items = await prisma.artistVerification.findMany({
    where: { status: "PENDING" },
    include: { artist: true, requestedBy: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ verifications: items });
});

adminRouter.post("/verifications/:id/approve", async (req, res) => {
  await reviewArtistVerification(String(req.params.id), req.auth!.id, true);
  res.json({ ok: true });
});

adminRouter.post("/verifications/:id/reject", async (req, res) => {
  await reviewArtistVerification(String(req.params.id), req.auth!.id, false);
  res.json({ ok: true });
});

adminRouter.get("/templates", async (_req, res) => {
  await ensureVideoTemplates();
  const templates = await prisma.videoTemplate.findMany({ orderBy: { name: "asc" } });
  res.json({ templates });
});

adminRouter.get("/languages", async (_req, res) => {
  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } });
  res.json({ languages });
});
