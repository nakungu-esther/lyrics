export type SongLanguageState =
  | "NOT_DETECTED"
  | "DETECTED"
  | "CONFIRMATION_REQUIRED"
  | "CONFIRMED";

export type LanguageSegmentView = {
  id: string;
  languageCode: string;
  languageName: string;
  startTime: number;
  endTime: number;
  confidence: number | null;
  source: "AI_DETECTED" | "ARTIST_CONFIRMED" | "ADMIN_REVIEWED";
};

export type SongLanguageStatus = {
  languageState: SongLanguageState;
  confirmationRequired: boolean;
  detected: {
    languageCode: string | null;
    languageName: string | null;
    confidence: number | null;
    flag: string | null;
  };
  confirmed: {
    languageCode: string | null;
    languageName: string | null;
    confirmedAt: string | null;
    source: "ARTIST_CONFIRMED" | null;
  };
  aiHistory: Array<{
    id: string;
    languageCode: string;
    languageName: string;
    confidence: number;
    createdAt: string;
    alternatives: Array<{ languageCode: string; confidence: number }>;
  }>;
  segments: {
    ai: LanguageSegmentView[];
    confirmed: LanguageSegmentView[];
  };
  processingJob: {
    id: string;
    status: string;
    progress: number;
    message: string | null;
    error: string | null;
  } | null;
  readyForTranscription: boolean;
};
