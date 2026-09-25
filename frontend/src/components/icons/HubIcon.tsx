import type { LucideIcon } from "lucide-react";

import {

  AlertCircle,

  AlignLeft,

  AudioLines,

  BadgeCheck,

  BarChart3,

  Bell,

  Check,

  Circle,

  Clock,

  Disc3,

  Download,

  Eye,

  FolderOpen,

  Heart,

  Home,

  Image,

  Languages,

  Leaf,

  ListMusic,

  Menu,

  Mic2,

  Monitor,

  Music,

  Music2,

  Palette,

  Pause,

  Pencil,

  Play,

  Plus,

  Search,

  Settings,

  Share2,

  SlidersHorizontal,

  Smartphone,

  Sparkles,

  Square,

  Timer,

  Trash2,

  Type,

  Upload,

  User,

  Users,

  Video,

  Zap,

  type LucideProps,

} from "lucide-react";

import { ICON_STROKE } from "./iconDefaults";



/**

 * LyricsHub semantic icon registry — all map to Lucide React components.

 * Use HubIcon / IconButton instead of importing Lucide in every file when a semantic name exists.

 */

export const HUB_ICONS = {

  dashboard: Home,

  home: Home,

  videos: Video,

  songs: Music,

  music: Music2,

  projects: FolderOpen,

  templates: Palette,

  playlists: ListMusic,

  recent: Clock,

  settings: Settings,

  create: Plus,

  upload: Upload,

  search: Search,

  alert: AlertCircle,
  analytics: BarChart3,

  profile: User,

  users: Users,

  albums: Disc3,

  lyrics: AlignLeft,

  artist: Mic2,

  videoClip: Video,

  audio: AudioLines,

  sparkles: Sparkles,

  effects: Sparkles,

  globe: Languages,

  leaf: Leaf,

  timer: Timer,

  timeline: Timer,

  export: Download,

  download: Download,

  share: Share2,

  play: Play,

  pause: Pause,

  edit: Pencil,

  pencil: Pencil,

  delete: Trash2,

  trash: Trash2,

  type: Type,

  font: Type,

  text: Type,

  image: Image,

  palette: Palette,

  color: Palette,

  wand: Sparkles,

  check: Check,

  verified: BadgeCheck,

  pending: Circle,

  eye: Eye,

  chart: BarChart3,

  mic: Mic2,

  heart: Heart,

  fire: Zap,

  classic: Sparkles,

  overlay: Video,

  karaoke: Mic2,

  phone: Smartphone,

  monitor: Monitor,

  square: Square,

  sliders: SlidersHorizontal,

  bell: Bell,

  menu: Menu,

} as const satisfies Record<string, LucideIcon>;



export type HubIconName = keyof typeof HUB_ICONS;



type HubIconProps = LucideProps & {

  name: HubIconName;

  /** Pixel size (default 20) */

  size?: number;

};



export function HubIcon({ name, className, size = 20, strokeWidth = ICON_STROKE, ...props }: HubIconProps) {

  const Icon = HUB_ICONS[name];

  return <Icon className={className} size={size} strokeWidth={strokeWidth} aria-hidden {...props} />;

}



/** Map template API config to a consistent icon (no emoji from backend). */

export function templateIconName(config: {

  family?: string;

  emoji?: string;

}): HubIconName {

  const family = config.family ?? "";

  if (family === "karaoke" || family === "music-visualizer" || family === "waveform") {

    return "karaoke";

  }

  if (family === "overlay") return "overlay";

  if (

    family.startsWith("worship") ||

    family.startsWith("gospel") ||

    family === "grace" ||

    family === "hallelujah" ||

    family === "african-worship" ||

    family === "praise-energy"

  ) {

    return "heart";

  }

  if (

    family.startsWith("afro") ||

    family === "kampala-nights" ||

    family === "neon-africa" ||

    family === "rhythm" ||

    family === "african-sunset"

  ) {

    return "fire";

  }

  if (

    family.startsWith("love") ||

    family.startsWith("sunset-love") ||

    family === "forever" ||

    family === "soft-hearts"

  ) {

    return "heart";

  }

  if (family === "cinematic") return "videos";

  if (family === "minimal" || family === "minimalist") return "square";

  if (family === "nature") return "leaf";

  if (family === "photo-memories") return "image";

  if (family === "abstract") return "sparkles";

  if (family === "dynamic" || family === "modern-typography") return "fire";

  return "classic";

}



export function exportFormatIcon(format: string): HubIconName {

  switch (format) {

    case "CANVAS_4_3":

      return "image";

    case "TIKTOK_9_16":

    case "REELS_9_16":

      return "phone";

    case "SQUARE_1_1":

      return "square";

    case "YOUTUBE_16_9":

    default:

      return "monitor";

  }

}


