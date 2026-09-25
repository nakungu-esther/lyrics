import crypto from "node:crypto";
import { env } from "../config/env.js";

export type UploadTokenPayload = { objectKey: string; contentType: string; maxSize: number; expiresAt: number };

export function createUploadToken(payload: UploadTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", env.uploadSigningSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyUploadToken(token: string): UploadTokenPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", env.uploadSigningSecret).update(body).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as UploadTokenPayload;
    return payload.expiresAt > Date.now() && typeof payload.objectKey === "string" ? payload : null;
  } catch { return null; }
}
