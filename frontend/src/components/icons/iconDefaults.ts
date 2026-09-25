/** Shared Lucide sizing for LyricsHub — keep stroke consistent app-wide. */
export const ICON_STROKE = 2;

export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  /** Sidebar / nav items */
  nav: 18,
  /** Mobile bottom nav */
  tab: 22,
  /** Upload zones, feature tiles */
  feature: 28,
  /** Empty states */
  empty: 40,
} as const;

export type IconSizeToken = keyof typeof ICON_SIZE;
