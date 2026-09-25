import assert from "node:assert/strict";
import { describe, it, after } from "node:test";
import { prisma } from "../lib/prisma.js";
import { confirmSongLanguage } from "../services/songLanguageService.js";

async function dbReady(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

describe("language confirmation integration", async () => {
  const ready = await dbReady();
  if (!ready) {
    it("skips when DATABASE_URL unreachable", { skip: true }, () => {});
    return;
  }

  it("rejects invalid segment times", async () => {
    const song = await prisma.song.findFirst({
      include: { artist: true },
    });
    if (!song) {
      return;
    }
    await assert.rejects(
      () =>
        confirmSongLanguage(song.id, song.artist.ownerUserId, {
          segments: [{ language: "lg", startTime: 10, endTime: 5 }],
        }),
      (err: Error) => err.message.includes("Invalid segment"),
    );
  });

  after(async () => {
    await prisma.$disconnect();
  });
});
