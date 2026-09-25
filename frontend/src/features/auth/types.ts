export type UserRole = "USER" | "ARTIST" | "ADMIN";

/** Safe user shape from the API — never includes passwordHash. */
export type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  isActive?: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type DashboardResponse = {
  user: AuthUser;
  stats: {
    songs: number;
    playlists: number;
    videos: number;
    recentlyPlayed: unknown[];
  };
};
