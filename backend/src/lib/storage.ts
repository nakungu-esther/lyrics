import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

export async function ensureStorageDirs(): Promise<void> {
  await fs.mkdir(path.join(env.storageRoot, "audio"), { recursive: true });
  await fs.mkdir(path.join(env.storageRoot, "images"), { recursive: true });
  await fs.mkdir(path.join(env.storageRoot, "temp"), { recursive: true });
  await fs.mkdir(path.join(env.storageRoot, "video"), { recursive: true });
  await fs.mkdir(path.join(env.storageRoot, "render"), { recursive: true });
}

/** Public URL path served by API (object-storage compatible layout). */
export function keyFromPublicUrl(url: string): string | null {
  const marker = "/api/v1/files/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

export function publicFileUrl(relativeKey: string): string {
  const key = relativeKey.replace(/\\/g, "/");
  return `${env.publicBaseUrl}/api/v1/files/${key}`;
}

export function absolutePath(relativeKey: string): string {
  return path.join(env.storageRoot, relativeKey);
}

export async function saveUploadedFile(
  tempPath: string,
  relativeKey: string,
): Promise<string> {
  const dest = absolutePath(relativeKey);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.rename(tempPath, dest).catch(async () => {
    await fs.copyFile(tempPath, dest);
    await fs.unlink(tempPath).catch(() => {});
  });
  return publicFileUrl(relativeKey);
}
