import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { env } from "../config/env.js";
import type { DownloadUrlResult, StorageProvider, UploadUrlResult } from "./types.js";

export class S3StorageProvider implements StorageProvider {
  readonly name = "s3";
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: env.storageRegion,
      endpoint: env.storageEndpoint || undefined,
      forcePathStyle: env.storageForcePathStyle,
      credentials: {
        accessKeyId: env.storageAccessKey,
        secretAccessKey: env.storageSecretKey,
      },
    });
  }

  async createUploadUrl(input: {
    objectKey: string;
    contentType: string;
    maxSizeBytes: number;
    expiresInSeconds: number;
  }): Promise<UploadUrlResult> {
    const command = new PutObjectCommand({
      Bucket: env.storageBucket,
      Key: input.objectKey,
      ContentType: input.contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    });
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
    const command = new GetObjectCommand({
      Bucket: env.storageBucket,
      Key: input.objectKey,
    });
    const downloadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    });
    return {
      downloadUrl,
      expiresIn: input.expiresInSeconds,
    };
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: env.storageBucket,
        Key: objectKey,
      }),
    );
  }

  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: env.storageBucket,
          Key: objectKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getObjectToFile(objectKey: string, destinationPath: string): Promise<void> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: env.storageBucket,
        Key: objectKey,
      }),
    );
    if (!response.Body) {
      throw new Error("Empty object body");
    }
    await fsPromises.mkdir(path.dirname(destinationPath), { recursive: true });
    await pipeline(response.Body as NodeJS.ReadableStream, fs.createWriteStream(destinationPath));
  }

  async putFileFromPath(
    objectKey: string,
    sourcePath: string,
    contentType: string,
  ): Promise<void> {
    const body = fs.createReadStream(sourcePath);
    const stat = await fsPromises.stat(sourcePath);
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.storageBucket,
        Key: objectKey,
        Body: body,
        ContentType: contentType,
        ContentLength: stat.size,
      }),
    );
  }
}
