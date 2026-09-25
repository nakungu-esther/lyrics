import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL?.trim() ?? "";
if (!url) {
  console.error("FAIL: DATABASE_URL is empty (load backend/.env from backend cwd).");
  process.exit(1);
}

console.log(`DATABASE_URL: set (${url.length} chars), host hint: ${safeHost(url)}`);

const prisma = new PrismaClient();
try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("OK: Database connected.");
} catch (err) {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

function safeHost(connectionUrl: string): string {
  try {
    const u = new URL(connectionUrl.replace(/^postgresql:/, "http:"));
    return u.hostname;
  } catch {
    return "(could not parse URL — check format)";
  }
}
