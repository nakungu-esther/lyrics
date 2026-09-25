import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { loadArtist } from "../middleware/loadArtist.js";
import { requireRole } from "../middleware/requireRole.js";
import { getArtistAnalytics } from "../services/analyticsService.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);
analyticsRouter.use(requireRole("ARTIST", "ADMIN"));

analyticsRouter.get("/artist/me", loadArtist, async (req, res) => {
  const stats = await getArtistAnalytics(req.artist!.id);
  res.json({ stats });
});
