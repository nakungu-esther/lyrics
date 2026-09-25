export type DetectedLanguageCandidate = {
  languageCode: string;
  confidence: number;
};

export type DetectedLanguageSegment = {
  languageCode: string;
  startTime: number;
  endTime: number;
  confidence: number;
};

/** Normalized provider output — never leak vendor JSON outside the AI layer. */
export type LanguageDetectionProviderResult = {
  primary: DetectedLanguageCandidate;
  alternatives: DetectedLanguageCandidate[];
  segments?: DetectedLanguageSegment[];
  providerName: string;
  rawDebug?: Record<string, unknown>;
};

export type LanguageDetectionInput = {
  localAudioPath: string;
  durationSeconds: number;
  songId: string;
};

export interface LanguageDetectionProvider {
  readonly name: string;
  detectLanguage(input: LanguageDetectionInput): Promise<LanguageDetectionProviderResult>;
}
