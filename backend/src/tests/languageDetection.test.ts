import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeLanguageCode } from "../lib/languageCodes.js";
import { SUPPORTED_LANGUAGES } from "../lib/languageCatalog.js";

describe("language detection step 9", () => {
  it("supported languages catalog includes eight launch languages", () => {
    assert.equal(SUPPORTED_LANGUAGES.length, 8);
    assert.ok(SUPPORTED_LANGUAGES.some((l) => l.code === "lg"));
    assert.ok(SUPPORTED_LANGUAGES.some((l) => l.code === "sw"));
  });

  it("normalizeLanguageCode accepts names and codes", () => {
    assert.equal(normalizeLanguageCode("LUGANDA"), "lg");
    assert.equal(normalizeLanguageCode("luganda"), "lg");
    assert.equal(normalizeLanguageCode("lg"), "lg");
    assert.equal(normalizeLanguageCode("ENGLISH"), "en");
    assert.equal(normalizeLanguageCode("xx"), null);
  });
});
