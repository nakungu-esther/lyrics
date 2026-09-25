import type { HubIconName } from "../components/icons/HubIcon";

export const SUPPORTED_LANGUAGES = [
  "Luganda",
  "English",
  "Runyankole",
  "Lusoga",
  "Acholi",
  "Lugisu",
  "Lugwere",
  "Swahili",
] as const;

export const FEATURED_GENRES = [
  "Gospel",
  "Afrobeat",
  "Worship",
  "Praise",
  "Romantic",
  "Hip Hop",
  "R&B",
  "Traditional",
  "Reggae",
  "Other",
] as const;

/** Four feature tiles on the public landing (mockup). */
export const LANDING_HERO_FEATURES: {
  title: string;
  description: string;
  icon: HubIconName;
}[] = [
  {
    title: "AI Lyrics Generation",
    description: "Automatic transcription and timing—start from your audio, not a blank page.",
    icon: "sparkles",
  },
  {
    title: "Professional Templates",
    description: "Gospel, Afrobeat, cinematic, karaoke, and modern styles ready to render.",
    icon: "templates",
  },
  {
    title: "Easy Customization",
    description: "Fonts, colors, animation, and backgrounds in a live preview editor.",
    icon: "sliders",
  },
  {
    title: "Share Anywhere",
    description: "Export MP4 for TikTok, YouTube, Reels, and square feeds.",
    icon: "share",
  },
];

export const LANDING_FEATURES: {
  title: string;
  description: string;
  icon: HubIconName;
}[] = [
  {
    title: "AI Lyrics Generation",
    description: "Transcribe vocals automatically—no typing from scratch.",
    icon: "sparkles",
  },
  {
    title: "Automatic Language Detection",
    description: "Eight Ugandan languages with confidence scores.",
    icon: "globe",
  },
  {
    title: "Automatic Lyrics Sync",
    description: "Line and word timing ready for karaoke-style video.",
    icon: "timer",
  },
  {
    title: "Video Lyrics Editor",
    description: "Preview while your clip or track plays.",
    icon: "videos",
  },
  {
    title: "Unique Video Templates",
    description: "Gospel, Afrobeat, cinematic, TikTok, and more.",
    icon: "templates",
  },
  {
    title: "Audio-to-Lyrics Video",
    description: "Upload MP3/WAV—pick a template background.",
    icon: "audio",
  },
  {
    title: "Video-to-Lyrics Video",
    description: "Upload a clip—lyrics overlay on your footage.",
    icon: "videoClip",
  },
  {
    title: "Share & Export",
    description: "16:9, 9:16, 1:1—MP4 ready for every platform.",
    icon: "download",
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Gospel",
  "Worship",
  "Afrobeat",
  "Romantic",
  "Cinematic",
  "Modern",
  "Karaoke",
  "Nature",
] as const;

export const TEMPLATE_GRADIENTS = [
  "from-violet-600 via-fuchsia-600 to-amber-500",
  "from-blue-700 via-indigo-800 to-purple-900",
  "from-amber-600 via-orange-600 to-rose-700",
  "from-emerald-700 via-teal-800 to-cyan-900",
  "from-rose-600 via-pink-700 to-violet-800",
  "from-slate-700 via-zinc-800 to-black",
  "from-yellow-500 via-amber-600 to-red-700",
  "from-sky-600 via-blue-700 to-indigo-900",
] as const;
