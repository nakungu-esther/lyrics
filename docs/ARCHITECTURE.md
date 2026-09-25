# Full-Stack AI Lyrics & Lyrics-Video Platform — Architecture (v1)

**Project name:** TBD  
**Scope:** This document is the implementation blueprint. Do **not** build all 27 modules at once; follow [Development phases](#6-development-phases).

**Stack (target):**

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS |
| API | Node.js, TypeScript, **Express** |
| Database | **PostgreSQL**, **Prisma ORM** (metadata only — no large binaries) |
| Jobs | **Redis**, **BullMQ** (separate worker processes) |
| Media | FFmpeg workers, **object storage** (S3-compatible) |
| AI | Pluggable providers behind TypeScript interfaces |

**Note:** Phase 1 monorepo: `frontend/` (React) + `backend/` (Express + Prisma/Neon), run independently. Legacy Fastify editor: `apps/api` + `static/`.

---

## 1. Architecture

### 1.1 System context

```text
                    ┌─────────────────────────────────────┐
                    │           React SPA (Vite)           │
                    │  TanStack Query · React Router       │
                    └─────────────────┬───────────────────┘
                                      │ HTTPS
                                      ▼
                    ┌─────────────────────────────────────┐
                    │     Express API  /api/v1/*           │
                    │  Auth · Validation · RBAC · Enqueue   │
                    └─┬─────────┬─────────┬─────────┬───────┘
                      │         │         │         │
          ┌───────────▼──┐  ┌───▼───┐ ┌───▼───┐ ┌───▼────────────┐
          │  PostgreSQL  │  │ Redis │ │  S3   │ │ Worker fleet   │
          │   (Prisma)   │  │BullMQ │ │ store │ │ (BullMQ cons.) │
          └──────────────┘  └───┬───┘ └───▲───┘ └───────┬────────┘
                                │         │             │
                                └─────────┴─────────────┘
                                   job payloads + asset keys
```

### 1.2 Layering (backend)

```text
apps/api/src/
  routes/          → HTTP: parse, auth, validate, call services, respond
  middleware/      → JWT/session, RBAC, rate limit, error handler
  services/        → Business rules (song publish, lyrics approve, etc.)
  repositories/    → Prisma access (optional thin layer)
  jobs/            → Enqueue only (no heavy work)
  lib/             → Shared utilities

apps/worker/src/
  processors/      → BullMQ job handlers
  ai/              → Provider implementations
  media/           → FFmpeg, probes, thumbnails
  storage/         → Object storage client
```

**Rule:** No transcription, alignment, or video render inside Express request handlers. HTTP creates rows + enqueues; workers mutate state and assets.

### 1.3 AI provider abstraction

Do **not** hard-code Whisper, Google, or a single STT vendor. Define interfaces in `packages/ai-contracts` (or `apps/worker/src/ai/contracts`):

```typescript
// packages/ai-contracts/src/index.ts (conceptual)

export type LanguageCode = string; // BCP-47 or internal catalog code (lg, nyn, …)

export interface DetectedLanguage {
  code: LanguageCode;
  confidence: number; // 0–1
  startTime?: number; // for segment-level detection
  endTime?: number;
}

export interface LanguageDetectionProvider {
  readonly id: string;
  detectFromAudio(input: { assetKey: string; mimeType: string }): Promise<DetectedLanguage[]>;
}

export interface TranscriptionWord {
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface TranscriptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  words: TranscriptionWord[];
  languageCode?: LanguageCode;
}

export interface SpeechToTextProvider {
  readonly id: string;
  /** Which languages this provider supports well (catalog codes). */
  supportedLanguages: LanguageCode[];
  transcribe(input: {
    assetKey: string;
    languageCode: LanguageCode;
    options?: { vocalSeparatedAssetKey?: string };
  }): Promise<{ segments: TranscriptionSegment[]; modelVersion: string }>;
}

export interface LyricsAlignmentProvider {
  readonly id: string;
  align(input: {
    assetKey: string;
    lines: { text: string; startTime?: number; endTime?: number }[];
    languageCode: LanguageCode;
  }): Promise<TranscriptionWord[][]>;
}

export interface VideoRenderer {
  readonly id: string;
  render(input: {
    projectId: string;
    templateConfig: unknown;
    customization: unknown;
    outputPreset: VideoExportPreset;
  }): Promise<{ outputAssetKey: string }>;
}
```

**Routing per language:** Table `language_transcription_configs` (or JSON on `Language`) maps `language.code` → `providerId`, `modelId`, `fallbackProviderId`. Worker resolves provider at runtime.

### 1.4 Media storage abstraction

```typescript
export interface ObjectStorage {
  getSignedUploadUrl(params: { key: string; contentType: string; maxBytes: number }): Promise<{ url: string; headers?: Record<string, string> }>;
  getSignedDownloadUrl(key: string, expiresSec: number): Promise<string>;
  headObject(key: string): Promise<{ size: number; contentType: string } | null>;
  deleteObject(key: string): Promise<void>;
}
```

PostgreSQL stores `MediaAsset { bucket, key, mimeType, byteSize, kind }` only.

### 1.5 Song processing pipeline (state machine)

```text
UPLOAD → PROCESSING → LANGUAGE_DETECTION → TRANSCRIPTION → ALIGNMENT → READY_FOR_REVIEW → PUBLISHED
                                                                              ↘ ARCHIVED
```

Each transition is driven by **jobs** updating `Song.status` and linked `ProcessingJob` / `RenderJob` rows.

### 1.6 Security (cross-cutting)

- JWT access + refresh (or secure HTTP-only session cookies)
- Password hashing (argon2 or bcrypt)
- RBAC: `LISTENER` | `ARTIST` | `ADMIN` (user may hold artist membership separately)
- Zod (or similar) on all inputs
- Magic bytes + MIME validation; size caps per kind
- Presigned uploads to object storage
- Authorization: resource owner, artist team, admin
- Rate limiting (Redis)
- Media access: signed URLs; never public bucket listing by default

### 1.7 Real-time job updates

- **MVP:** `GET /api/v1/jobs/:id` polling (TanStack Query `refetchInterval`)
- **Later:** SSE or WebSocket channel `job:{id}`

---

## 2. Folder structure

Monorepo (npm/pnpm workspaces):

```text
/
├── apps/
│   ├── web/                          # React SPA
│   │   ├── src/
│   │   │   ├── app/                  # Router, providers, layouts
│   │   │   ├── pages/                # Route entry (thin)
│   │   │   ├── features/             # Domain UI + hooks
│   │   │   │   ├── auth/
│   │   │   │   ├── search/
│   │   │   │   ├── songs/
│   │   │   │   ├── artists/
│   │   │   │   ├── lyrics-editor/
│   │   │   │   ├── sync-timeline/
│   │   │   │   ├── video-studio/
│   │   │   │   ├── playlists/
│   │   │   │   ├── dashboard/
│   │   │   │   └── admin/
│   │   │   ├── components/           # Shared UI primitives
│   │   │   │   ├── ui/               # Button, Modal, Input, …
│   │   │   │   ├── media/            # AudioPlayer, VideoPlayer, Waveform
│   │   │   │   ├── lyrics/           # LyricsEditor, LyricsTimeline
│   │   │   │   └── video/            # TemplateCard, ProcessingStatus
│   │   │   ├── api/                  # Typed fetch client + query keys
│   │   │   ├── types/                # DTOs mirroring API
│   │   │   └── lib/
│   │   ├── index.html
│   │   └── vite.config.ts
│   │
│   ├── api/                          # Express REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config/env.ts
│   │   │   ├── routes/v1/            # One file per resource group
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── jobs/                 # enqueue helpers
│   │   │   ├── lib/prisma.ts
│   │   │   └── lib/storage.ts
│   │   └── package.json
│   │
│   └── worker/                       # BullMQ consumers (scale independently)
│       ├── src/
│       │   ├── index.ts              # Register all workers
│       │   ├── queues.ts
│       │   ├── processors/
│       │   │   ├── audio.process.ts
│       │   │   ├── language.detect.ts
│       │   │   ├── transcription.run.ts
│       │   │   ├── alignment.run.ts
│       │   │   ├── thumbnail.generate.ts
│       │   │   ├── video.render.ts
│       │   │   └── video.encode.ts
│       │   ├── ai/
│       │   │   ├── registry.ts       # Resolve provider by language
│       │   │   └── providers/        # whisper-local, cloud-x, stub, …
│       │   └── media/ffmpeg.ts
│       └── package.json
│
├── packages/
│   ├── ai-contracts/                 # Interfaces + shared job payload types
│   ├── shared/                       # Enums, constants (languages, roles)
│   └── eslint-config/                # Optional
│
├── docs/
│   ├── ARCHITECTURE.md               # This file
│   └── PLATFORM_BLUEPRINT.md         # Module/product map (companion)
│
├── docker-compose.yml                # postgres, redis, minio (local S3)
├── .env.example
└── package.json
```

**Frontend pages (routes):**

| Area | Routes |
|------|--------|
| Public | `/`, `/search`, `/songs/:id`, `/artists/:id`, `/albums/:id`, `/lyrics/:id` |
| User | `/dashboard`, `/library`, `/playlists`, `/create-video`, `/video-projects`, `/settings` |
| Artist | `/artist/dashboard`, `/artist/songs`, `/artist/songs/new`, `/artist/songs/:id`, `/artist/lyrics`, `/artist/videos`, `/artist/analytics`, `/artist/profile` |
| Admin | `/admin`, `/admin/users`, `/admin/artists`, `/admin/songs`, `/admin/lyrics`, `/admin/reports`, `/admin/templates`, `/admin/languages` |

---

## 3. Database schema (Prisma)

PostgreSQL holds **metadata, lyrics text, timings, jobs, config**. Binaries live in object storage via `MediaAsset`.

See **`docs/schema.prisma`** for the full initial Prisma model (copy into `apps/api/prisma/schema.prisma` when starting Phase 1).

### 3.1 Enums

```prisma
enum UserRole { LISTENER ARTIST ADMIN }
enum SongStatus { DRAFT PROCESSING READY_FOR_REVIEW PUBLISHED ARCHIVED }
enum LyricsStatus { AI_GENERATED ARTIST_EDITED ARTIST_VERIFIED ADMIN_REVIEWED }
enum LyricSectionType {
  VERSE CHORUS BRIDGE INTRO OUTRO PRE_CHORUS HOOK OTHER
}
enum JobStatus { QUEUED ACTIVE COMPLETED FAILED DELAYED }
enum JobType {
  AUDIO_PROCESS LANGUAGE_DETECT TRANSCRIPTION ALIGNMENT
  THUMBNAIL VIDEO_RENDER VIDEO_ENCODE
}
enum MediaKind { AUDIO VIDEO IMAGE LYRICS_FILE RENDER_OUTPUT THUMBNAIL TEMP }
enum VerificationStatus { PENDING APPROVED REJECTED }
enum ReportStatus { OPEN REVIEWED DISMISSED ACTION_TAKEN }
enum VideoAspect { RATIO_16_9 RATIO_9_16 RATIO_1_1 }
```

### 3.2 Core models (summary)

| Model | Purpose |
|-------|---------|
| `User` | Auth, role, profile |
| `Artist` | Public artist identity; linked to `User` |
| `ArtistVerification` | Claim / verify artist (admin workflow) |
| `Album` | Optional grouping |
| `Song` | Catalog item, status pipeline, FK to audio/video assets |
| `SongArtist` | Credits M:N |
| `Language` | Supported catalog + STT routing config |
| `Lyrics` | Versioned lyrics document per song |
| `LyricSection` | Verse/chorus/… + optional `languageCode`, section order |
| `LyricLine` | Line text + line-level times |
| `LyricWord` | Karaoke granularity: `startTime`, `endTime` |
| `MediaAsset` | Storage pointer (bucket, key, mime, size) |
| `VideoTemplate` | Reusable template JSON schema |
| `VideoProject` | Song + lyrics + template + customizations |
| `RenderJob` | Async render/transcode; progress, output asset |
| `ProcessingJob` | Generic pipeline job (detect, transcribe, align) |
| `Playlist` / `PlaylistSong` | User collections |
| `SongView` / `SongPlay` | Analytics events |
| `Notification` | In-app / email hooks |
| `Report` | Incorrect lyrics / moderation |

### 3.3 Language at segment level (mixed songs)

`LyricSection.languageCode` (and optionally `LyricLine.languageCode`) stores per-section language.  
Detection job may also write `SongLanguageSegment { songId, startTime, endTime, languageCode, confidence }` before lyrics exist—optional table for AI hints; artist confirms in UI.

### 3.4 Indexing (production)

- `Song(status, publishedAt)`, `Song(artistId)`, full-text on title  
- `LyricWord(segmentId, sortOrder)`  
- `ProcessingJob(songId, status)`, `RenderJob(videoProjectId, status)`  
- Search: start with PostgreSQL `tsvector`; add Meilisearch/OpenSearch in Phase 5 if needed  

---

## 4. Main entities and relationships

```text
User 1───* Artist (owner)
User 1───* Playlist
User 1───* Notification

Artist 1───* Song
Artist 1───* Album
Artist 1───* ArtistVerification

Album 1───* Song

Song *───* Artist (SongArtist)
Song 1───* Lyrics (versions; one "active" flagged)
Song 1───* MediaAsset (audio, optional source video)
Song 1───* ProcessingJob

Lyrics 1───* LyricSection (ordered)
LyricSection 1───* LyricLine (ordered)
LyricLine 1───* LyricWord (ordered, start/end times)

VideoTemplate 1───* VideoProject
Song + Lyrics + User ──► VideoProject
VideoProject 1───* RenderJob

Language 1───* LyricSection (optional FK)
Language ──► transcription config (provider/model per code)
```

**Lyrics hierarchy (required for karaoke):**

```text
Song
 └── Lyrics (status: AI_GENERATED → … → ARTIST_VERIFIED)
      └── LyricSection (type, languageCode?, sortOrder)
            └── LyricLine (text, startTime?, endTime?, sortOrder)
                  └── LyricWord (text, startTime, endTime, sortOrder)
```

**Verification display:** When `Lyrics.status === ARTIST_VERIFIED`, public UI shows *“Official lyrics — verified by artist”*.

---

## 5. API structure

Base path: **`/api/v1`**. JSON unless noted. Errors: `{ error: { code, message, details? } }`.

### 5.1 Auth & users

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Sign up |
| POST | `/auth/login` | Login → tokens |
| POST | `/auth/logout` | Invalidate refresh |
| POST | `/auth/forgot-password` | |
| POST | `/auth/reset-password` | |
| POST | `/auth/verify-email` | |
| GET | `/users/me` | Profile |
| PATCH | `/users/me` | Settings |

### 5.2 Artists

| Method | Path | Description |
|--------|------|-------------|
| POST | `/artists` | Create profile |
| GET | `/artists/:idOrSlug` | Public profile |
| PATCH | `/artists/:id` | Update (owner) |
| GET | `/artists/:id/dashboard` | Stats summary |
| POST | `/artists/:id/verification` | Request verification |

### 5.3 Songs & albums

| Method | Path | Description |
|--------|------|-------------|
| POST | `/songs` | Create draft + metadata |
| GET | `/songs/:id` | Detail (RBAC) |
| PATCH | `/songs/:id` | Update metadata |
| POST | `/songs/:id/publish` | Publish when READY_FOR_REVIEW |
| POST | `/songs/:id/archive` | |
| GET | `/artists/:id/songs` | List |
| CRUD | `/albums`, `/albums/:id/songs` | Album management |

### 5.4 Media upload

| Method | Path | Description |
|--------|------|-------------|
| POST | `/media/upload-url` | Signed PUT URL + create `MediaAsset` pending |
| POST | `/media/:id/complete` | Confirm upload, validate, attach to song |
| GET | `/media/:id/url` | Signed GET (authorized) |

### 5.5 Languages & detection

| Method | Path | Description |
|--------|------|-------------|
| GET | `/languages` | Catalog |
| POST | `/songs/:id/detect-language` | Enqueue detection job |
| GET | `/songs/:id/language-segments` | Detected segments + confidence |
| PUT | `/songs/:id/language-segments` | Artist confirms/overrides |

### 5.6 Lyrics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/songs/:id/lyrics` | Active lyrics + tree |
| POST | `/songs/:id/lyrics/transcribe` | Enqueue STT |
| PATCH | `/lyrics/:id` | Editor saves (sections/lines/words) |
| POST | `/lyrics/:id/approve` | Artist verification flow |
| GET | `/lyrics/:id` | Public read if song published |

### 5.7 Jobs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs/:id` | status, progress, error, result |
| GET | `/songs/:id/jobs` | Pipeline history |

### 5.8 Video

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | List templates |
| POST | `/video-projects` | Create project |
| PATCH | `/video-projects/:id` | Customization |
| POST | `/video-projects/:id/preview` | Optional low-res preview job |
| POST | `/video-projects/:id/render` | `{ jobId, status: "QUEUED" }` |
| GET | `/videos/:id` | Render output metadata + URL |

### 5.9 Discovery & social

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search` | q, filters (language, genre, year) |
| CRUD | `/playlists` | |
| POST | `/reports` | Report incorrect lyrics |
| POST | `/artists/:id/follow` | |

### 5.10 Admin

Prefix `/admin/*` — requires `ADMIN` role: users, artists, verifications, songs, lyrics moderation, reports, templates CRUD, languages CRUD, settings.

### 5.11 Module → API mapping (27 modules)

| # | Module | Primary routes |
|---|--------|----------------|
| 1–2 | Auth, users | `/auth`, `/users` |
| 3–4 | Artist, verification | `/artists`, `/admin/artists` |
| 5–8 | Song, album, audio/video upload | `/songs`, `/albums`, `/media` |
| 9 | Language detection | `/languages`, `/songs/:id/detect-language` |
| 10 | AI transcription | `/songs/:id/lyrics/transcribe` |
| 11–13 | Editor, sync, word times | `/lyrics/:id` (PATCH tree) |
| 14 | Verification | `/lyrics/:id/approve` |
| 15–16 | Library, search | public GET + `/search` |
| 17–21 | Video gen, templates, customize, render, export | `/video-projects`, `/templates`, `/videos` |
| 22 | Playlists | `/playlists` |
| 23 | Analytics | `/artists/:id/dashboard`, event POST or ingest |
| 24 | Notifications | `/notifications` |
| 25–26 | Admin, reports | `/admin`, `/reports` |
| 27 | Background jobs | `/jobs`, workers |

---

## 6. Development phases

Aligns with your rules: **incremental**, architecture first.

### Phase 0 — Bootstrap (no product features)

- Monorepo scaffold: `apps/web`, `apps/api`, `apps/worker`, `packages/*`
- Docker Compose: PostgreSQL, Redis, MinIO
- Prisma schema + first migration
- Env strategy (`.env.example`): `DATABASE_URL`, `REDIS_URL`, `S3_*`, `JWT_*`
- Express app shell + health check
- Object storage + `MediaAsset` CRUD
- BullMQ queue registration (no-op worker)
- AI interface packages (empty providers + stub)
- React shell + layout + auth placeholder routes

**Exit:** `GET /api/v1/health` OK; DB migrated; worker connects to Redis.

### Phase 1 — Foundation

- Modules: **1–2** Auth, **3** Artist profiles, **5–8** Song/album + upload, **17** media pipeline stub, **27** jobs
- JWT auth, roles, password hash
- Signed upload flow; song `DRAFT` → `PROCESSING` → back to `DRAFT` after audio probe
- Artist dashboard (counts only)
- Frontend: register/login, artist profile, song create + upload

**Exit:** Artist uploads audio; song row + asset in DB; duration stored.

### Phase 2 — AI lyrics core

- Modules: **9–14**, **27**
- `LanguageDetectionProvider` + per-language STT routing
- Workers: detect → transcribe → align → `READY_FOR_REVIEW`
- Mixed-language sections persisted
- **Lyrics editor** + **Lyrics timeline** + waveform (port patterns from the legacy LRC prototype)
- Status: `AI_GENERATED` → `ARTIST_EDITED` → `ARTIST_VERIFIED`

**Exit:** End-to-end upload → lyrics with word timings → artist saves + verifies.

### Phase 3 — Video

- Modules: **17–21**
- Template registry (JSON), video project wizard, customization panel
- FFmpeg render + encode workers; aspect presets (16:9, 9:16, 1:1)
- ProcessingStatus UI; poll jobs

**Exit:** One template renders to MP4 in object storage.

### Phase 4 — Public platform

- Modules: **15–16**, **22**, parts of **23**
- Publish song; public song/artist/album/lyrics pages
- Search (PostgreSQL first)
- Playlists, follow, share links
- Verified badge on lyrics

**Exit:** Listener discovers and plays published song with lyrics.

### Phase 5 — Trust & scale

- Modules: **4** verification, **24–26**, full **23**, **25**
- Admin dashboard, reports, moderation
- Notifications
- Analytics rollups; optional CDN; premium templates; subscriptions (product decision)
- Horizontal worker scaling; provider swaps via config only

---

## Environment variables (strategy)

| Variable | Used by |
|----------|---------|
| `DATABASE_URL` | API, worker |
| `REDIS_URL` | API, worker |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | API, worker |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | API |
| `API_PUBLIC_URL`, `WEB_ORIGIN` | CORS, email links |
| `AI_STT_DEFAULT_PROVIDER` | worker |
| `FFMPEG_PATH` | worker |

Secrets never committed; per-environment `.env`.

---

## Next step (waiting for your go-ahead)

When you say to proceed, recommended order:

1. **Phase 0:** Scaffold Express + Prisma + worker + MinIO; apply `docs/schema.prisma`.
2. **Phase 1:** Auth + artist + song upload APIs + minimal React flows.

No further implementation until you choose the starting phase.
