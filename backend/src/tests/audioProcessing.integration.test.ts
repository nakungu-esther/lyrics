import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { prisma } from "../lib/prisma.js";
import { stageLabel } from "../services/processingJobService.js";

const dbReady = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

describe("audio processing API", async () => {
  const ready = await dbReady();
  if (!ready) {
    it("skips when DATABASE_URL unreachable", { skip: true }, () => {});
    return;
  }

  it("stageLabel maps progress to human-readable stage", () => {
    assert.equal(stageLabel(0, null), "Preparing");
    assert.equal(stageLabel(30, null), "Processing audio");
    assert.equal(stageLabel(85, "Custom message"), "Custom message");
  });

  after(async () => {
    await prisma.$disconnect();
  });
});
