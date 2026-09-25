import { isSupportedLanguage, languageMeta } from "./languageCatalog.js";

const ALIASES: Record<string, string> = {
  luganda: "lg",
  english: "en",
  runyankole: "nyn",
  lusoga: "xog",
  acholi: "ach",
  lugisu: "xlu",
  lugwere: "lwg",
  swahili: "sw",
  lg: "lg",
  en: "en",
  nyn: "nyn",
  xog: "xog",
  ach: "ach",
  xlu: "xlu",
  lwg: "lwg",
  sw: "sw",
};

/** Normalize API input (e.g. "LUGANDA" or "lg") to catalog code. */
export function normalizeLanguageCode(input: string): string | null {
  const key = input.trim().toLowerCase();
  const mapped = ALIASES[key] ?? key;
  return isSupportedLanguage(mapped) ? mapped : null;
}

export function languageDisplayName(code: string): string {
  return languageMeta(code)?.name ?? code;
}
