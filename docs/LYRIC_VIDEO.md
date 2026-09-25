# Lyric video workflow

## Who it is for

- **Artists** publishing official lyric videos for catalog songs.
- **Any logged-in user** making a one-off video from a **short phone clip** (personal creator profile is created on first use).

## Steps (product)

```text
Upload clip → Song / audio → Language + lyrics (AI or manual) → Sync timings
    → Template → Customize → Preview → Render → Download
```

## API

| Step | Endpoint |
|------|----------|
| Ensure creator | `POST /api/v1/creator/setup` |
| Upload clip | `POST /api/v1/creator/clip` (multipart: `video`, fields: `title`, optional `genre`) |
| List songs for video | `GET /api/v1/video-projects/songs` |
| Templates + formats | `GET /api/v1/video-templates` |
| Create project | `POST /api/v1/video-projects` (`songId`, `lyricsId`, `templateId`, optional `exportFormat`) |
| Customize | `PATCH /api/v1/video-projects/:id/customizations` |
| Render | `POST /api/v1/video-projects/:id/render` |
| Poll render | `GET /api/v1/render-jobs/:id` |

## Template config (v2, no video files)

Templates are JSON in `VideoTemplate.config` (`backend/src/lib/templateSchema.ts`): **canvas (4:3 default)**, **background**, **typography**, **highlight**, **animation**, **effects**, **transitions**, **render hints**, and **editableProperties**. The worker builds FFmpeg + ASS output from this config (`templateRenderPlan.ts`, `processVideoRender.ts`). Legacy v1 seeds still load via automatic migration.

## Templates (seeded on API boot)

Seeds live in `backend/src/lib/videoTemplateCatalog.ts` and upsert via `ensureVideoTemplates()`. **~26 original configs** (gradients/solids/cover art only—no bundled stock video). Categories: Gospel (6), Afrobeat (5), Romantic (4), General + core pipeline (`classic`, `karaoke`, `music-video-overlay`). Do not ship third-party Canva/Envato/Motion Array assets without a license; these seeds are in-house styling only.

Gallery filters use `config.tags` and `config.category` (`gospel` | `afrobeat` | `romantic` | `style` | `format`).

## Export formats

Default canvas/export preset: **`CANVAS_4_3`** (1440×1080 at 1080p height). Other formats letterbox/pad at render time.

Chosen at project creation or on the editor before render:

- `TIKTOK_9_16` / `REELS_9_16` — vertical  
- `YOUTUBE_16_9` — landscape  
- `SQUARE_1_1` — square  

## Frontend routes (core)

- **Create:** `/create` — choose Video+lyrics or Audio+templates, upload, auto AI  
- **Studio editor:** `/studio/:songId` — live preview, templates, customize, render  
- **Legacy wizard:** `/create/lyric-video` redirects to `/create`  
- **Project editor (alternate):** `/my/videos/:id`, `/artist/videos/:id`  

## Auto pipeline (studio songs)

Songs with `creatorStudioMode` set (`VIDEO_CLIP` | `AUDIO_ONLY`):

1. Video: extract audio → normalize → language detect → **auto-confirm language** → transcribe → **auto-create video project**  
2. Audio: normalize → language detect → auto-confirm → transcribe → auto-create project  

Poll: `GET /api/v1/studio/songs/:songId`  

## Workers

Video render jobs use the `video-render` queue (see `backend/src/queues/videoRender.ts` and `processVideoRender.ts`). Requires Redis + worker process (`npm run dev:worker`).
