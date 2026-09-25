import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeDatabaseUrl } from "../lib/neonDatabaseUrl.js";

// Always load backend/.env (monorepo root `npm run dev` may use varying cwd).
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env.local"), override: true });

const rawDatabaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
if (databaseUrl && databaseUrl !== rawDatabaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export const env = {
  nodeEnv: optional(process.env.NODE_ENV, "development"),
  port: Number(optional(process.env.PORT, "4000")),
  databaseUrl,
  corsOrigin: optional(
    process.env.CORS_ORIGIN,
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
  ),
  isProduction: process.env.NODE_ENV === "production",
  jwtAccessSecret: optional(
    process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET,
    "dev-access-secret-change-me",
  ),
  jwtRefreshSecret: optional(
    process.env.JWT_REFRESH_SECRET,
    "dev-refresh-secret-change-me",
  ),
  accessTokenTtl: optional(
    process.env.JWT_ACCESS_TTL ?? process.env.JWT_EXPIRES_IN,
    "15m",
  ),
  refreshTokenTtlDays: Number(optional(process.env.JWT_REFRESH_TTL_DAYS, "30")),
  cookieSecure: process.env.COOKIE_SECURE === "true",
  redisUrl: process.env.REDIS_URL?.trim() ?? "",
  storageRoot: optional(process.env.STORAGE_ROOT, "storage"),
  publicBaseUrl: optional(process.env.PUBLIC_BASE_URL, "http://127.0.0.1:4000"),
  storageDriver: optional(process.env.STORAGE_DRIVER, "local") as "local" | "s3",
  storageEndpoint: process.env.STORAGE_ENDPOINT?.trim() ?? "",
  storageRegion: optional(process.env.STORAGE_REGION, "auto"),
  storageBucket: process.env.STORAGE_BUCKET?.trim() ?? "",
  storageAccessKey: process.env.STORAGE_ACCESS_KEY?.trim() ?? "",
  storageSecretKey: process.env.STORAGE_SECRET_KEY?.trim() ?? "",
  storageForcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
  uploadSigningSecret: optional(
    process.env.UPLOAD_SIGNING_SECRET ?? process.env.JWT_ACCESS_SECRET,
    "dev-upload-signing-secret",
  ),
  uploadUrlExpiresSeconds: Number(optional(process.env.UPLOAD_URL_EXPIRES_SECONDS, "900")),
  downloadUrlExpiresSeconds: Number(
    optional(process.env.DOWNLOAD_URL_EXPIRES_SECONDS, "900"),
  ),
  maxAudioFileSizeMb: Number(optional(process.env.MAX_AUDIO_FILE_SIZE_MB, "80")),
  maxVideoFileSizeMb: Number(optional(process.env.MAX_VIDEO_FILE_SIZE_MB, "500")),
  maxImageFileSizeMb: Number(optional(process.env.MAX_IMAGE_FILE_SIZE_MB, "15")),
  workerTempDir: process.env.WORKER_TEMP_DIR?.trim() ?? "",
  audioTargetSampleRate: Number(optional(process.env.AUDIO_TARGET_SAMPLE_RATE, "16000")),
  audioTargetChannels: Number(optional(process.env.AUDIO_TARGET_CHANNELS, "1")),
  bullmqJobAttempts: Number(optional(process.env.BULLMQ_JOB_ATTEMPTS, "3")),
  bullmqBackoffMs: Number(optional(process.env.BULLMQ_BACKOFF_MS, "5000")),
  mediaWorkerConcurrency: Number(optional(process.env.MEDIA_WORKER_CONCURRENCY, "2")),
  languageDetectionMode: optional(process.env.AI_LANGUAGE_DETECT_MODE, "demo") as "demo",
  languageDetectionConfidenceThreshold: Number(
    optional(process.env.LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD, "0.75"),
  ),
};

export function requireDatabaseUrl(): string {
  return required("DATABASE_URL", process.env.DATABASE_URL);
}

export function requireAuthSecrets(): void {
  if (env.isProduction) {
    required("JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET);
    required("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);
  }
}
