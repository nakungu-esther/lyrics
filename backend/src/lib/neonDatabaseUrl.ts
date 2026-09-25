/**
 * Neon pooler URLs work best with explicit SSL + timeouts (Prisma long-running Node).
 */
export function normalizeDatabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed.replace(/^postgresql:/, "http:"));
    const params = url.searchParams;

    if (!params.has("sslmode")) {
      params.set("sslmode", "require");
    }
    if (!params.has("connect_timeout")) {
      params.set("connect_timeout", "15");
    }
    if (url.hostname.includes("neon.tech") && !params.has("pool_timeout")) {
      params.set("pool_timeout", "15");
    }

    url.search = params.toString();
    return url.toString().replace(/^http:/, "postgresql:");
  } catch {
    return trimmed;
  }
}
