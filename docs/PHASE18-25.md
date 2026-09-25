# Phases 18–25 — Render, exports, platform features

## Phase 18 — FFmpeg rendering

`RenderJob.status`: **QUEUED → PROCESSING → RENDERING → COMPLETED | FAILED**

Flow: API creates job → BullMQ `video-render` → worker → FFmpeg → MP4 under `storage/video/renders/` → `outputVideoUrl` (object-storage style URL).

## Phase 19 — Social export formats

| `exportFormat` | Use |
|----------------|-----|
| `YOUTUBE_16_9` | YouTube |
| `TIKTOK_9_16` | TikTok |
| `REELS_9_16` | Instagram Reels |
| `SQUARE_1_1` | Square |

`resolutionHeight`: **1080**, **1440**, **2160** (4K).

Pass when rendering: `POST /api/v1/video-projects/:id/render` with `{ exportFormat, resolutionHeight }`.

## Phase 20 — Artist verification

- `GET /api/v1/artists/search?q=`
- `POST /api/v1/artists/:id/verify-request` `{ evidence? }`
- Admin: `POST /api/v1/admin/verifications/:id/approve|reject`
- `Artist.isVerified` → public badge

UI: `/artist/verify`, `/admin`

## Phase 21 — Playlists

- `GET/POST /api/v1/playlists/me`
- `POST /api/v1/playlists/:id/songs` · `DELETE .../songs/:songId`
- UI: `/playlists`

## Phase 22 — Analytics

`AnalyticsEvent` types: SONG_VIEW, AUDIO_PLAY, LYRICS_VIEW, VIDEO_VIEW, DOWNLOAD.

Artist: `GET /api/v1/analytics/artist/me`  
Public: views on song page load; `POST /api/v1/public/songs/:id/play` on play.

UI: `/artist/analytics`

## Phase 23 — Admin

`GET /api/v1/admin/overview`, `/users`, `/artists`, `/songs`, `/reports`, `/verifications`, `/templates`, `/languages`  
Actions: suspend user, delete song, review reports, approve verification.

UI: `/admin` (ADMIN role only)

## Phase 24 — Notifications

Created on: song processing done, lyrics verified, video render complete, verification decision.

- `GET /api/v1/notifications/me`
- `POST /api/v1/notifications/read-all`

Header **Alerts** bell in app layout.

## Phase 25 — Monetization (stub)

- `GET /api/v1/billing/plans` — Free / Pro / Artist Pro feature lists
- `GET /api/v1/billing/me` — current `subscriptionPlan` on user

Payments integration deferred.

## Migration

`20250923170000_platform_phase18_25` — run `npm run db:migrate`.

## Development order

See user blueprint in project docs; steps 1–19 are implemented in codebase; 20–24 have first UI/API slices; 25 is stub-only.
