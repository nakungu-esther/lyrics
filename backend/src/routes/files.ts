import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { absolutePath } from "../lib/storage.js";

export const filesRouter = Router();

/** Serves object-storage keys from local disk (dev / single-node). */
filesRouter.get("/*", (req, res) => {
  const key = req.path.replace(/^\//, "");
  if (!key || key.includes("..")) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid path" } });
    return;
  }

  const filePath = absolutePath(key);
  if (!filePath.startsWith(path.resolve(env.storageRoot))) {
    res.status(403).end();
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "File not found" } });
    return;
  }

  res.sendFile(filePath);
});
