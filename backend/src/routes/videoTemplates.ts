import { Router } from "express";
import { EXPORT_FORMAT_PRESETS } from "../lib/videoTemplateCatalog.js";
import { listActiveTemplates } from "../services/videoTemplateService.js";

export const videoTemplatesRouter = Router();

videoTemplatesRouter.get("/", async (_req, res) => {
  const templates = await listActiveTemplates();
  res.json({ templates, exportFormats: EXPORT_FORMAT_PRESETS });
});
