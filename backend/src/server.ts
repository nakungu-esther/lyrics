import { createApp } from "./app.js";
import { env, requireDatabaseUrl } from "./config/env.js";
import { ensureStorageDirs } from "./lib/storage.js";
import { ensureVideoTemplates } from "./services/videoTemplateService.js";
import { connectDatabase, startDatabaseKeepAlive } from "./lib/connectDatabase.js";
import { pingRedis, setRedisQueueEnabledFromBoot } from "./lib/redis.js";

if (env.databaseUrl) {
  requireDatabaseUrl();
}

await ensureStorageDirs();

try {
  await ensureVideoTemplates();
} catch (err) {
  console.warn(
    "[Nyimba] Database not ready — set DATABASE_URL in backend/.env and run npm run db:migrate",
  );
  console.warn(err instanceof Error ? err.message : err);
}

if (env.databaseUrl) {
  const dbOk = await connectDatabase();
  if (dbOk) {
    console.log("[Nyimba] Database connected");
    startDatabaseKeepAlive();
  } else {
    console.warn(
      "[Nyimba] Cannot reach PostgreSQL (Neon). Auth and data routes will return 503 until this is fixed.",
    );
    console.warn(
      "  → Neon console: resume project if suspended, copy a fresh pooled connection string into backend/.env",
    );
    console.warn("  → Test: http://127.0.0.1:4000/api/v1/health/db");
  }
}

if (env.redisUrl) {
  const redisOk = await pingRedis();
  setRedisQueueEnabledFromBoot(redisOk);
  if (redisOk) {
    console.log("[Nyimba] Redis connected (background worker queues enabled)");
  } else {
    console.warn(
      "[Nyimba] Redis not reachable — uploads will still work; jobs run inline in this API process.",
    );
    console.warn("  → Start Redis: Docker Desktop + docker-compose up -d");
  }
} else {
  console.log("[Nyimba] REDIS_URL not set — jobs run inline in the API process");
}

const app = createApp();

const onListen = (): void => {
  const base = env.isProduction ? "0.0.0.0" : "127.0.0.1";
  console.log(`Nyimba listening on http://${base}:${env.port} (API)`);
  console.log(`Health: http://127.0.0.1:${env.port}/api/v1/health`);
};

const server = env.isProduction
  ? app.listen(env.port, onListen)
  : app.listen(env.port, "127.0.0.1", onListen);

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${env.port} is already in use. Stop the other API process, or run only one of:\n` +
        `  npm run dev          (from repo root — API + frontend)\n` +
        `  npm run dev:backend  (API only)\n\n` +
        `PowerShell — free port ${env.port}:\n` +
        `  Get-NetTCPConnection -LocalPort ${env.port} -State Listen | ` +
        `% { Stop-Process -Id $_.OwningProcess -Force }\n`,
    );
    process.exit(1);
  }
  throw err;
});
