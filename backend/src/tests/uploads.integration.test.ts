import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import fs from "node:fs/promises";
import path from "node:path";
import { createApp } from "../app.js";
import { hashPassword } from "../lib/password.js";
import { absolutePath } from "../lib/storage.js";
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

describe("upload presign API", { skip: !dbReady }, () => {
  const app = createApp();
  let artistToken = "";
  let userToken = "";
  let songId = "";

  before(async () => {
    await deleteTestUsersByEmail(["up-a@test.com", "up-u@test.com"]);
    const hash = await hashPassword("password123");
    const artistUser = await prisma.user.create({
      data: {
        email: "up-a@test.com",
        passwordHash: hash,
        role: "ARTIST",
        firstName: "Up",
        lastName: "Artist",
      },
    });
    const artist = await prisma.artist.create({
      data: { ownerUserId: artistUser.id, slug: "up-artist", name: "Up Artist" },
    });
    const song = await prisma.song.create({
      data: {
        artistId: artist.id,
        title: "Upload Test",
        slug: "upload-test",
        status: "DRAFT",
      },
    });
    songId = song.id;
    const plainUser = await prisma.user.create({
      data: {
        email: "up-u@test.com",
        passwordHash: hash,
        role: "USER",
        firstName: "U",
        lastName: "Ser",
      },
    });
    artistToken = await signAccessToken({
      sub: artistUser.id,
      email: artistUser.email,
      role: "ARTIST",
    });
    userToken = await signAccessToken({
      sub: plainUser.id,
      email: plainUser.email,
      role: "USER",
    });
  });

  after(async () => {
    await deleteTestUsersByEmail(["up-a@test.com", "up-u@test.com"]);
    await prisma.$disconnect();
  });

  it("artist can presign song audio", async () => {
    const res = await request(app)
      .post("/api/v1/uploads/presign")
      .set("Authorization", `Bearer ${artistToken}`)
      .send({
        resourceType: "SONG_AUDIO",
        songId,
        filename: "track.mp3",
        contentType: "audio/mpeg",
        size: 1024,
      });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.uploadUrl);
    assert.ok(res.body.data.objectKey.startsWith(`songs/${songId}/audio/`));
    assert.equal(res.body.data.expiresIn > 0, true);
    assert.equal(res.body.data.uploadUrl.includes("secret"), false);
  });

  it("USER cannot presign", async () => {
    const res = await request(app)
      .post("/api/v1/uploads/presign")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        resourceType: "SONG_AUDIO",
        songId,
        filename: "x.mp3",
        contentType: "audio/mpeg",
        size: 100,
      });
    assert.equal(res.status, 403);
  });

  it("rejects invalid mime", async () => {
    const res = await request(app)
      .post("/api/v1/uploads/presign")
      .set("Authorization", `Bearer ${artistToken}`)
      .send({
        resourceType: "SONG_AUDIO",
        songId,
        filename: "evil.exe",
        contentType: "application/x-msdownload",
        size: 100,
      });
    assert.equal(res.status, 400);
  });

  it("complete saves object key after PUT", async () => {
    const presign = await request(app)
      .post("/api/v1/uploads/presign")
      .set("Authorization", `Bearer ${artistToken}`)
      .send({
        resourceType: "SONG_COVER",
        songId,
        filename: "cover.jpg",
        contentType: "image/jpeg",
        size: 4,
      });
    const objectKey = presign.body.data.objectKey as string;
    const dest = absolutePath(objectKey);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, Buffer.from("fake"));

    const complete = await request(app)
      .post("/api/v1/uploads/complete")
      .set("Authorization", `Bearer ${artistToken}`)
      .send({
        resourceType: "SONG_COVER",
        songId,
        objectKey,
        contentType: "image/jpeg",
        size: 4,
      });
    assert.equal(complete.status, 200);

    const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });
    assert.equal(song.coverObjectKey, objectKey);
    assert.equal(song.status, "DRAFT");
  });

  it("rejects arbitrary object key", async () => {
    const res = await request(app)
      .post("/api/v1/uploads/complete")
      .set("Authorization", `Bearer ${artistToken}`)
      .send({
        resourceType: "SONG_AUDIO",
        songId,
        objectKey: "songs/other/audio/evil.mp3",
        contentType: "audio/mpeg",
        size: 10,
      });
    assert.equal(res.status, 400);
  });
});
