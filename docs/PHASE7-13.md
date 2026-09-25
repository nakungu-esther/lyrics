# Phases 7–13 — Language, AI lyrics, editor, public catalog, search

## Pipeline

```text
Upload → FFmpeg (AUDIO job) → Language detect (LANGUAGE job)
  → Artist confirms language → Transcribe (TRANSCRIBE job, AI_GENERATED)
  → Lyrics editor (line + word sync) → Approve (ARTIST_VERIFIED, song PUBLISHED)
```

## Supported languages

Seeded in `backend/prisma/seed-languages.sql`: Luganda, English, Runyankole, Lusoga, Acholi, Lugisu, Lugwere, Swahili.

## Frontend routes

| Route | Purpose |
|-------|---------|
| `/artist/songs/:id/language` | Detection UI — Confirm / Change language |
| `/artist/songs/:id/lyrics` | Player, editor, line/word sync, Save / Approve |
| `/songs/:id` | Public song page |
| `/artists/:slug` | Public artist page |
| `/search` | Songs, artists, albums, lyrics + filters |

## API

- `GET /api/v1/languages`
- `POST /api/v1/songs/:id/language/confirm` — starts transcription job
- `PATCH /api/v1/songs/:id/language`
- `GET /api/v1/lyrics/song/:songId`
- `PATCH /api/v1/lyrics/:id/draft` · `PATCH .../approve`
- `GET /api/v1/public/songs/:id` · `GET /api/v1/public/artists/:slug`
- `GET /api/v1/search?q=&language=&genre=&year=&artist=`

## AI modes

Default `AI_TRANSCRIBE_MODE=demo` returns sample Luganda lyrics with timings (no GPU). Set `AI_TRANSCRIBE_MODE=whisper` when `@huggingface/transformers` is installed on the worker.

## Migration

`20250923150000_language_lyrics` — song detection fields + `ProcessingJob.jobType`.
