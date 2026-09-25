export const artistKeys = {
  all: ["artist"] as const,
  me: ["artist", "me"] as const,
  dashboard: ["artist", "dashboard"] as const,
  public: (id: string) => ["artist", "public", id] as const,
};
