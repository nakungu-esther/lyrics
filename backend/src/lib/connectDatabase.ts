import { prisma } from "./prisma.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Ping Postgres with retries (Neon cold start / idle disconnect). */
export async function connectDatabase(maxAttempts = 4): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        /closed|can't reach|connect|ECONNREFUSED|timeout|P1001|P1017/i.test(msg);
      if (!retryable || attempt === maxAttempts) {
        return false;
      }
      await prisma.$disconnect().catch(() => undefined);
      await sleep(1500 * attempt);
    }
  }
  return false;
}

/** Re-open pool after Neon dropped an idle connection. */
export async function reconnectDatabaseIfNeeded(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    await connectDatabase(2);
  }
}

let keepAliveTimer: ReturnType<typeof setInterval> | undefined;

export function startDatabaseKeepAlive(intervalMs = 4 * 60 * 1000): void {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(() => {
    void prisma.$queryRaw`SELECT 1`.catch(() => reconnectDatabaseIfNeeded());
  }, intervalMs);
  keepAliveTimer.unref?.();
}
