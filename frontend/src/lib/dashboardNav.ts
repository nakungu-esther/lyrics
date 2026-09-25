import type { HubIconName } from "../components/icons/HubIcon";

export type NavItem = {
  to: string;
  label: string;
  end?: boolean;
  icon: HubIconName;
};

/** Mockup primary user sidebar (Home first, Create at bottom in component). */
export const USER_DASHBOARD_PRIMARY: NavItem[] = [
  { to: "/dashboard", label: "Home", end: true, icon: "home" },
  { to: "/dashboard/videos", label: "My Videos", icon: "videos" },
  { to: "/dashboard/songs", label: "My Songs", icon: "songs" },
  { to: "/dashboard/templates", label: "Templates", icon: "templates" },
];

export const USER_DASHBOARD_MORE: NavItem[] = [
  { to: "/dashboard/projects", label: "My Projects", icon: "projects" },
  { to: "/dashboard/playlists", label: "Playlists", icon: "playlists" },
  { to: "/dashboard/recent", label: "Recently Played", icon: "recent" },
  { to: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export const ARTIST_DASHBOARD_NAV: NavItem[] = [
  { to: "/artist/dashboard", label: "Dashboard", end: true, icon: "home" },
  { to: "/artist/songs", label: "My Songs", icon: "songs" },
  { to: "/artist/albums", label: "My Albums", icon: "albums" },
  { to: "/artist/lyrics", label: "Lyrics", icon: "lyrics" },
  { to: "/artist/videos", label: "Music Videos", icon: "videos" },
  { to: "/artist/analytics", label: "Analytics", icon: "analytics" },
  { to: "/artist/profile", label: "Profile", icon: "profile" },
  { to: "/artist/settings", label: "Settings", icon: "settings" },
];

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Overview", end: true, icon: "home" },
  { to: "/admin/users", label: "Users", icon: "users" },
  { to: "/admin/artists", label: "Artists", icon: "artist" },
  { to: "/admin/songs", label: "Songs", icon: "songs" },
  { to: "/admin/albums", label: "Albums", icon: "albums" },
  { to: "/admin/languages", label: "Languages", icon: "globe" },
  { to: "/admin/templates", label: "Templates", icon: "templates" },
  { to: "/admin/reports", label: "Reports", icon: "alert" },
  { to: "/admin/verification", label: "Verification", icon: "verified" },
  { to: "/admin/settings", label: "Settings", icon: "settings" },
];
