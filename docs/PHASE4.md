# Phase 4–6 — Artist, upload, processing

## Routes (frontend)

| Path | Purpose |
|------|---------|
| `/artist/profile` | Artist name, bio, images, genre, location, social links |
| `/artist/dashboard` | Stats + links (songs, albums, lyrics, videos, analytics) |
| `/artist/songs/new` | Upload song (multipart) with Uploading → Processing → Ready |

## API (`/api/v1`)

| Method | Path | Notes |
|--------|------|--------|
| GET/PATCH | `/artists/me` | Profile (any logged-in user) |
| POST | `/artists/me` | Create artist profile (promotes role to ARTIST) |
| POST | `/artists/me/upload-image` | `file` + `kind=profile\|cover` |
| GET | `/artists/me/dashboard` | Counts: songs, albums, lyrics, videos, views |
| POST | `/songs` | `audio` + optional `cover`; fields: title, albumTitle, genre, releaseDate |
| GET | `/songs/me` | Artist’s songs + latest job |
| GET | `/jobs/:id` | Poll processing status |
| GET | `/files/*` | Local object-storage URLs (dev) |

## Processing pipeline

1. API saves source audio under `STORAGE_ROOT` and creates `ProcessingJob` (QUEUED).
2. Job enqueued on BullMQ queue `song-audio-process` when `REDIS_URL` is set.
3. Worker (`npm run dev:worker`) runs FFmpeg → `processed.mp3`, sets `song.audioUrl`, job COMPLETED.
4. Without Redis, the API falls back to in-process processing (dev only).

## Run (three terminals)

```bat
docker compose up -d
npm run dev:backend
npm run dev:frontend
npm run dev:worker
```

Set in `backend/.env`:

- `DATABASE_URL` — Neon
- `REDIS_URL=redis://127.0.0.1:6379`
- `STORAGE_ROOT=./storage`
- `PUBLIC_BASE_URL=http://127.0.0.1:4000`

Apply migrations: `npm run db:migrate`
