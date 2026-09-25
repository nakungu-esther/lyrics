# Phase 2 — Database (Step 2)

## Lyrics hierarchy (karaoke)

```text
Song
 └── Lyrics (versioned, status: AI_GENERATED → … → ARTIST_VERIFIED)
      └── LyricSection  (e.g. Verse 1, Chorus — sortOrder, sectionType, label)
            └── LyricLine   (full line text, optional line-level times)
                  └── LyricWord  (text, startTime, endTime, confidence, language)
```

Example:

```text
Song: "My Track"
 └── Lyrics v1
      └── Section "Verse 1" (VERSE)
           ├── Line 1: "Nze nkuyagala nnyo"
           │    ├── Nze       12.20 – 12.60
           │    ├── nkuyagala 12.60 – 13.50
           │    └── nnyo       13.50 – 14.10
           └── Line 2: ...
```

## Schema location

`backend/prisma/schema.prisma`

## Song fields (highlights)

| Field | Purpose |
|-------|---------|
| `title` | Display title |
| `durationSeconds` | Length |
| `audioUrl` | Audio file URL (object storage or CDN) |
| `coverImageUrl` | Artwork |
| `status` | `DRAFT` … `PUBLISHED` |
| `releaseDate` | Release metadata |

## Apply migration (Neon)

1. Set `DATABASE_URL` in `backend/.env`
2. From repo root:

```bat
npm run db:migrate
```

When prompted for a name on first apply, Prisma uses the existing migration `20250923120000_phase2_init`.

Or deploy without prompts (CI/production):

```bat
cd backend
npx prisma migrate deploy
```

## Seed languages (after migrate)

Run in Neon SQL editor or `npx prisma db execute --file prisma/seed-languages.sql`:

See `backend/prisma/seed-languages.sql`.
