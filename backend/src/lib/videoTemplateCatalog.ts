import type { ExportFormat } from "@prisma/client";
import { buildTemplateConfig } from "./templateBuild.js";
import type { VideoTemplateConfigV2 } from "./templateSchema.js";

export type TemplateSeed = {
  id: string;
  slug: string;
  name: string;
  description: string;
  config: VideoTemplateConfigV2;
};

/**
 * Original LyricsHub templates — JSON config only (gradients, solids, typography).
 * No third-party video assets. All render at 4:3 design canvas by default.
 */
export const VIDEO_TEMPLATE_SEEDS: TemplateSeed[] = [
  // ─── Core pipeline (auto-selected for upload flows) ───
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "classic",
    name: "Classic Lyrics",
    description: "Default audio-only look — clean type on a dark stage.",
    config: buildTemplateConfig({
      family: "classic",
      category: "style",
      tags: ["General", "Classic"],
      background: { type: "solid", color: "#0a0a0a" },
      typography: { position: "bottom", fontSize: 42 },
      highlight: { mode: "word", color: "#A78BFA" },
      animation: { lineEntrance: "fade" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "karaoke",
    name: "Classic Karaoke",
    description: "Word-by-word highlight — the standard karaoke feel.",
    config: buildTemplateConfig({
      family: "karaoke",
      category: "style",
      tags: ["General", "Karaoke"],
      background: { type: "solid", color: "#18181b" },
      typography: { position: "center", fontSize: 48, fontWeight: "bold" },
      highlight: { mode: "karaoke", color: "#FACC15" },
      animation: { lineEntrance: "fade", karaokeFill: true },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "music-video-overlay",
    name: "Music Video Overlay",
    description: "Your uploaded clip plays underneath synced lyrics.",
    config: buildTemplateConfig({
      family: "overlay",
      category: "style",
      tags: ["Video", "Overlay"],
      background: { type: "video" },
      typography: { position: "bottom", fontSize: 40, textColor: "#FFFFFF" },
      highlight: { mode: "word", color: "#22D3EE" },
      animation: { lineEntrance: "none" },
      effects: { outlineWidth: 3, textShadow: "0 2px 10px rgba(0,0,0,0.85)" },
      render: { preferUploadedVideo: true, padUploadedVideo: "cover" },
    }),
  },

  // ─── Gospel (6) ───
  {
    id: "00000000-0000-4000-8000-000000000101",
    slug: "worship-light",
    name: "Worship Light",
    description: "Soft gold light on warm stone — calm worship moments.",
    config: buildTemplateConfig({
      family: "worship-light",
      category: "gospel",
      tags: ["Gospel", "Worship"],
      background: {
        type: "gradient",
        angle: 165,
        stops: [
          { color: "#292524", at: 0 },
          { color: "#78716c", at: 0.55 },
          { color: "#fef3c7", at: 1 },
        ],
      },
      typography: { fontFamily: "Georgia", position: "center", fontSize: 40, textColor: "#FFFBEB" },
      highlight: { mode: "line", color: "#FDE68A" },
      animation: { lineEntrance: "fade" },
      transitions: { lineFadeInMs: 400, lineFadeOutMs: 400 },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    slug: "praise-energy",
    name: "Praise Energy",
    description: "Bright motion and karaoke lift for high-energy praise.",
    config: buildTemplateConfig({
      family: "praise-energy",
      category: "gospel",
      tags: ["Gospel", "Praise"],
      background: {
        type: "gradient",
        angle: 45,
        stops: [
          { color: "#1e3a8a", at: 0 },
          { color: "#ea580c", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 46, fontWeight: "bold", textColor: "#FFFFFF" },
      highlight: { mode: "karaoke", color: "#FBBF24" },
      animation: { lineEntrance: "slide-up", karaokeFill: true },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    slug: "gospel-choir",
    name: "Gospel Choir",
    description: "Deep purple sanctuary tones with centered hymn-style type.",
    config: buildTemplateConfig({
      family: "gospel-choir",
      category: "gospel",
      tags: ["Gospel", "Choir"],
      background: { type: "solid", color: "#2e1065" },
      typography: { fontFamily: "Georgia", position: "center", fontSize: 44, textColor: "#EDE9FE" },
      highlight: { mode: "word", color: "#C4B5FD" },
      animation: { lineEntrance: "fade" },
      effects: { backgroundBox: true, backgroundBoxColor: "#00000055" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    slug: "grace",
    name: "Grace",
    description: "Muted earth and cream — reflective, gentle gospel.",
    config: buildTemplateConfig({
      family: "grace",
      category: "gospel",
      tags: ["Gospel", "Worship"],
      background: { type: "solid", color: "#44403c" },
      typography: { fontFamily: "Georgia", position: "bottom", fontSize: 38, textColor: "#FAFAF9" },
      highlight: { mode: "line", color: "#D6D3D1" },
      animation: { lineEntrance: "fade" },
      transitions: { lineFadeInMs: 500, lineFadeOutMs: 300 },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    slug: "hallelujah",
    name: "Hallelujah",
    description: "Radiant amber burst with bold celebratory lyrics.",
    config: buildTemplateConfig({
      family: "hallelujah",
      category: "gospel",
      tags: ["Gospel", "Praise"],
      background: {
        type: "gradient",
        angle: 90,
        stops: [
          { color: "#451a03", at: 0 },
          { color: "#f59e0b", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 50, fontWeight: "bold", textColor: "#FFFFFF" },
      highlight: { mode: "karaoke", color: "#FEF08A" },
      animation: { lineEntrance: "pop", karaokeFill: true },
      effects: { glow: true, glowColor: "#FCD34D" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    slug: "african-worship",
    name: "African Worship",
    description: "Warm terracotta and forest green — continental worship palette.",
    config: buildTemplateConfig({
      family: "african-worship",
      category: "gospel",
      tags: ["Gospel", "Worship", "Traditional"],
      background: {
        type: "gradient",
        angle: 140,
        stops: [
          { color: "#14532d", at: 0 },
          { color: "#9a3412", at: 0.5 },
          { color: "#422006", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 42, textColor: "#FEF3C7" },
      highlight: { mode: "word", color: "#86EFAC" },
      animation: { lineEntrance: "fade" },
    }),
  },

  // ─── Afrobeat (5) ───
  {
    id: "00000000-0000-4000-8000-000000000201",
    slug: "african-sunset",
    name: "African Sunset",
    description: "Horizon oranges and violets — golden-hour Afro mood.",
    config: buildTemplateConfig({
      family: "african-sunset",
      category: "afrobeat",
      tags: ["Afrobeat"],
      background: {
        type: "gradient",
        angle: 0,
        stops: [
          { color: "#4c1d95", at: 0 },
          { color: "#ea580c", at: 0.45 },
          { color: "#fbbf24", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 44, textColor: "#FFFFFF" },
      highlight: { mode: "karaoke", color: "#FDE047" },
      animation: { lineEntrance: "fade", karaokeFill: true },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    slug: "kampala-nights",
    name: "Kampala Nights",
    description: "City-night blues and neon accents — club-ready lyrics.",
    config: buildTemplateConfig({
      family: "kampala-nights",
      category: "afrobeat",
      tags: ["Afrobeat", "Urban"],
      background: {
        type: "gradient",
        angle: 160,
        stops: [
          { color: "#0f172a", at: 0 },
          { color: "#1e40af", at: 0.6 },
          { color: "#06b6d4", at: 1 },
        ],
      },
      typography: { position: "bottom", fontSize: 46, textColor: "#E0F2FE" },
      highlight: { mode: "word", color: "#22D3EE" },
      animation: { lineEntrance: "slide-up" },
      effects: { glow: true, glowColor: "#0891B2" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    slug: "afro-motion",
    name: "Afro Motion",
    description: "Punchy pop-in lines on a deep green groove.",
    config: buildTemplateConfig({
      family: "afro-motion",
      category: "afrobeat",
      tags: ["Afrobeat"],
      background: { type: "solid", color: "#052e16" },
      typography: { position: "center", fontSize: 48, fontWeight: "bold", textColor: "#ECFCCB" },
      highlight: { mode: "karaoke", color: "#4ADE80" },
      animation: { lineEntrance: "pop", karaokeFill: true },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    slug: "neon-africa",
    name: "Neon Africa",
    description: "Electric magenta and lime — festival energy.",
    config: buildTemplateConfig({
      family: "neon-africa",
      category: "afrobeat",
      tags: ["Afrobeat", "Neon"],
      background: { type: "solid", color: "#0a0a0a" },
      typography: { position: "center", fontSize: 46, textColor: "#FAFAFA" },
      highlight: { mode: "karaoke", color: "#E879F9" },
      animation: { lineEntrance: "pop", karaokeFill: true },
      effects: { glow: true, glowColor: "#A855F7", outlineWidth: 0 },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000205",
    slug: "rhythm",
    name: "Rhythm",
    description: "Warm brown pulse with tight karaoke timing.",
    config: buildTemplateConfig({
      family: "rhythm",
      category: "afrobeat",
      tags: ["Afrobeat"],
      background: {
        type: "gradient",
        angle: 120,
        stops: [
          { color: "#78350f", at: 0 },
          { color: "#292524", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 44, textColor: "#FEF3C7" },
      highlight: { mode: "karaoke", color: "#FB923C" },
      animation: { karaokeFill: true, lineEntrance: "fade" },
    }),
  },

  // ─── Romantic (4) ───
  {
    id: "00000000-0000-4000-8000-000000000301",
    slug: "love-letters",
    name: "Love Letters",
    description: "Rose blush gradient — intimate serif lyrics.",
    config: buildTemplateConfig({
      family: "love-letters",
      category: "romantic",
      tags: ["Romantic", "Love"],
      background: {
        type: "gradient",
        angle: 180,
        stops: [
          { color: "#4c0519", at: 0 },
          { color: "#be185d", at: 1 },
        ],
      },
      typography: { fontFamily: "Georgia", position: "center", fontSize: 40, textColor: "#FECDD3" },
      highlight: { mode: "word", color: "#FDA4AF" },
      animation: { lineEntrance: "fade" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    slug: "sunset-love",
    name: "Sunset Love",
    description: "Peach and lilac sky — soft romantic fade-ins.",
    config: buildTemplateConfig({
      family: "sunset-love",
      category: "romantic",
      tags: ["Romantic"],
      background: {
        type: "gradient",
        angle: 0,
        stops: [
          { color: "#831843", at: 0 },
          { color: "#fb7185", at: 0.5 },
          { color: "#fed7aa", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 42, textColor: "#FFFFFF" },
      highlight: { mode: "line", color: "#FBCFE8" },
      transitions: { lineFadeInMs: 450, lineFadeOutMs: 350 },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000303",
    slug: "forever",
    name: "Forever",
    description: "Deep wine solid with elegant bottom titles.",
    config: buildTemplateConfig({
      family: "forever",
      category: "romantic",
      tags: ["Romantic", "Love"],
      background: { type: "solid", color: "#3f0318" },
      typography: { fontFamily: "Georgia", position: "bottom", fontSize: 38, textColor: "#FCE7F3" },
      highlight: { mode: "word", color: "#F472B6" },
      animation: { lineEntrance: "fade" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000304",
    slug: "soft-hearts",
    name: "Soft Hearts",
    description: "Light pink mist — gentle word highlights.",
    config: buildTemplateConfig({
      family: "soft-hearts",
      category: "romantic",
      tags: ["Romantic"],
      background: {
        type: "gradient",
        angle: 160,
        stops: [
          { color: "#500724", at: 0 },
          { color: "#fce7f3", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 40, textColor: "#831843" },
      highlight: { mode: "word", color: "#DB2777" },
      animation: { lineEntrance: "fade" },
      effects: { backgroundBox: true, backgroundBoxColor: "#FFFFFF40" },
    }),
  },

  // ─── General / style (8) ───
  {
    id: "00000000-0000-4000-8000-000000000401",
    slug: "cinematic",
    name: "Cinematic",
    description: "Letterbox mood — dramatic bottom titles and shadow.",
    config: buildTemplateConfig({
      family: "cinematic",
      category: "style",
      tags: ["Cinematic", "General"],
      background: { type: "solid", color: "#0c0a09" },
      typography: { fontFamily: "Georgia", position: "bottom", fontSize: 42, textColor: "#E7E5E4" },
      highlight: { mode: "line", color: "#D6D3D1" },
      effects: { textShadow: "0 2px 14px rgba(0,0,0,0.95)", outlineWidth: 2 },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000402",
    slug: "minimal",
    name: "Minimal",
    description: "Quiet grey stage — thin type, no distraction.",
    config: buildTemplateConfig({
      family: "minimal",
      category: "style",
      tags: ["Minimal", "General"],
      background: { type: "solid", color: "#171717" },
      typography: { position: "bottom", fontSize: 36, fontWeight: "normal", textColor: "#FAFAFA" },
      highlight: { mode: "none", color: "#737373" },
      effects: { outlineWidth: 0 },
      animation: { lineEntrance: "fade" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000403",
    slug: "modern-typography",
    name: "Modern Typography",
    description: "Bold sans, pop motion, violet accent.",
    config: buildTemplateConfig({
      family: "modern-typography",
      category: "style",
      tags: ["Modern", "General"],
      background: {
        type: "gradient",
        angle: 135,
        stops: [
          { color: "#0f172a", at: 0 },
          { color: "#4c1d95", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 48, fontWeight: "bold" },
      highlight: { mode: "karaoke", color: "#A78BFA" },
      animation: { lineEntrance: "pop", karaokeFill: true },
      effects: { glow: true, glowColor: "#7C3AED" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000404",
    slug: "nature",
    name: "Nature",
    description: "Forest canopy greens — earthy calm lyrics.",
    config: buildTemplateConfig({
      family: "nature",
      category: "style",
      tags: ["Nature", "General"],
      background: {
        type: "gradient",
        angle: 180,
        stops: [
          { color: "#14532d", at: 0 },
          { color: "#166534", at: 0.5 },
          { color: "#064e3b", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 40, textColor: "#ECFDF5" },
      highlight: { mode: "word", color: "#6EE7B7" },
      animation: { lineEntrance: "fade" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000405",
    slug: "abstract",
    name: "Abstract",
    description: "Cool geometric gradient — abstract art feel.",
    config: buildTemplateConfig({
      family: "abstract",
      category: "style",
      tags: ["Abstract", "General"],
      background: {
        type: "gradient",
        angle: 45,
        stops: [
          { color: "#0891b2", at: 0 },
          { color: "#6366f1", at: 0.5 },
          { color: "#ec4899", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 44, textColor: "#FFFFFF" },
      highlight: { mode: "word", color: "#FDE047" },
      animation: { lineEntrance: "slide-up" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000406",
    slug: "photo-memories",
    name: "Photo Memories",
    description: "Uses your song cover art as a soft full-frame background.",
    config: buildTemplateConfig({
      family: "photo-memories",
      category: "style",
      tags: ["Photo", "Memories", "General"],
      background: { type: "cover" },
      typography: { position: "bottom", fontSize: 40, textColor: "#FFFFFF" },
      highlight: { mode: "word", color: "#FCD34D" },
      effects: { textShadow: "0 2px 12px rgba(0,0,0,0.9)", outlineWidth: 3 },
      animation: { lineEntrance: "fade" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000407",
    slug: "music-visualizer",
    name: "Music Visualizer",
    description: "Indigo pulse gradient with karaoke-forward type.",
    config: buildTemplateConfig({
      family: "music-visualizer",
      category: "style",
      tags: ["Visualizer", "Karaoke", "General"],
      background: {
        type: "gradient",
        angle: 90,
        stops: [
          { color: "#0f0f24", at: 0 },
          { color: "#312e81", at: 0.5 },
          { color: "#1e1b4b", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 46, textColor: "#E0E7FF" },
      highlight: { mode: "karaoke", color: "#818CF8" },
      animation: { karaokeFill: true, lineEntrance: "fade" },
      effects: { glow: true, glowColor: "#6366F1" },
    }),
  },
  {
    id: "00000000-0000-4000-8000-000000000408",
    slug: "dynamic-modern",
    name: "Dynamic Modern",
    description: "High-energy pop and glow for upbeat tracks.",
    config: buildTemplateConfig({
      family: "dynamic",
      category: "style",
      tags: ["Modern", "General"],
      background: {
        type: "gradient",
        angle: 135,
        stops: [
          { color: "#0f172a", at: 0 },
          { color: "#be185d", at: 1 },
        ],
      },
      typography: { position: "center", fontSize: 46 },
      highlight: { mode: "karaoke", color: "#F472B6" },
      animation: { lineEntrance: "pop", karaokeFill: true },
      effects: { glow: true, glowColor: "#F472B6", outlineWidth: 2 },
    }),
  },
];

export type ExportFormatPreset = {
  format: ExportFormat;
  emoji: string;
  label: string;
  description: string;
};

export const EXPORT_FORMAT_PRESETS: ExportFormatPreset[] = [
  {
    format: "CANVAS_4_3",
    emoji: "🖼️",
    label: "Standard (4:3)",
    description: "Default LyricsHub canvas — ideal for editing and classic displays.",
  },
  {
    format: "YOUTUBE_16_9",
    emoji: "🖥️",
    label: "YouTube",
    description: "Landscape 16:9 for YouTube and TV.",
  },
  {
    format: "TIKTOK_9_16",
    emoji: "📱",
    label: "TikTok / Shorts",
    description: "Vertical 9:16 for phone-first social.",
  },
  {
    format: "REELS_9_16",
    emoji: "📱",
    label: "Instagram Reels",
    description: "Vertical 9:16 optimized for Reels.",
  },
  {
    format: "SQUARE_1_1",
    emoji: "⬜",
    label: "Square",
    description: "1:1 for feeds and carousel posts.",
  },
];

/** Slugs kept for backwards compatibility (may no longer be seeded). */
export const LEGACY_TEMPLATE_SLUGS = [
  "gospel-worship",
  "gospel-praise",
  "afrobeat-vibe",
  "romantic",
  "minimalist",
  "waveform-karaoke",
] as const;
