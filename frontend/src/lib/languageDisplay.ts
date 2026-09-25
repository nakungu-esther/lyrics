const LANGUAGES: Record<string, { name: string; code: string }> = {
  lg: { name: "Luganda", code: "LG" },
  en: { name: "English", code: "EN" },
  nyn: { name: "Runyankole", code: "NYN" },
  xog: { name: "Lusoga", code: "XOG" },
  ach: { name: "Acholi", code: "ACH" },
  xlu: { name: "Lugisu", code: "XLU" },
  lwg: { name: "Lugwere", code: "LWG" },
  sw: { name: "Swahili", code: "SW" },
};

export function languageMeta(code: string) {
  const entry = LANGUAGES[code];
  if (entry) return entry;
  const upper = code.length <= 4 ? code.toUpperCase() : code;
  return { name: code, code: upper };
}
