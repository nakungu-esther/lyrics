const baseUrl = import.meta.env.VITE_API_URL ?? "";

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function buildUrl(path: string): string {
  return baseUrl ? `${baseUrl}${path}` : path;
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
      success?: boolean;
      message?: string;
      errors?: { code?: string }[];
    };
    const message =
      body.message ??
      body.error?.message ??
      (typeof body.error?.message === "string" ? body.error.message : res.statusText);
    const code =
      body.errors?.[0] && typeof body.errors[0] === "object" && "code" in body.errors[0]
        ? String((body.errors[0] as { code?: string }).code ?? "ERROR")
        : (body.error?.code ?? "ERROR");
    return new ApiError(res.status, code, message);
  } catch {
    return new ApiError(res.status, "ERROR", res.statusText);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    credentials: "include",
    headers,
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

/** Authenticated download (e.g. LRC export). */
export async function apiDownload(path: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    headers,
  });
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function apiFormPost<T>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetch(buildUrl(path), {
    method: "POST",
    credentials: "include",
    headers,
    body: form,
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}
