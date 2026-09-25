-- Phase 7+ — language detection on songs, typed processing jobs

CREATE TYPE "ProcessingJobType" AS ENUM ('AUDIO', 'LANGUAGE', 'TRANSCRIBE');

ALTER TABLE "Song" ADD COLUMN "detectedLanguageCode" VARCHAR(16);
ALTER TABLE "Song" ADD COLUMN "languageConfidence" DOUBLE PRECISION;
ALTER TABLE "Song" ADD COLUMN "languageConfirmed" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ProcessingJob" ADD COLUMN "jobType" "ProcessingJobType" NOT NULL DEFAULT 'AUDIO';

CREATE INDEX "Song_primaryLanguageCode_idx" ON "Song"("primaryLanguageCode");
CREATE INDEX "Song_detectedLanguageCode_idx" ON "Song"("detectedLanguageCode");
