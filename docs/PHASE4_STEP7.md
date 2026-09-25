# Phase 4 — Step 7: Real media upload system

## Architecture

```
Browser → POST /uploads/presign → short-lived upload URL
Browser → PUT uploadUrl → Object storage (local dev or S3)
Browser → POST /uploads/complete → PostgreSQL metadata (object keys)
Playback → GET /songs/:id/audio-url → signed download URL
```

Secrets (`STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`) stay on the server only.

## Migration

```powershell
cd backend
npx prisma migrate dev --name song_media_objects
npx prisma generate
```

Adds `Song.*ObjectKey`, content types, sizes, and upload timestamps.

## Environment variables

See `backend/.env.example`.

| Variable | Purpose |
|----------|---------|
| `STORAGE_DRIVER` | `local` (default) or `s3` |
| `STORAGE_ROOT` | Local disk root when `local` |
| `PUBLIC_BASE_URL` | API base for local signed PUT/GET URLs |
| `STORAGE_*` | S3-compatible endpoint, bucket, keys |
| `MAX_*_FILE_SIZE_MB` | Upload limits |
| `UPLOAD_SIGNING_SECRET` | HMAC for local dev upload tokens |

### Local development (default)

No cloud bucket required. Files land under `STORAGE_ROOT` with keys like `songs/{songId}/audio/{uuid}.mp3`.

### S3 / Cloudflare R2 / MinIO

```env
STORAGE_DRIVER=s3
STORAGE_ENDPOINT=https://....r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_BUCKET=nyimba-media
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_FORCE_PATH_STYLE=true
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/uploads/presign` | Signed upload URL + object key |
| POST | `/api/v1/uploads/complete` | Persist metadata after PUT |
| PUT | `/api/v1/uploads/put?token=` | Local dev direct upload |
| GET | `/api/v1/uploads/get?token=` | Local dev signed download |
| GET | `/api/v1/songs/:id/audio-url` | Signed audio playback URL |
| GET | `/api/v1/songs/:id/cover-url` | Signed cover URL |
| DELETE | `/api/v1/songs/:id/media` | Remove media reference (+ delete blob) |

## Frontend flow

1. `/artist/songs/new` — create **DRAFT**
2. Upload cover → audio → optional video (progress bar, retry)
3. `/artist/songs/:id/edit` — replace media safely (DB updated before old blob delete)

## Test audio upload (local)

1. `npm run dev` with `STORAGE_DRIVER=local`
2. Create song draft
3. Choose an MP3 — watch progress → ✓ Uploaded
4. Refresh song detail — audio shows “Uploaded to storage”
5. `GET /api/v1/songs/{id}/audio-url` with Bearer token returns `{ downloadUrl, expiresIn }`

```powershell
cd backend
npm test
```

## Next step

Redis + BullMQ + FFmpeg processing (status → `PROCESSING`), then language detection and Luganda transcription — **not** part of Step 7.
