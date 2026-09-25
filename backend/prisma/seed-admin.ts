/**
 * Upsert a platform admin (and optional artist profile for song uploads).
 *
 *   npm run db:seed-admin
 *
 * Env (backend/.env):
 *   SEED_ADMIN_EMAIL=
 *   SEED_ADMIN_PASSWORD=
 *   SEED_ADMIN_FIRST_NAME=
 *   SEED_ADMIN_LAST_NAME=
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendRoot, ".env") });
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";
const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@lyricshub.local").trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin123!";
const firstName = process.env.SEED_ADMIN_FIRST_NAME?.trim() || "Platform";
const lastName = process.env.SEED_ADMIN_LAST_NAME?.trim() || "Admin";

if (password.length < 8) {
  console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const passwordHash = await hashPassword(password);

const user = await prisma.user.upsert({
  where: { email },
  create: {
    email,
    passwordHash,
    role: "ADMIN",
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    isActive: true,
    emailVerifiedAt: new Date(),
  },
  update: {
    passwordHash,
    role: "ADMIN",
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    isActive: true,
    suspendedAt: null,
  },
});

let artist = await prisma.artist.findFirst({
  where: { ownerUserId: user.id },
});

if (!artist) {
  const slugBase = "platform-admin";
  let slug = slugBase;
  let n = 0;
  while (await prisma.artist.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }
  artist = await prisma.artist.create({
    data: {
      ownerUserId: user.id,
      slug,
      name: "LyricsHub Admin",
      biography: "Seeded administrator account with artist access for testing.",
      isVerified: true,
    },
  });
  await prisma.artistVerification.create({
    data: {
      artistId: artist.id,
      requestedByUserId: user.id,
      status: "VERIFIED",
      reviewedByUserId: user.id,
      reviewedAt: new Date(),
      evidence: "Seeded admin",
    },
  });
}

console.log("Admin user ready:");
console.log(`  Email:    ${email}`);
console.log(`  Role:     ADMIN`);
console.log(`  User id:  ${user.id}`);
console.log(`  Artist:   ${artist.name} (${artist.slug})`);
console.log("");
console.log("Login at http://127.0.0.1:5173/login then open /admin");
console.log("Change SEED_ADMIN_PASSWORD in backend/.env and re-run seed in production.");

await prisma.$disconnect();
