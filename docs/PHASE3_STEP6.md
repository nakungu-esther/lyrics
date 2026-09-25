# Phase 3 — Step 6: Artist song management foundation

Draft songs without audio upload, AI, or processing queues for the default create flow.

## Prisma

No schema migration required for Step 6. Existing `Song`, `SongArtist`, `Album`, and `SongStatus` enums are used.

```powershell
cd backend
npx prisma generate
```

## Song API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/songs/me` | ARTIST/ADMIN | List own songs |
| GET | `/api/v1/artists/me/songs` | ARTIST/ADMIN + profile | Same list (spec alias) |
| GET | `/api/v1/artists/me/albums` | ARTIST/ADMIN + profile | Album picker |
| POST | `/api/v1/songs` | ARTIST/ADMIN | Create **DRAFT** (JSON body) |
| GET | `/api/v1/songs/:id` | Optional | Public if **PUBLISHED**; owner sees drafts |
| PATCH | `/api/v1/songs/:id` | ARTIST/ADMIN | Update metadata (not status) |
| DELETE | `/api/v1/songs/:id` | ARTIST/ADMIN | Hard delete (owner only) |

Legacy media upload (not Step 6): `POST /api/v1/songs/upload/with-audio`, `POST /api/v1/songs/music-video`.

Create body example:

```json
{
  "title": "Olugendo",
  "description": "Optional",
  "genre": "Afrobeat",
  "releaseDate": "2026-01-15",
  "albumId": null
}
```

On create, backend adds `SongArtist` (`primary`) and sets `status: DRAFT`.

## Frontend routes

| Route | Purpose |
|-------|---------|
| `/artist/songs` | List + delete confirm |
| `/artist/songs/new` | Create draft + media placeholders |
| `/artist/songs/:id` | Detail + future pipeline placeholders |
| `/artist/songs/:id/edit` | PATCH metadata |

Hooks: `useArtistSongs`, `useSong`, `useCreateSong`, `useUpdateSong`, `useDeleteSong`.

## Test flow

1. Log in as **ARTIST** with a profile.
2. `/artist/songs` → **+ Add Song** → fill title → **Create draft song**.
3. Detail page shows **Draft** and “Not uploaded yet” for audio.
4. Edit title → save → list updates.
5. Delete with confirmation dialog.
6. Log out → `GET /api/v1/songs/{id}` → **404** for draft.

```powershell
cd backend
npm test
npm run dev:api
```

Artist dashboard **Total Songs** uses live counts from `getArtistDashboardStats`.

## Assumptions

- Primary artist link uses both `Song.artistId` and `SongArtist` row (for future multi-artist credits).
- `musicVideoUrl` in API maps to `backgroundVideoUrl` in the database.
- Song **status** is backend-controlled only (no publish UI in Step 6).
