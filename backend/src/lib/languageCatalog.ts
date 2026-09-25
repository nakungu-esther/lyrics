/** Nyimba launch languages (matches seed-languages.sql). */
export const SUPPORTED_LANGUAGES = [
  { code: "lg", name: "Luganda", flag: "🇺🇬" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "nyn", name: "Runyankole", flag: "🇺🇬" },
  { code: "xog", name: "Lusoga", flag: "🇺🇬" },
  { code: "ach", name: "Acholi", flag: "🇺🇬" },
  { code: "xlu", name: "Lugisu", flag: "🇺🇬" },
  { code: "lwg", name: "Lugwere", flag: "🇺🇬" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
] as const;

export type CatalogLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const codes = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

export function isSupportedLanguage(code: string): code is CatalogLanguageCode {
  return codes.has(code as CatalogLanguageCode);
}

export function languageMeta(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? null;
}

/** Map Whisper ISO codes to catalog where possible. */
const WHISPER_TO_CATALOG: Record<string, CatalogLanguageCode> = {
  lg: "lg",
  en: "en",
  sw: "sw",
};

export function mapWhisperLanguage(iso: string): CatalogLanguageCode {
  const key = iso.toLowerCase().slice(0, 2);
  if (WHISPER_TO_CATALOG[key]) return WHISPER_TO_CATALOG[key];
  if (isSupportedLanguage(key)) return key;
  return "lg";
}
