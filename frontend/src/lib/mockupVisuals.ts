/** Visual assets for mockup-aligned UI (Unsplash — preview/marketing only). */

export const MOCKUP_IMAGES = {
  heroSinger:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80",
  heroSingerAlt:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80",
  projectThumb1:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
  projectThumb2:
    "https://images.unsplash.com/photo-1511379938541-c1f69419868d?auto=format&fit=crop&w=600&q=80",
  projectThumb3:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
} as const;

export type MockupTemplatePreview = {
  name: string;
  tag: string;
  /** Tailwind gradient and/or background image */
  className: string;
  imageUrl?: string;
};

/** Landing + gallery style previews matching the design board. */
export const MOCKUP_TEMPLATE_PREVIEWS: MockupTemplatePreview[] = [
  {
    name: "Worship Light",
    tag: "Gospel",
    className: "from-violet-950 via-purple-900 to-indigo-950",
    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac57747a0f0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Gospel Choir",
    tag: "Worship",
    className: "from-indigo-950 via-violet-900 to-purple-950",
  },
  {
    name: "African Sunset",
    tag: "Afrobeat",
    className: "from-orange-700 via-rose-800 to-violet-900",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kampala Nights",
    tag: "Afrobeat",
    className: "from-slate-900 via-blue-900 to-cyan-900",
  },
  {
    name: "Classic Karaoke",
    tag: "Karaoke",
    className: "from-zinc-900 via-zinc-800 to-amber-900/80",
  },
  {
    name: "Cinematic",
    tag: "Cinematic",
    className: "from-slate-950 to-slate-800",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Nature",
    tag: "Nature",
    className: "from-emerald-900 to-green-950",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Modern Typography",
    tag: "Modern",
    className: "from-slate-900 via-indigo-950 to-fuchsia-950",
  },
];

export const WORKFLOW_STEPS = [
  { label: "Upload", icon: "upload" as const },
  { label: "AI Analysis", icon: "sparkles" as const },
  { label: "Generate & Sync", icon: "lyrics" as const },
  { label: "Choose Template", icon: "templates" as const },
  { label: "Customize", icon: "palette" as const },
  { label: "Preview", icon: "play" as const },
  { label: "Render", icon: "videos" as const },
  { label: "Download & Share", icon: "download" as const },
] as const;

export const ASPECT_RATIO_PRESETS = [
  { id: "9:16", label: "TikTok / Reels", sub: "9:16 vertical", icon: "phone" as const },
  { id: "16:9", label: "YouTube", sub: "16:9 landscape", icon: "monitor" as const },
  { id: "1:1", label: "Square", sub: "1:1 feed", icon: "square" as const },
  { id: "4:3", label: "Standard", sub: "4:3 canvas", icon: "image" as const },
] as const;
