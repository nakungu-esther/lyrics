export const songKeys = {
  all: ["songs"] as const,
  list: ["songs", "list"] as const,
  detail: (id: string) => ["songs", "detail", id] as const,
  processing: (id: string) => ["songs", "processing", id] as const,
  albums: ["songs", "albums"] as const,
};
