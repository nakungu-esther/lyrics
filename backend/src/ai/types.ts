export type TranscriptionWord = {
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
};

export type TranscriptionSegment = {
  text: string;
  startTime: number;
  endTime: number;
  words: TranscriptionWord[];
};

export type LanguageDetectionResult = {
  code: string;
  confidence: number;
};

export type TranscriptionResult = {
  segments: TranscriptionSegment[];
  languageCode: string;
  modelVersion: string;
};
