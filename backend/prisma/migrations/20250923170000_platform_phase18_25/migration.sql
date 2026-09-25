-- Phases 18–25: render statuses, export formats, verification, analytics, billing stub

CREATE TYPE "RenderJobStatus_new" AS ENUM ('QUEUED', 'PROCESSING', 'RENDERING', 'COMPLETED', 'FAILED');

ALTER TABLE "RenderJob" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RenderJob" ALTER COLUMN "status" TYPE "RenderJobStatus_new" USING (
  CASE "status"::text
    WHEN 'ACTIVE' THEN 'PROCESSING'::"RenderJobStatus_new"
    WHEN 'DELAYED' THEN 'QUEUED'::"RenderJobStatus_new"
    ELSE "status"::text::"RenderJobStatus_new"
  END
);
ALTER TABLE "RenderJob" ALTER COLUMN "status" SET DEFAULT 'QUEUED';

DROP TYPE "RenderJobStatus";
ALTER TYPE "RenderJobStatus_new" RENAME TO "RenderJobStatus";

CREATE TYPE "ExportFormat" AS ENUM ('YOUTUBE_16_9', 'TIKTOK_9_16', 'REELS_9_16', 'SQUARE_1_1');

ALTER TABLE "RenderJob" ADD COLUMN "exportFormat" "ExportFormat" NOT NULL DEFAULT 'YOUTUBE_16_9';
ALTER TABLE "RenderJob" ADD COLUMN "resolutionHeight" INTEGER NOT NULL DEFAULT 1080;

CREATE TYPE "AnalyticsEventType" AS ENUM ('SONG_VIEW', 'AUDIO_PLAY', 'LYRICS_VIEW', 'VIDEO_VIEW', 'DOWNLOAD');

CREATE TABLE "AnalyticsEvent" (
    "id" UUID NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "songId" UUID,
    "artistId" UUID,
    "userId" UUID,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_artistId_eventType_createdAt_idx" ON "AnalyticsEvent"("artistId", "eventType", "createdAt");
CREATE INDEX "AnalyticsEvent_songId_eventType_idx" ON "AnalyticsEvent"("songId", "eventType");

ALTER TABLE "Artist" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);

CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'ARTIST_PRO');

ALTER TABLE "User" ADD COLUMN "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';
