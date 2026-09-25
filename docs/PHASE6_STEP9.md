# Phase 6 — Step 9: Language detection & confirmation

## Flow

```
Audio processing completes
  → ProcessingJob LANGUAGE_DETECTION (BullMQ song-pipeline)
  → LanguageDetectionProvider (demo fingerprint / future models)
  → LanguageDetectionRun (immutable AI history)
  → LanguageSegment (AI_DETECTED, optional multi-language)
  → Song.languageState = DETECTED | CONFIRMATION_REQUIRED
  → Artist confirms on /artist/songs/:id/language
  → Song.status = LANGUAGE_CONFIRMED (ready for transcription)
```

Transcription is **not** started automatically.

## Migration

`20250923220000_language_detection`

Seed languages (if empty):

```powershell
psql $DATABASE_URL -f backend/prisma/seed-languages.sql
```

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD` | `0.75` | Below → `CONFIRMATION_REQUIRED` |
| `AI_LANGUAGE_DETECT_MODE` | `demo` | Provider selection |
| `DEMO_LANGUAGE_DETECT_CODE` | — | Force detection (e.g. `lg`) for demos |
| `DEMO_LANGUAGE_MIXED` | `false` | Demo multi-segment output |

## Job types

- `LANGUAGE_DETECTION` (new)
- `LANGUAGE` (legacy alias, same worker)

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/songs/:id/language` | Detection, segments, history, job status |
| POST | `/api/v1/songs/:id/language/confirm` | `{ languages: ["lg"] }` or `{ segments: [...] }` |
| POST | `/api/v1/songs/:id/language/retry-detection` | Re-queue detection |

Codes use catalog values (`lg`, `en`, …) or names (`Luganda`, `English`).

## Mixed-language model

`LanguageSegment` rows:

- `source = AI_DETECTED` — from provider (never deleted on confirm)
- `source = ARTIST_CONFIRMED` — artist truth for transcription

`LanguageDetectionRun` keeps each AI pass for analytics/debug.

## Test with Luganda audio

1. Run API + worker (`npm run dev:all`).
2. Upload Luganda clip → wait for audio + language jobs.
3. Open `/artist/songs/:id/language` — note confidence wording.
4. Confirm or override (e.g. AI says Lusoga → pick Luganda).
5. Verify AI history still shows original detection.
6. Song status **Language confirmed**; `readyForTranscription: true` in API.

Force demo detection: `DEMO_LANGUAGE_DETECT_CODE=lg` in `backend/.env`.

## Next

Step 10 — transcription using `resolveAsrProviderForLanguage()` and confirmed segments.
