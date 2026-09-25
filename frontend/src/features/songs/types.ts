export type SongLanguageState =
  | "NOT_DETECTED"
  | "DETECTED"
  | "CONFIRMATION_REQUIRED"
  | "CONFIRMED";

export type SongStatus =
  | "DRAFT"
  | "PROCESSING"
  | "AUDIO_READY"
  | "LANGUAGE_CONFIRMED"
  | "READY_FOR_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED";

export type SongMediaSlot = {
  uploaded: boolean;
  contentType?: string | null;
  size?: number | null;
  uploadedAt?: string | null;
  processed?: boolean;
  processedAt?: string | null;
};

export type AudioProcessingStatus = {
  status: "IDLE" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  stage: string;
  error: string | null;
  jobId: string | null;
  songStatus: SongStatus;
  processedAudioReady: boolean;
};

export type Song = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  subgenre?: string | null;
  status: SongStatus;
  releaseDate: string | null;
  coverImageUrl: string | null;
  audioUrl: string | null;
  musicVideoUrl: string | null;
  durationSeconds: number | null;
  detectedLanguageCode?: string | null;
  languageConfidence?: number | null;
  languageConfirmed?: boolean;
  languageState?: SongLanguageState;
  primaryLanguageCode?: string | null;
  album: { id: string; title: string } | null;
  media?: {
    audio: SongMediaSlot;
    cover: SongMediaSlot;
    musicVideo: SongMediaSlot;
  };
  artist?: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
};

export type AlbumOption = { id: string; title: string };

export type CreateSongInput = {
  title: string;
  description?: string;
  genre?: string;
  subgenre?: string;
  releaseDate?: string;
  albumId?: string | null;
};

export type UpdateSongInput = Partial<CreateSongInput>;
