import type { ExportFormat, VideoAspect } from "@prisma/client";

export type ExportSpec = {
  format: ExportFormat;
  label: string;
  aspect: VideoAspect;
  width: number;
  height: number;
};

export function clampResolution(height: number): number {
  if (height >= 2160) return 2160;
  if (height >= 1440) return 1440;
  return 1080;
}

/** Output dimensions for render jobs (template design canvas is 4:3 by default). */
export function exportSpec(format: ExportFormat, resolutionHeight: number): ExportSpec {
  const h = clampResolution(resolutionHeight);
  switch (format) {
    case "CANVAS_4_3":
      return {
        format: "CANVAS_4_3",
        label: "Standard (4:3)",
        aspect: "RATIO_4_3",
        width: Math.round((h * 4) / 3),
        height: h,
      };
    case "TIKTOK_9_16":
    case "REELS_9_16":
      return {
        format,
        label: format === "TIKTOK_9_16" ? "TikTok (9:16)" : "Instagram Reels (9:16)",
        aspect: "RATIO_9_16",
        width: Math.round((h * 9) / 16),
        height: h,
      };
    case "SQUARE_1_1":
      return {
        format: "SQUARE_1_1",
        label: "Square (1:1)",
        aspect: "RATIO_1_1",
        width: h,
        height: h,
      };
    case "YOUTUBE_16_9":
    default:
      return {
        format: "YOUTUBE_16_9",
        label: "YouTube (16:9)",
        aspect: "RATIO_16_9",
        width: Math.round((h * 16) / 9),
        height: h,
      };
  }
}

export const EXPORT_FORMATS: ExportFormat[] = [
  "CANVAS_4_3",
  "YOUTUBE_16_9",
  "TIKTOK_9_16",
  "REELS_9_16",
  "SQUARE_1_1",
];
