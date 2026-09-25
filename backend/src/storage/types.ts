export type UploadUrlResult = {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
  /** HTTP method for direct upload (PUT for S3 and local dev) */
  method: "PUT";
  headers?: Record<string, string>;
};

export type DownloadUrlResult = {
  downloadUrl: string;
  expiresIn: number;
};

export interface StorageProvider {
  readonly name: string;
  createUploadUrl(input: {
    objectKey: string;
    contentType: string;
    maxSizeBytes: number;
    expiresInSeconds: number;
  }): Promise<UploadUrlResult>;
  createDownloadUrl(input: {
    objectKey: string;
    expiresInSeconds: number;
  }): Promise<DownloadUrlResult>;
  deleteObject(objectKey: string): Promise<void>;
  objectExists(objectKey: string): Promise<boolean>;
  /** Download object bytes to a local path (workers). */
  getObjectToFile(objectKey: string, destinationPath: string): Promise<void>;
  /** Upload a local file to object storage (workers). */
  putFileFromPath(
    objectKey: string,
    sourcePath: string,
    contentType: string,
  ): Promise<void>;
}
