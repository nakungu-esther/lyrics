-- Song language workflow
CREATE TYPE "SongLanguageState" AS ENUM (
  'NOT_DETECTED',
  'DETECTED',
  'CONFIRMATION_REQUIRED',
  'CONFIRMED'
);

CREATE TYPE "LanguageSegmentSource" AS ENUM (
  'AI_DETECTED',
  'ARTIST_CONFIRMED',
  'ADMIN_REVIEWED'
);

ALTER TYPE "SongStatus" ADD VALUE IF NOT EXISTS 'LANGUAGE_CONFIRMED';

ALTER TYPE "ProcessingJobType" ADD VALUE IF NOT EXISTS 'LANGUAGE_DETECTION';

ALTER TABLE "Language" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Language" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "languageState" "SongLanguageState" NOT NULL DEFAULT 'NOT_DETECTED';
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "languageConfirmedAt" TIMESTAMP(3);

CREATE TABLE "LanguageDetectionRun" (
    "id" UUID NOT NULL,
    "songId" UUID NOT NULL,
    "processingJobId" UUID,
    "primaryLanguageCode" VARCHAR(16) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "alternatives" JSONB,
    "segmentSnapshot" JSONB,
    "providerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LanguageDetectionRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LanguageSegment" (
    "id" UUID NOT NULL,
    "songId" UUID NOT NULL,
    "languageCode" VARCHAR(16) NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION,
    "source" "LanguageSegmentSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LanguageSegment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LanguageDetectionRun_songId_createdAt_idx" ON "LanguageDetectionRun"("songId", "createdAt");
CREATE INDEX "LanguageSegment_songId_source_idx" ON "LanguageSegment"("songId", "source");
CREATE INDEX "LanguageSegment_songId_startTime_idx" ON "LanguageSegment"("songId", "startTime");

ALTER TABLE "LanguageDetectionRun" ADD CONSTRAINT "LanguageDetectionRun_songId_fkey"
  FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LanguageSegment" ADD CONSTRAINT "LanguageSegment_songId_fkey"
  FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LanguageSegment" ADD CONSTRAINT "LanguageSegment_languageCode_fkey"
  FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
