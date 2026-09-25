ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "subgenre" TEXT;

CREATE INDEX IF NOT EXISTS "Song_genre_subgenre_idx" ON "Song"("genre", "subgenre");
