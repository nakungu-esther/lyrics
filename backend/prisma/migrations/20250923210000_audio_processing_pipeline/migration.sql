-- SongStatus: audio pipeline complete (before lyrics / review)
ALTER TYPE "SongStatus" ADD VALUE IF NOT EXISTS 'AUDIO_READY';

-- ProcessingJobStatus: ACTIVE -> PROCESSING
CREATE TYPE "ProcessingJobStatus_new" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

ALTER TABLE "ProcessingJob" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "ProcessingJob" ALTER COLUMN "status" TYPE "ProcessingJobStatus_new" USING (
  CASE
    WHEN "status"::text = 'ACTIVE' THEN 'PROCESSING'::"ProcessingJobStatus_new"
    ELSE "status"::text::"ProcessingJobStatus_new"
  END
);

ALTER TABLE "ProcessingJob" ALTER COLUMN "status" SET DEFAULT 'QUEUED';

DROP TYPE "ProcessingJobStatus";

ALTER TYPE "ProcessingJobStatus_new" RENAME TO "ProcessingJobStatus";

ALTER TABLE "ProcessingJob" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProcessingJob" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "ProcessingJob" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);
ALTER TABLE "ProcessingJob" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "audioCodec" TEXT;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "audioSampleRate" INTEGER;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "audioChannels" INTEGER;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "audioBitrate" INTEGER;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "processedAudioObjectKey" TEXT;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "processedAudioContentType" TEXT;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "processedAudioSize" BIGINT;
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "processedAudioUploadedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ProcessingJob_songId_jobType_createdAt_idx"
  ON "ProcessingJob"("songId", "jobType", "createdAt");
