import type { ExportFormat } from "@prisma/client";
import { exportSpec, type ExportSpec } from "./exportFormats.js";
import {
  parseVideoTemplateConfig,
  resolveTemplateStyle,
  type ResolvedTemplateStyle,
  type VideoTemplateConfigV2,
} from "./templateSchema.js";

export type TemplateRenderPlan = {
  config: VideoTemplateConfigV2;
  style: ResolvedTemplateStyle;
  export: ExportSpec;
  /** ASS / compositor pixel size (matches export when rendering final file). */
  width: number;
  height: number;
  useUploadedVideo: boolean;
  useUploadedAudio: boolean;
  solidBackgroundColor: string;
  gradientFilter: string | null;
};

function gradientFfmpegFilter(
  width: number,
  height: number,
  angle: number,
  stops: { color: string; at: number }[],
): string {
  const c0 = stops[0]?.color.replace("#", "0x") ?? "0x1e1b4b";
  const c1 = stops[stops.length - 1]?.color.replace("#", "0x") ?? "0x0f172a";
  void angle;
  return `gradients=s=${width}x${height}:c0=${c0}:c1=${c1}:nb_colors=2:seed=0`;
}

export function buildTemplateRenderPlan(input: {
  templateConfig: unknown;
  customizations: unknown;
  exportFormat: ExportFormat;
  resolutionHeight: number;
  hasBackgroundVideo: boolean;
  hasCoverImage: boolean;
}): TemplateRenderPlan {
  const config = parseVideoTemplateConfig(input.templateConfig);
  const style = resolveTemplateStyle(config, input.customizations);
  const exportSpec_ = exportSpec(input.exportFormat, input.resolutionHeight);

  const width = exportSpec_.width;
  const height = exportSpec_.height;

  let useUploadedVideo = false;
  if (input.hasBackgroundVideo) {
    if (style.background.type === "video" || style.background.type === "blur") {
      useUploadedVideo = true;
    }
    if (style.render.preferUploadedVideo) {
      useUploadedVideo = true;
    }
  }

  let solidBackgroundColor = "#0a0a0a";
  let gradientFilter: string | null = null;

  if (style.background.type === "solid") {
    solidBackgroundColor = style.background.color;
  } else if (style.background.type === "gradient") {
    gradientFilter = gradientFfmpegFilter(
      width,
      height,
      style.background.angle,
      style.background.stops,
    );
  } else if (style.background.type === "cover" && !useUploadedVideo) {
    solidBackgroundColor = "#0f0f24";
  }

  return {
    config,
    style,
    export: exportSpec_,
    width,
    height,
    useUploadedVideo,
    useUploadedAudio: style.render.preferUploadedAudio,
    solidBackgroundColor,
    gradientFilter,
  };
}
