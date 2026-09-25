import { z } from "zod";
import {
  applyTemplateOverrides,
  assAlignment,
  parseVideoTemplateConfig,
  resolveTemplateStyle,
  toLegacyCustomization,
  type ExportFormatId,
  type VideoTemplateConfigV2,
} from "./templateSchema.js";

export const videoCustomizationSchema = z.object({
  fontFamily: z.string().max(80).default("Inter"),
  fontSize: z.number().min(12).max(120).default(42),
  textColor: z.string().max(20).default("#FFFFFF"),
  highlightColor: z.string().max(20).default("#A78BFA"),
  textShadow: z.string().max(120).optional(),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  animation: z.enum(["none", "fade", "karaoke-fill"]).default("fade"),
  background: z
    .object({
      type: z.enum(["solid", "blur", "video", "cover", "gradient"]),
      color: z.string().optional(),
    })
    .default({ type: "solid", color: "#0a0a0a" }),
  preferredExportFormat: z
    .enum(["CANVAS_4_3", "YOUTUBE_16_9", "TIKTOK_9_16", "REELS_9_16", "SQUARE_1_1"])
    .optional(),
});

export type VideoCustomization = z.infer<typeof videoCustomizationSchema>;

export type VideoTemplateConfig = VideoTemplateConfigV2;

export function mergeVideoStyle(
  templateConfig: VideoTemplateConfig | unknown,
  customizations: unknown,
): VideoCustomization {
  const config = parseVideoTemplateConfig(templateConfig);
  const merged = toLegacyCustomization(
    applyTemplateOverrides(config, customizations),
    customizations,
  );
  return videoCustomizationSchema.parse(merged);
}

export {
  applyTemplateOverrides,
  assAlignment,
  parseVideoTemplateConfig,
  resolveTemplateStyle,
  toLegacyCustomization,
  type ExportFormatId,
  type VideoTemplateConfigV2,
};
