import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requireAuthSecrets } from "./config/env.js";
import { adminRouter } from "./routes/admin.js";
import { analyticsRouter } from "./routes/analytics.js";
import { authRouter } from "./routes/auth.js";
import { billingRouter } from "./routes/billing.js";
import { creatorRouter } from "./routes/creator.js";
import { studioRouter } from "./routes/studio.js";
import { artistsRouter } from "./routes/artists.js";
import { filesRouter } from "./routes/files.js";
import { healthRouter } from "./routes/health.js";
import { jobsRouter } from "./routes/jobs.js";
import { notificationsRouter } from "./routes/notifications.js";
import { playlistsRouter } from "./routes/playlists.js";
import { languagesRouter } from "./routes/languages.js";
import { genresRouter } from "./routes/genres.js";
import { lyricsRouter } from "./routes/lyrics.js";
import { publicCatalogRouter } from "./routes/publicCatalog.js";
import { renderJobsRouter } from "./routes/renderJobs.js";
import { searchRouter } from "./routes/search.js";
import { videoProjectsRouter } from "./routes/videoProjects.js";
import { videoTemplatesRouter } from "./routes/videoTemplates.js";
import { songsRouter } from "./routes/songs.js";
import { uploadsRouter } from "./routes/uploads.js";
import { usersRouter } from "./routes/users.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(): express.Application {
  requireAuthSecrets();
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use("/api/v1/uploads", uploadsRouter);
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/artists", artistsRouter);
  app.use("/api/v1/songs", songsRouter);
  app.use("/api/v1/jobs", jobsRouter);
  app.use("/api/v1/files", filesRouter);
  app.use("/api/v1/languages", languagesRouter);
  app.use("/api/v1/genres", genresRouter);
  app.use("/api/v1/lyrics", lyricsRouter);
  app.use("/api/v1/public", publicCatalogRouter);
  app.use("/api/v1/search", searchRouter);
  app.use("/api/v1/creator", creatorRouter);
  app.use("/api/v1/studio", studioRouter);
  app.use("/api/v1/video-templates", videoTemplatesRouter);
  app.use("/api/v1/video-projects", videoProjectsRouter);
  app.use("/api/v1/render-jobs", renderJobsRouter);
  app.use("/api/v1/playlists", playlistsRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/analytics", analyticsRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/billing", billingRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
  });

  app.use(errorHandler);

  return app;
}
