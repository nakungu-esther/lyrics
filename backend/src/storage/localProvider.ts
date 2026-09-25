import fs from "node:fs/promises";
import path from "node:path";
import type { DownloadUrlResult, StorageProvider, UploadUrlResult } from "./types.js";
import { absolutePath } from "../lib/storage.js";
import { env } from "../config/env.js";
import { createUploadToken } from "./uploadToken.js";

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";

  async createUploadUrl(input: {
    objectKey: string;
    contentType: string;
    maxSizeBytes: number;
    expiresInSeconds: number;
  }): Promise<UploadUrlResult> {
    const exp = Date.now() + input.expiresInSeconds * 1000;
    const token = createUploadToken({
      objectKey: input.objectKey,
      contentType: input.contentType,
      maxSize: input.maxSizeBytes,
      exp,
    });
    const uploadUrl = `${env.publicBaseUrl}/api/v1/uploads/put?token=${encodeURIComponent(token)}`;
    return {
      uploadUrl,
      objectKey: input.objectKey,
      expiresIn: input.expiresInSeconds,
      method: "PUT",
      headers: { "Content-Type": input.contentType },
    };
  }

  async createDownloadUrl(input: {
    objectKey: string;
    expiresInSeconds: number;
  }): Promise<DownloadUrlResult> {
    const exp = Date.now() + input.expiresInSeconds * 1000;
    const token = createUploadToken({
      objectKey: input.objectKey,
      contentType: "application/octet-stream",
      maxSize: 0,
      exp,
    });
    return {
      downloadUrl: `${env.publicBaseUrl}/api/v1/uploads/get?token=${encodeURIComponent(token)}`,
      expiresIn: input.expiresInSeconds,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    await fs.unlink(absolutePath(objectKey)).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") throw err;
    });
  }

  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await fs.access(absolutePath(objectKey));
      return true;
    } catch {
      return false;
    }
  }

  async getObjectToFile(objectKey: string, destinationPath: string): Promise<void> {
    const src = absolutePath(objectKey);
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(src, destinationPath);
  }

  async putFileFromPath(
    objectKey: string,
    sourcePath: string,
    _contentType: string,
  ): Promise<void> {
    const dest = absolutePath(objectKey);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(sourcePath, dest);
  }
}
