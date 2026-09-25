-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Backfill names from legacy displayName
UPDATE "User"
SET
  "firstName" = COALESCE(NULLIF(split_part(trim("displayName"), ' ', 1), ''), "displayName"),
  "lastName" = CASE
    WHEN position(' ' in trim("displayName")) > 0
    THEN NULLIF(trim(substring(trim("displayName") from position(' ' in trim("displayName")) + 1)), '')
    ELSE NULL
  END
WHERE "displayName" IS NOT NULL AND trim("displayName") <> '';
