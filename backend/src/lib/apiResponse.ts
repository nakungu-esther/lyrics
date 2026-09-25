import type { Response } from "express";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: unknown[];
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  message?: string,
): void {
  const body: ApiSuccess<T> = { success: true, data };
  if (message) body.message = message;
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  errors?: unknown[],
): void {
  const body: ApiErrorBody = { success: false, message };
  if (errors?.length) body.errors = errors;
  res.status(status).json(body);
}

/** Nyimba auth responses also include top-level `user` + `accessToken` for the SPA. */
export function sendAuthResult(
  res: Response,
  status: number,
  payload: { user: unknown; accessToken: string },
): void {
  res.status(status).json({
    success: true,
    data: payload,
    user: payload.user,
    accessToken: payload.accessToken,
  });
}
