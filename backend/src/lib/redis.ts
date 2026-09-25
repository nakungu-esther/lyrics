import { Redis } from "ioredis";
import { env } from "../config/env.js";

let shared: Redis | null = null;
let lastRedisErrorLogAt = 0;
/** When false, queues use inline fallbacks (API stays up without Redis). */
let redisQueueEnabled: boolean | null = null;

function markRedisUnavailable(reason: string): void {
  redisQueueEnabled = false;
  const now = Date.now();
  if (now - lastRedisErrorLogAt < 15_000) return;
  lastRedisErrorLogAt = now;
  console.warn(`[redis] ${reason} — background jobs will run inline in the API until Redis is back.`);
}

/** Whether BullMQ should be used (false → inline processing in API process). */
export async function canUseRedisQueue(): Promise<boolean> {
  if (!env.redisUrl?.trim()) return false;
  if (redisQueueEnabled === false) return false;
  if (redisQueueEnabled === true) return true;
  const ok = await pingRedis();
  redisQueueEnabled = ok;
  if (!ok) {
    markRedisUnavailable("Not reachable at startup check");
  }
  return ok;
}

export function invalidateRedisQueueCache(): void {
  redisQueueEnabled = null;
}

/** Called once at API boot after pingRedis(). */
export function setRedisQueueEnabledFromBoot(ok: boolean): void {
  redisQueueEnabled = ok;
}

/** Single shared Redis connection for BullMQ (maxRetriesPerRequest must be null). */
export function getRedisConnection(): Redis | null {
  if (!env.redisUrl?.trim()) return null;
  if (redisQueueEnabled === false) return null;
  if (!shared) {
    shared = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 8) {
          markRedisUnavailable("Max reconnect attempts exceeded");
          return null;
        }
        return Math.min(times * 250, 3_000);
      },
    });
    shared.on("error", (err) => {
      const now = Date.now();
      if (now - lastRedisErrorLogAt < 15_000) return;
      lastRedisErrorLogAt = now;
      console.error("[redis] connection error:", err.message);
    });
    shared.on("close", () => {
      markRedisUnavailable("Connection closed");
    });
  }
  return shared;
}

/** One-off connectivity check (does not use the shared BullMQ connection). */
export async function pingRedis(): Promise<boolean> {
  if (!env.redisUrl?.trim()) return false;
  const probe = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 4_000,
    lazyConnect: true,
    retryStrategy: () => null,
  });
  probe.on("error", () => {});
  try {
    await probe.connect();
    const pong = await probe.ping();
    await probe.quit();
    return pong === "PONG";
  } catch {
    probe.disconnect();
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (shared) {
    try {
      await shared.quit();
    } catch {
      shared.disconnect();
    }
    shared = null;
  }
  invalidateRedisQueueCache();
}
