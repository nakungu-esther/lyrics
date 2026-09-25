import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GOSPEL_SUBGENRES,
  SONG_GENRES,
  validateGenrePair,
} from "../lib/genreCatalog.js";

describe("genre catalog", () => {
  it("includes Gospel as a first-class genre", () => {
    assert.ok(SONG_GENRES.includes("Gospel"));
    assert.equal(SONG_GENRES.length, 12);
  });

  it("allows Gospel subgenres only with Gospel genre", () => {
    assert.equal(validateGenrePair("Gospel", "Worship").ok, true);
    assert.equal(validateGenrePair("Afrobeat", "Worship").ok, false);
    assert.ok(GOSPEL_SUBGENRES.includes("Gospel Choir"));
  });
});
