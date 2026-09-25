# Nyimba

**AI-powered Ugandan music, lyrics, and lyric-video platform** — artists upload songs and videos, confirm languages (Luganda, English, Runyankole, Lusoga, Acholi, Lugisu, Lugwere, Swahili), get AI transcriptions with timings, verify lyrics, build **Gospel** and other catalogs, and create lyric videos for listeners to search, playlist, and watch.

**Product vision:** **[docs/PRODUCT.md](docs/PRODUCT.md)** · **How to run:** **[docs/RUN.md](docs/RUN.md)**

### Monorepo (TypeScript only — no Python)

- **`frontend/`** — React + TypeScript + Vite (Nyimba UI, LRC Studio, lyric-video editor)
- **`backend/`** — Node.js + Express + Prisma + BullMQ (AI transcription, language detection, render jobs)

**Platform:** `start.bat` or `npm run dev` → **http://127.0.0.1:5173**  
**Create / LRC / lyric video:** **http://127.0.0.1:5173/create** or **/lrc-studio** → AI on the Node worker (`npm run dev:all`)

Setup: `install.bat` → set `DATABASE_URL` in `backend/.env` → `npm run db:migrate`

---

## What it looks like

### 1. Home screen — drop your audio, choose your mode

![Home screen](docs/1-Home.png)

Drop any audio file (MP3, FLAC, WAV, M4A, OGG) and choose how you want to generate your LRC:

- **Transcribe** — let Whisper AI detect text and timing automatically
- **Tap Sync** — tap along manually, line by line, in real time

Optionally paste your own lyrics into the text box — Whisper will align them to the audio instead of guessing the words, which gives you much more accurate results.

---

### 2. Vocal Isolation for Whisper — cleaner transcription

![Vocal Isolation enabled](docs/2-Home-Whisper.png)

Enable **Vocal Isolation** (UVR5) before transcription. This strips out all instrumentals and gives Whisper a clean vocals-only track — noticeably improves accuracy on music with heavy backgrounds. Choose from 4 models depending on speed vs quality preference.

---

### 3. Vocals Preview for Tap Sync

![Vocals Preview for Tap Sync](docs/3-Home-Tap.png)

When using Tap Sync, enable **Vocals Preview** — the UVR5 AI isolates the vocals first, so the waveform you tap along to shows only the vocal track instead of the full mix. Much easier to follow when the beat is loud.

---

### 4. Processing screen — Whisper + optional vocal isolation

![Whisper loading screen](docs/4-Whisper-Load.png)

While processing, a progress screen shows you exactly which stage is running — Vocal Isolation first, then Whisper transcription. Models are downloaded automatically on first use. You can cancel at any time.

---

### 5. Tap Sync — song waveform

![Tap Sync with song waveform](docs/5-Tap-Song.png)

The Tap Sync view shows every lyric line and a live scrolling waveform. The current line is highlighted in the center. Press **Space** to mark the start of the next line, **Backspace** to go back one step. The purple waveform here is the full song audio.

---

### 6. Tap Sync — isolated vocal waveform

![Tap Sync with vocal waveform](docs/6-Tap-Voice.png)

Switch on Vocals Preview and the waveform turns **green** — now you're seeing (and hearing) only the isolated vocals. Individual words and phrases are much easier to follow, making it far simpler to tap at exactly the right moment.

---

### 7. Timeline editor — review and fine-tune

![Timeline editor](docs/7-Timeline.png)

After Whisper or Tap Sync, every line appears in the **timeline editor**. You can:
- Drag blocks left/right to shift timing
- Drag edges to trim start/end of a segment
- Double-click any block to edit the text inline
- Add new lines at the playhead, delete unwanted ones
- Undo/Redo up to 80 steps

The full list of timestamps sits in the panel below. When you're happy, hit **Download LRC** or **Copy** on the right.

---

### 8. Timeline — vocal waveform + drag to adjust

![Timeline with vocal waveform and drag](docs/8-Timeline-Vocal.png)

Hit the **VOC** button next to the waveform track to switch to the isolated vocal waveform (green). Individual syllables become clearly visible, making precise timing adjustments easy. Drag any segment block to move it, or drag its edges to trim — exactly like a video editor.

The top bar gives you **New Song**, **Tap** (redo tap sync), **Retry** (re-run Whisper), and sort/undo controls.

---

## Quick Start

### 1. Install

Requires **Node.js 20+**.

```bat
install.bat
```

Copy env and point **`DATABASE_URL`** at your **Neon** Postgres ([docs/DATABASE.md](docs/DATABASE.md)):

```bat
copy backend\.env.example backend\.env
npm run db:generate
npm run db:migrate
```

Optional local Redis for BullMQ:

```bat
docker compose up -d
```

Whisper models download automatically on first transcription (~150 MB for `base`).

### 2. Run

```bat
start.bat
```

Nyimba: `http://127.0.0.1:5173` (API `:4000`). LRC & studio: `/create` or `/lrc-studio`. Use `npm run dev:all` for AI jobs.

---

## Manual Installation

```bash
npm install
npm run dev              # API :4000 + UI :5173
npm run dev:all          # + worker (LRC transcription, language, render)
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `Enter` | Add segment at playhead |
| `←` / `→` | Seek ±2s |
| `Shift+←` / `Shift+→` | Seek ±10s |
| `Ctrl+Scroll` | Zoom in / out |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Delete` | Delete selected segment |
| `↑` / `↓` | Navigate between segments |
| `Space` *(Tap Sync)* | Confirm current line, advance to next |
| `Backspace` *(Tap Sync)* | Go back one line |
| `Escape` *(Tap Sync)* | Cancel and close |

---

## Vocal Isolation Models (UVR5)

| Model | Speed | Best for |
|-------|-------|----------|
| MDX-Net HQ3 | Fast | General use — **recommended** |
| MDX-Net Voc_FT | Fast | Vocal-optimized tracks |
| MDX-Net KARA 2 | Fast | Karaoke tracks, cleanest output |
| Demucs htdemucs_ft | Slow | Best quality, complex mixes |

Vocal isolation uses FFmpeg center-cancel. Full UVR ONNX may be wired in later; model names in the UI are unchanged.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Fastify (API today; Express per platform roadmap)
- PostgreSQL (Neon)
- Prisma
- Redis
- BullMQ

### AI / Media

- Speech-to-Text
- Language Detection
- Audio Processing
- FFmpeg
- Vocal Separation
- Lyrics Alignment
- Video Rendering

### Storage

- Object Storage
  - Audio
  - Video
  - Images
  - Generated Files

---

## License

◿ This program is free ✓ software! ◺

◿ You can redistribute it and / or modify ◺

◁◅◃ it under the terms of the ▹▻▷

◹ GNU General Public License v3! ◸
