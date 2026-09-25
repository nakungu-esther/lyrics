-- Rename enum value to match product terminology (VERIFIED artist)
ALTER TYPE "VerificationStatus" RENAME VALUE 'APPROVED' TO 'VERIFIED';

-- Artist profile fields & one profile per user
ALTER TABLE "Artist" ADD COLUMN IF NOT EXISTS "website" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Artist_ownerUserId_key" ON "Artist"("ownerUserId");
