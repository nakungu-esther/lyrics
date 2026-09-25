# Phases 14–17 — Lyrics video generator

## Templates (launch set of 3)

| Slug | Name |
|------|------|
| `classic` | Classic |
| `karaoke` | Karaoke |
| `music-video-overlay` | Music Video Overlay |

Additional styles (Afrobeat, Gospel, etc.) can be added as new `VideoTemplate` rows later.

Templates are upserted on API startup and via `backend/prisma/seed-video-templates.sql`.

## Flow

1. **Create project** — `/artist/videos/new` → song → lyrics → template
2. **Customize** — `/artist/videos/:id` — font, size, colors, position, animation, background + live preview
3. **Render** — BullMQ queue `video-render` → FFmpeg + ASS subtitles → `outputVideoUrl`

## Music video upload (Phase 17)

`POST /api/v1/songs/music-video` (multipart `video` + `title`)

Pipeline: **MUSIC_VIDEO** job → extract audio → **LANGUAGE** → confirm → **TRANSCRIBE** → sync in lyrics editor → render with overlay template (original MP4 as background).

## API

- `GET /api/v1/video-templates`
- `GET /api/v1/video-projects/songs` — songs eligible for video
- `POST /api/v1/video-projects` — `{ songId, lyricsId, templateId }`
- `GET/PATCH /api/v1/video-projects/:id` · `PATCH .../customizations`
- `POST /api/v1/video-projects/:id/render`
- `GET /api/v1/render-jobs/:id`

## Migration

`20250923160000_video_media` — `Song.mediaSource`, `Song.backgroundVideoUrl`, `ProcessingJobType.MUSIC_VIDEO`.

Run: `npm run db:migrate`

Worker must listen on **both** `song-audio-process` and `video-render` (`npm run dev:worker`).
