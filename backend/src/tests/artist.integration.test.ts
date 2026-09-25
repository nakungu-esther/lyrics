import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/password.js";
import { signAccessToken } from "../lib/tokens.js";
import { deleteTestUsersByEmail } from "./testDbCleanup.js";

async function databaseReachable(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const dbReady = await databaseReachable();
const email = `artist-test-${Date.now()}@example.com`;
const otherEmail = `artist-other-${Date.now()}@example.com`;

describe("artist onboarding API", { skip: !dbReady }, () => {
  const app = createApp();
  let accessToken = "";
  let otherToken = "";
  let artistId = "";

  before(async () => {
    await deleteTestUsersByEmail([email, otherEmail]);
    const hash = await hashPassword("password123");
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        firstName: "Artist",
        lastName: "Test",
        role: "USER",
      },
    });
    const other = await prisma.user.create({
      data: {
        email: otherEmail,
        passwordHash: hash,
        firstName: "Other",
        lastName: "User",
        role: "USER",
      },
    });
    accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    otherToken = await signAccessToken({
      sub: other.id,
      email: other.email,
      role: other.role,
    });
  });

  after(async () => {
    await deleteTestUsersByEmail([email, otherEmail]);
    await prisma.$disconnect();
  });

  it("rejects unauthenticated create", async () => {
    const res = await request(app).post("/api/v1/artists").send({ name: "X" });
    assert.equal(res.status, 401);
  });

  it("creates artist profile", async () => {
    const res = await request(app)
      .post("/api/v1/artists")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Test Artist",
        biography: "Bio",
        genre: "Afrobeat",
        location: "Kampala",
        website: "https://example.com",
        socialLinks: { instagram: "https://instagram.com/test" },
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.artist.verification.status, "PENDING");
    assert.equal(res.body.data.artist.isVerified, false);
    artistId = res.body.data.artist.id as string;
  });

  it("rejects duplicate artist profile", async () => {
    const res = await request(app)
      .post("/api/v1/artists")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Another" });
    assert.equal(res.status, 409);
  });

  it("returns me profile for owner", async () => {
    const res = await request(app)
      .get("/api/v1/artists/me")
      .set("Authorization", `Bearer ${accessToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.artist.name, "Test Artist");
  });

  it("allows owner to patch profile", async () => {
    const res = await request(app)
      .patch("/api/v1/artists/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ biography: "Updated bio" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.artist.biography, "Updated bio");
  });

  it("forbids patching another users profile via id route", async () => {
    const res = await request(app)
      .patch("/api/v1/artists/me")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ name: "Hacked" });
    assert.equal(res.status, 404);
  });

  it("exposes public artist by id", async () => {
    const res = await request(app).get(`/api/v1/artists/${artistId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.artist.name, "Test Artist");
    assert.equal(res.body.data.artist.isVerified, false);
  });

  it("USER without profile cannot load artist dashboard", async () => {
    const res = await request(app)
      .get("/api/v1/artists/me/dashboard")
      .set("Authorization", `Bearer ${otherToken}`);
    assert.equal(res.status, 403);
  });

  it("ARTIST can load artist dashboard", async () => {
    const updated = await prisma.user.findUnique({ where: { email } });
    const token = await signAccessToken({
      sub: updated!.id,
      email: updated!.email,
      role: "ARTIST",
    });
    const res = await request(app)
      .get("/api/v1/artists/me/dashboard")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.stats);
  });
});
