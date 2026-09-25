# Phase 3 — Step 5: Artist profile & onboarding

## Database migration

```powershell
cd backend
npx prisma migrate dev --name artist_onboarding
npx prisma generate
```

Migration `20250923190000_artist_onboarding`:

- `VerificationStatus`: `APPROVED` → **`VERIFIED`**
- `Artist.website` column
- **Unique** `Artist.ownerUserId` (one profile per user)

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/artists/:id` | Public (UUID) | Public artist profile |
| GET | `/api/v1/artists/search?q=` | Yes | Search by name |
| GET | `/api/v1/artists/me` | Yes | Own profile + verification |
| POST | `/api/v1/artists` | Yes | Create profile (409 if exists) |
| PATCH | `/api/v1/artists/me` | Yes | Update own profile only |
| GET | `/api/v1/artists/me/dashboard` | ARTIST/ADMIN + profile | Stats (zeros until songs) |
| POST | `/api/v1/artists/me/upload-image` | Artist | Local storage helper (optional) |

**Role change:** On `POST /api/v1/artists`, backend sets `User.role` to `ARTIST` (never `ADMIN`). Frontend cannot set role.

**Verification:** Creating a profile sets `isVerified: false` and creates `ArtistVerification` with `PENDING`.

## Frontend routes

| Route | Purpose |
|-------|---------|
| `/artist/create` | Onboarding form (authenticated USER) |
| `/artist/dashboard` | Artist overview + verification banner |
| `/artist/profile` | Own profile preview |
| `/artist/profile/edit` | PATCH profile |
| `/artist/songs` … | Empty placeholders (Step 5) |
| `/artists/:id` | Public artist page (UUID) |

## Test onboarding

1. Register/login as a **USER**.
2. Open `/artist/create`, submit artist details.
3. Confirm redirect to `/artist/dashboard`, banner **awaiting verification**.
4. Open `/artists/{id}` — no verified badge unless admin verified you.
5. Try `POST /api/v1/artists` again → **409**.
6. Log out; `GET /api/v1/artists` create → **401**.

## Test authorization

- **USER** without profile: `/artist/dashboard` → redirect `/artist/create`; API dashboard → **404**.
- **ARTIST** with profile: dashboard **200**; cannot PATCH another user’s profile (always `/me`).
- **ADMIN** routes unchanged (`/admin` only for `ADMIN` role).

```powershell
cd backend
npm test
```

Includes `artist.integration.test.ts` when `DATABASE_URL` is reachable.
