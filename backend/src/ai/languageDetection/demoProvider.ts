import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import type {
  LanguageDetectionInput,
  LanguageDetectionProvider,
  LanguageDetectionProviderResult,
} from "./types.js";
import { isSupportedLanguage } from "../../lib/languageCatalog.js";

const CATALOG_CODES = ["lg", "en", "nyn", "xog", "ach", "xlu", "lwg", "sw"] as const;

function pickFromAudioFingerprint(
  buffer: Buffer,
  durationSeconds: number,
): (typeof CATALOG_CODES)[number] {
  const hash = createHash("sha256").update(buffer.subarray(0, 65536)).digest();
  const idx = hash[0]! % CATALOG_CODES.length;
  const code = CATALOG_CODES[idx]!;
  if (durationSeconds < 5 && code !== "en") {
    return "lg";
  }
  return code;
}

/**
 * Development provider: uses a stable fingerprint of processed audio so the same file
 * always gets the same detection (useful when testing Luganda vs English clips).
 * Override with DEMO_LANGUAGE_DETECT_CODE=lg for forced demos.
 */
export class DemoLanguageDetectionProvider implements LanguageDetectionProvider {
  readonly name = "demo-fingerprint";

  async detectLanguage(input: LanguageDetectionInput): Promise<LanguageDetectionProviderResult> {
    const forced = process.env.DEMO_LANGUAGE_DETECT_CODE?.trim().toLowerCase();
    let primaryCode: string;
    if (forced && isSupportedLanguage(forced)) {
      primaryCode = forced;
    } else {
      const buf = await fs.readFile(input.localAudioPath);
      primaryCode = pickFromAudioFingerprint(buf, input.durationSeconds);
    }

    const confidence = primaryCode === "lg" ? 0.91 : primaryCode === "en" ? 0.88 : 0.72;

    const alternatives = CATALOG_CODES.filter((c) => c !== primaryCode)
      .slice(0, 2)
      .map((languageCode, i) => ({
        languageCode,
        confidence: Math.max(0.03, 0.12 - i * 0.04),
      }));

    const segments: LanguageDetectionProviderResult["segments"] = [];
    if (input.durationSeconds > 60 && process.env.DEMO_LANGUAGE_MIXED === "true") {
      const third = input.durationSeconds / 3;
      segments.push(
        {
          languageCode: primaryCode,
          startTime: 0,
          endTime: third,
          confidence: confidence,
        },
        {
          languageCode: "en",
          startTime: third,
          endTime: third * 2,
          confidence: 0.85,
        },
        {
          languageCode: primaryCode,
          startTime: third * 2,
          endTime: input.durationSeconds,
          confidence: 0.87,
        },
      );
    }

    return {
      primary: { languageCode: primaryCode, confidence },
      alternatives,
      segments: segments.length > 0 ? segments : undefined,
      providerName: this.name,
    };
  }
}
