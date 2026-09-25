/** Configuration hook for language-specific custom vocabulary (editor UI comes later). */
export type VocabularyProfile = {
  id: string;
  languageCode: string;
  terms: string[];
  categories: string[];
};

const BASE_PROFILES: VocabularyProfile[] = [
  {
    id: "vocab-lg",
    languageCode: "lg",
    categories: ["luganda-names", "locations", "music-terms"],
    terms: ["Luganda", "kampala", "omutima", "nkuyagala"],
  },
  {
    id: "vocab-en",
    languageCode: "en",
    categories: ["english-common"],
    terms: [],
  },
];

export function getVocabularyProfile(languageCode: string): VocabularyProfile | null {
  return BASE_PROFILES.find((p) => p.languageCode === languageCode) ?? null;
}
