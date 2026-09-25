export type VideoCustomization = {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  textShadow?: string;
  position: "top" | "center" | "bottom";
  animation: "none" | "fade" | "karaoke-fill";
  background: {
    type: "solid" | "blur" | "video" | "cover" | "gradient";
    color?: string;
  };
  preferredExportFormat?: ExportFormatId;
};

export type VideoTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  config: {
    family: string;
    emoji?: string;
    suggestedExportFormat?: ExportFormatId;
    defaultStyle: VideoCustomization;
  };
};

export type ExportFormatId =
  | "YOUTUBE_16_9"
  | "TIKTOK_9_16"
  | "REELS_9_16"
  | "SQUARE_1_1";

export type VideoProjectSummary = {
  id: string;
  song: { id: string; title: string; coverImageUrl: string | null };
  template: { slug: string; name: string };
  renderJobs: { id: string; status: string; outputVideoUrl: string | null }[];
};

export type SongForVideo = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  mediaSource: string;
  backgroundVideoUrl: string | null;
  lyrics: { id: string; status: string; version: number }[];
};
