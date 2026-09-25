import { env } from "../../config/env.js";
import { DemoLanguageDetectionProvider } from "./demoProvider.js";
import type { LanguageDetectionProvider } from "./types.js";

let provider: LanguageDetectionProvider | null = null;

export function getLanguageDetectionProvider(): LanguageDetectionProvider {
  if (provider) return provider;
  const mode = env.languageDetectionMode;
  if (mode === "demo") {
    provider = new DemoLanguageDetectionProvider();
    return provider;
  }
  provider = new DemoLanguageDetectionProvider();
  return provider;
}
