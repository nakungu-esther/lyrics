# Phase 5 — Step 8: Audio processing pipeline

## Architecture

```
POST /uploads/complete (SONG_AUDIO)
    → ProcessingJob (QUEUED)
    → BullMQ queue: media-processing
    → Worker (separate process)
    → Download original from StorageProvider
    → FFprobe metadata
    → FFmpeg normalize → WAV 16 kHz mono
    → Upload songs/{songId}/audio/processed/master.wav
    → Song.status = AUDIO_READY
```

Original upload keys stay under `songs/{songId}/audio/original/…` (or legacy paths). Processed audio is never written over the original.

## Migration

```powershell
cd backend
npx prisma migrate dev
npx prisma generate
```

Migration: `20250923210000_audio_processing_pipeline`

- `SongStatus.AUDIO_READY`
- `ProcessingJobStatus.PROCESSING` (replaces `ACTIVE`)
- Processed audio + probe fields on `Song`
- `ProcessingJob.attempts`, `metadata`, `startedAt`, `completedAt`

## Environment

| Variable | Purpose |
|----------|---------|
| `REDIS_URL` | BullMQ (required for production-style workers) |
| `WORKER_TEMP_DIR` | FFmpeg temp dir (default: OS temp / `nyimba`) |
| `AUDIO_TARGET_SAMPLE_RATE` | Default `16000` |
| `AUDIO_TARGET_CHANNELS` | Default `1` (mono) |
| `BULLMQ_JOB_ATTEMPTS` | Default `3` |
| `BULLMQ_BACKOFF_MS` | Exponential backoff base |
| `MEDIA_WORKER_CONCURRENCY` | Parallel jobs per worker |

## npm scripts

| Script | Where | Purpose |
|--------|-------|---------|
| `npm run dev` | repo root | API + frontend |
| `npm run dev:all` | repo root | API + frontend + all workers |
| `npm run dev:backend` | root / backend | Express API |
| `npm run dev:worker` | root | `worker/main.ts` (media + legacy pipeline + video) |
| `npm run worker:media` | backend | Media worker only |

## Local stack

```powershell
docker compose up -d redis
cd backend
npx prisma migrate dev
npm run dev
```

Separate terminal:

```powershell
cd backend
npm run worker:media
```

Health:

- `GET /health/ready` — API + PostgreSQL + Redis
- `GET /health/redis`

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/songs/:id/processing-status` | Progress + stage for AUDIO job |
| POST | `/api/v1/songs/:id/retry-processing` | Re-queue without re-upload |

Upload complete for `SONG_AUDIO` returns `processingJobId` in `data`.

## Test flow

1. Artist creates draft, uploads MP3.
2. UI shows **Queued → Processing** with progress polling (2s).
3. Worker logs `media-processing` completion.
4. Song status **Audio ready**; `media.audio.processed === true`.
5. Original object key unchanged; `processedAudioObjectKey` set.
6. `POST .../retry-processing` if worker was down.

## Next step

Language detection and transcription queues (`LANGUAGE`, `TRANSCRIBE`) — not started in Step 8.
