import fs from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, HeadObjectCommand, DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { createUploadToken } from "./uploadToken.js";

type UploadInput = { objectKey: string; contentType: string; maxSizeBytes: number; expiresInSeconds: number };
type StorageProvider = {
  createUploadUrl(input: UploadInput): Promise<{ uploadUrl: string; objectKey: string; expiresIn: number; method: "PUT"; headers: Record<string, string> }>;
  createDownloadUrl(input: { objectKey: string; expiresInSeconds: number }): Promise<string>;
  objectExists(objectKey: string): Promise<boolean>;
  deleteObject(objectKey: string): Promise<void>;
  getObjectToFile(objectKey: string, destination: string): Promise<void>;
  putFileFromPath(objectKey: string, filePath: string, contentType: string): Promise<void>;
};

class LocalStorageProvider implements StorageProvider {
  async createUploadUrl(input: UploadInput) {
    const expiresAt = Date.now() + input.expiresInSeconds * 1000;
    const token = createUploadToken({ objectKey: input.objectKey, contentType: input.contentType, maxSize: input.maxSizeBytes, expiresAt });
    return { uploadUrl: `${env.publicBaseUrl}/api/v1/uploads/put?token=${encodeURIComponent(token)}`, objectKey: input.objectKey, expiresIn: expiresAt, method: "PUT" as const, headers: { "Content-Type": input.contentType } };
  }
  async createDownloadUrl(input: { objectKey: string; expiresInSeconds: number }) {
    const expiresAt = Date.now() + input.expiresInSeconds * 1000;
    const token = createUploadToken({ objectKey: input.objectKey, contentType: "application/octet-stream", maxSize: 0, expiresAt });
    return `${env.publicBaseUrl}/api/v1/uploads/get?token=${encodeURIComponent(token)}`;
  }
  async objectExists(key: string) { try { await fs.access(path.join(env.storageRoot, key)); return true; } catch { return false; } }
  async deleteObject(key: string) { await fs.rm(path.join(env.storageRoot, key), { force: true }); }
  async getObjectToFile(key: string, destination: string) { await fs.mkdir(path.dirname(destination), { recursive: true }); await fs.copyFile(path.join(env.storageRoot, key), destination); }
  async putFileFromPath(key: string, filePath: string, contentType: string) { void contentType; const dest = path.join(env.storageRoot, key); await fs.mkdir(path.dirname(dest), { recursive: true }); await fs.copyFile(filePath, dest); }
}

class S3StorageProvider implements StorageProvider {
  private client = new S3Client({ region: env.storageRegion, endpoint: env.storageEndpoint || undefined, forcePathStyle: env.storageForcePathStyle, credentials: env.storageAccessKey && env.storageSecretKey ? { accessKeyId: env.storageAccessKey, secretAccessKey: env.storageSecretKey } : undefined });
  async createUploadUrl(input: UploadInput) { const command = new PutObjectCommand({ Bucket: env.storageBucket, Key: input.objectKey, ContentType: input.contentType }); return { uploadUrl: await getSignedUrl(this.client, command, { expiresIn: input.expiresInSeconds }), objectKey: input.objectKey, expiresIn: input.expiresInSeconds, method: "PUT" as const, headers: { "Content-Type": input.contentType } }; }
  async createDownloadUrl(input: { objectKey: string; expiresInSeconds: number }) { return getSignedUrl(this.client, new GetObjectCommand({ Bucket: env.storageBucket, Key: input.objectKey }), { expiresIn: input.expiresInSeconds }); }
  async objectExists(key: string) { try { await this.client.send(new HeadObjectCommand({ Bucket: env.storageBucket, Key: key })); return true; } catch { return false; } }
  async deleteObject(key: string) { await this.client.send(new DeleteObjectCommand({ Bucket: env.storageBucket, Key: key })); }
  async getObjectToFile(key: string, destination: string) { const result = await this.client.send(new GetObjectCommand({ Bucket: env.storageBucket, Key: key })); await fs.mkdir(path.dirname(destination), { recursive: true }); await (result.Body as any).transformToByteArray().then((data: Uint8Array) => fs.writeFile(destination, data)); }
  async putFileFromPath(key: string, filePath: string, contentType: string) { await this.client.send(new PutObjectCommand({ Bucket: env.storageBucket, Key: key, Body: await fs.readFile(filePath), ContentType: contentType })); }
}

let provider: StorageProvider | undefined;
export function getStorageProvider(): StorageProvider { return provider ??= env.storageDriver === "s3" ? new S3StorageProvider() : new LocalStorageProvider(); }
