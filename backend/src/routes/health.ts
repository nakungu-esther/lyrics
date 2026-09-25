import { Router } from "express";
import { env } from "../config/env.js";
import { pingRedis } from "../lib/redis.js";
import { reconnectDatabaseIfNeeded } from "../lib/connectDatabase.js";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "nyimba-api",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/health/redis", async (_req, res) => {
  if (!env.redisUrl) {
    res.status(503).json({
      status: "not_configured",
      message: "REDIS_URL is not set",
    });
    return;
  }
  const ok = await pingRedis();
  if (ok) {
    res.json({ status: "ok", redis: "connected" });
    return;
  }
  res.status(503).json({ status: "error", message: "Redis unreachable" });
});

healthRouter.get("/health/ready", async (_req, res) => {
  const checks: Record<string, string> = { api: "ok" };

  if (env.databaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }
  } else {
    checks.database = "not_configured";
  }

  if (env.redisUrl) {
    checks.redis = (await pingRedis()) ? "ok" : "error";
  } else {
    checks.redis = "not_configured";
  }

  const healthy =
    checks.database === "ok" &&
    (checks.redis === "ok" || checks.redis === "not_configured");

  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded", checks });
});

healthRouter.get("/health/db", async (_req, res) => {
  if (!env.databaseUrl) {
    res.status(503).json({
      status: "not_configured",
      message: "DATABASE_URL is not set",
    });
    return;
  }

  try {
    await reconnectDatabaseIfNeeded();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({
      status: "error",
      message: err instanceof Error ? err.message : "Database unreachable",
    });
  }
});
