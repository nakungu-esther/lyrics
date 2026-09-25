import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLrcContent, lrcDownloadFilename } from "../lib/lrcExport.js";

describe("lrcExport", () => {
  it("formats line timestamps", () => {
    const lrc = buildLrcContent(
      [
        {
          sortOrder: 0,
          lines: [
            { sortOrder: 0, text: "Hello world", startTime: 65.5 },
            { sortOrder: 1, text: "No time", startTime: null },
          ],
        },
      ],
      { title: "Song", artist: "Artist" },
    );
    assert.match(lrc, /\[ti:Song\]/);
    assert.match(lrc, /\[ar:Artist\]/);
    assert.match(lrc, /\[01:05\.50\]Hello world/);
    assert.doesNotMatch(lrc, /No time/);
  });

  it("builds safe download names", () => {
    assert.equal(lrcDownloadFilename({ title: "A/B", artist: "X" }), "X - A_B.lrc");
  });
});
