import type { HubIconName } from "../components/icons/HubIcon";

export type ExportFormatId =
  | "CANVAS_4_3"
  | "YOUTUBE_16_9"
  | "TIKTOK_9_16"
  | "REELS_9_16"
  | "SQUARE_1_1";

export type ExportFormatPreset = {
  format: ExportFormatId;
  icon: HubIconName;
  label: string;
  description: string;
};

export const DEFAULT_EXPORT_PRESETS: ExportFormatPreset[] = [
  {
    format: "CANVAS_4_3",
    icon: "image",
    label: "Standard (4:3)",
    description: "Default LyricsHub canvas",
  },
  {
    format: "TIKTOK_9_16",
    icon: "phone",
    label: "TikTok / Reels / Shorts",
    description: "Vertical 9:16",
  },
  {
    format: "YOUTUBE_16_9",
    icon: "monitor",
    label: "YouTube",
    description: "Landscape 16:9",
  },
  {
    format: "SQUARE_1_1",
    icon: "square",
    label: "Square",
    description: "1:1 feed posts",
  },
  {
    format: "REELS_9_16",
    icon: "phone",
    label: "Instagram Reels",
    description: "Vertical 9:16",
  },
];

export { templateIconName as templateIconForConfig } from "../components/icons/HubIcon";
