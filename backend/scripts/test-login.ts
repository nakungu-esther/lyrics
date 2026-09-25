import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

const email = process.env.SEED_ADMIN_EMAIL?.trim() || "admin@nyimba.local";
const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMeAdmin123!";

const { loginUser } = await import("../src/services/authService.js");

try {
  const result = await loginUser({ email, password });
  console.log("Login OK:", result.user.email, result.user.role);
} catch (e) {
  console.error("Login failed:", e instanceof Error ? e.message : e);
  process.exit(1);
}

const { prisma } = await import("../src/lib/prisma.js");
await prisma.$disconnect();
