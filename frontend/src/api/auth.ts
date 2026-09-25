import { apiGet, apiPost } from "./client";
import type { AuthResponse, AuthUser, DashboardResponse } from "../features/auth/types";

type AuthPayload = AuthResponse & {
  success?: boolean;
  data?: AuthResponse;
};

type MePayload = {
  user: AuthUser;
  success?: boolean;
  data?: { user: AuthUser };
};

export function parseAuthResponse(body: AuthPayload): AuthResponse {
  const user = body.user ?? body.data?.user;
  const accessToken = body.accessToken ?? body.data?.accessToken;
  if (!user || !accessToken) {
    throw new Error("Invalid authentication response from server");
  }
  return { user, accessToken };
}

export function parseMeResponse(body: MePayload): AuthUser {
  const user = body.user ?? body.data?.user;
  if (!user) {
    throw new Error("Invalid user response from server");
  }
  return user;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const body = await apiPost<AuthPayload>("/api/v1/auth/login", {
    email,
    password,
  });
  return parseAuthResponse(body);
}

export async function registerRequest(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  const body = await apiPost<AuthPayload>("/api/v1/auth/register", input);
  return parseAuthResponse(body);
}

export async function refreshSessionRequest(): Promise<AuthResponse> {
  const body = await apiPost<AuthPayload>("/api/v1/auth/refresh");
  return parseAuthResponse(body);
}

export async function logoutRequest(): Promise<void> {
  await apiPost<{ ok?: boolean; success?: boolean }>("/api/v1/auth/logout");
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const body = await apiGet<MePayload>("/api/v1/auth/me");
  return parseMeResponse(body);
}

export async function fetchDashboardSummary(): Promise<DashboardResponse> {
  const body = await apiGet<DashboardResponse & { data?: DashboardResponse }>(
    "/api/v1/auth/dashboard",
  );
  if (body.stats) return body;
  if (body.data?.stats) return body.data;
  throw new Error("Invalid dashboard response");
}
