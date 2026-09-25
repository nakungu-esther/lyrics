-- Phase 14–17 — music video source + processing job type

CREATE TYPE "SongMediaSource" AS ENUM ('AUDIO', 'MUSIC_VIDEO');

ALTER TABLE "Song" ADD COLUMN "mediaSource" "SongMediaSource" NOT NULL DEFAULT 'AUDIO';
ALTER TABLE "Song" ADD COLUMN "backgroundVideoUrl" TEXT;

ALTER TYPE "ProcessingJobType" ADD VALUE 'MUSIC_VIDEO';
