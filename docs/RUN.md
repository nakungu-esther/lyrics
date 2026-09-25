# How to run LyricsHub

LyricsHub is **one product**: you open **one URL** in the browser. Under the hood it is **two Node apps** in this repo (`frontend` + `backend`) — that is normal for React + API, not “many separate products.”

## Repo layout

| Folder | Purpose |
|--------|---------|
| **`frontend/`** | LyricsHub UI |
| **`backend/`** | LyricsHub API + workers |
| **`docs/`** | Documentation |

## Requirements

- Node.js **20+**
- **`backend/.env`** with **`DATABASE_URL`** (Neon Postgres)
- **Redis** (for background jobs): Docker Desktop + `docker-compose up -d` (or `npm run redis:up`)

## First time

```bat
install.bat
```

Edit **`backend\.env`** — set `DATABASE_URL`, then:

```bat
npm run db:migrate
```

## Run LyricsHub (one command)

```bat
start.bat
```

Or:

```bat
npm run dev
```

Open **http://127.0.0.1:5173** — this is the app.  
The UI sends `/api` requests to the backend on port **4000** automatically (Vite proxy).

### Background jobs (upload, FFmpeg, video render)

```bat
docker-compose up -d
npm run dev:all
```

(`dev:all` = API + UI + worker in one terminal. If Redis is not running, the worker exits with instructions; API + UI keep running.)

Without Redis, remove or comment out **`REDIS_URL`** in `backend/.env` — the worker is not needed and some jobs run inline in the API (OK for light testing).

### Troubleshooting

| Symptom | Fix |
|--------|-----|
| `[redis] connection error: ECONNREFUSED 127.0.0.1:6379` | Start **Docker Desktop**, then `docker-compose up -d`, or unset `REDIS_URL` for inline jobs. **API no longer crashes** — jobs run inline in the API process when Redis is down |
| `prisma:error ... Closed` (Neon) | Idle disconnect — retry the request; ensure pooled `DATABASE_URL`; resume Neon if suspended |
| Vite proxy error during `[tsx] Restarting` | Normal while the API reloads on file save — wait a few seconds and retry |
| `http proxy error` / `ECONNREFUSED 127.0.0.1:4000` | API not running — use `npm run dev` or `npm run dev:backend`; check terminal labeled **api** |
| UI on **5174** instead of 5173 | Normal if 5173 is busy; add that origin to `CORS_ORIGIN` (see `backend/.env.example`) |
| `Port 4000 is already in use` | Stop the old API or free the port (message in the api terminal shows a PowerShell one-liner) |
| `P1001` / Can't reach database server (Neon) | Open [Neon console](https://console.neon.tech) — **resume** project if auto-suspended; paste a new **pooled** connection string into `backend/.env` as `DATABASE_URL`; check internet/VPN/firewall; hit http://127.0.0.1:4000/api/v1/health/db |
| Vite `ECONNRESET` on `/api/v1/auth/refresh` | Usually the API **crashed** or DB was down during refresh — restart `npm run dev`; fix `DATABASE_URL` first |
| Login shows **“Something went wrong on our side”** (admin or any user) | Almost always **database down**. API `/health` is OK but `/health/db` fails — fix `DATABASE_URL` in `backend/.env`, resume Neon, run `npm run db:migrate`, restart API. Then seed admin: `cd backend && npm run db:seed-admin` (default `admin@lyricshub.local` / `ChangeMeAdmin123!` unless you set `SEED_ADMIN_*` in `.env`). |
| `Unknown argument creatorStudioMode` | Schema behind code — run `npm run db:migrate` then `npm run db:generate`, restart API |

## Health check

- UI: http://127.0.0.1:5173  
- API: http://127.0.0.1:4000/api/v1/health  

## LyricsHub LRC & Studio (React + TypeScript)

All LRC, transcription, and lyric-video creation runs on **Node.js** — there is **no Python** app in this repo.

```bat
npm run dev:all
```

- **http://127.0.0.1:5173/create** — upload video or audio, AI pipeline, studio editor  
- **http://127.0.0.1:5173/lrc-studio** — same stack, LRC-focused entry  
- **http://127.0.0.1:5173/studio/:songId** — live preview, templates, render  

Set `AI_TRANSCRIBE_MODE=demo` or `whisper` in `backend/.env` (see `docs/PHASE7-13.md`).
