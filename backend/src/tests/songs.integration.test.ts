import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
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

describe("song management API", { skip: !dbReady }, () => {
  const app = createApp();
  let artistToken = "";
  let otherToken = "";
  let songId = "";

  before(async () => {
    await deleteTestUsersByEmail(["song-a@test.com", "song-b@test.com"]);
    const hash = await hashPassword("password123");
    const artistUser = await prisma.user.create({
      data: {
        email: "song-a@test.com",
        passwordHash: hash,
        role: "ARTIST",
        firstName: "A",
        lastName: "Artist",
      },
    });
    await prisma.artist.create({
      data: {
        ownerUserId: artistUser.id,
        slug: "song-artist-a",
        name: "Song Artist A",
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        email: "song-b@test.com",
        passwordHash: hash,
        role: "USER",
        firstName: "B",
        lastName: "User",
      },
    });
    artistToken = await signAccessToken({
      sub: artistUser.id,
      email: artistUser.email,
      role: "ARTIST",
    });
    otherToken = await signAccessToken({
      sub: otherUser.id,
      email: otherUser.email,
      role: "USER",
    });
  });

  after(async () => {
    await deleteTestUsersByEmail(["song-a@test.com", "song-b@test.com"]);
    await prisma.$disconnect();
  });

  it("rejects unauthenticated create", async () => {
    const res = await request(app).post("/api/v1/songs").send({ title: "X" });
    assert.equal(res.status, 401);
  });

  it("USER cannot create songs", async () => {
    const res = await request(app)
      .post("/api/v1/songs")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Blocked" });
    assert.equal(res.status, 403);
  });

  it("artist creates DRAFT song", async () => {
    const res = await request(app)
      .post("/api/v1/songs")
      .set("Authorization", `Bearer ${artistToken}`)
      .send({ title: "My Draft Song", genre: "Afrobeat" });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.song.status, "DRAFT");
    songId = res.body.data.song.id as string;
  });

  it("lists songs on artists/me/songs", async () => {
    const res = await request(app)
      .get("/api/v1/artists/me/songs")
      .set("Authorization", `Bearer ${artistToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.songs.length >= 1);
  });

  it("owner can GET draft", async () => {
    const res = await request(app)
      .get(`/api/v1/songs/${songId}`)
      .set("Authorization", `Bearer ${artistToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.song.title, "My Draft Song");
  });

  it("public cannot GET draft", async () => {
    const res = await request(app).get(`/api/v1/songs/${songId}`);
    assert.equal(res.status, 404);
  });

  it("artist updates own song", async () => {
    const res = await request(app)
      .patch(`/api/v1/songs/${songId}`)
      .set("Authorization", `Bearer ${artistToken}`)
      .send({ description: "Updated" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.song.description, "Updated");
  });

  it("other user cannot patch song", async () => {
    const res = await request(app)
      .patch(`/api/v1/songs/${songId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hack" });
    assert.equal(res.status, 403);
  });

  it("artist deletes song", async () => {
    const res = await request(app)
      .delete(`/api/v1/songs/${songId}`)
      .set("Authorization", `Bearer ${artistToken}`);
    assert.equal(res.status, 200);
  });
});
