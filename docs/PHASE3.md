# Phase 3 — Authentication & dashboard

## Roles

| Role | Meaning |
|------|---------|
| `USER` | Default listener account |
| `ARTIST` | Can manage songs (future steps) |
| `ADMIN` | Platform administration |

Hierarchy helpers: `backend/src/lib/permissions.ts`.

## API (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account (role `USER`) |
| POST | `/login` | — | Returns `accessToken` + sets httpOnly refresh cookie |
| POST | `/refresh` | Cookie | New access token |
| POST | `/logout` | Bearer | Revokes session |
| GET | `/me` | Bearer | Current user |
| GET | `/dashboard` | Bearer | Dashboard stats stub |

Also: `GET /api/v1/users/me` (same as `/auth/me`).

## Security

- Passwords: **bcrypt** (12 rounds)
- Access token: JWT (HS256), short TTL
- Refresh token: random, stored hashed in `Session` table, httpOnly cookie

Apply migrations including `20250923130000_auth_sessions` before testing auth.

## Frontend

- `/register`, `/login`
- `/dashboard` — protected; shows **Welcome {name}** and cards: My Songs, Playlists, Videos, Recently Played

Run backend + frontend, register with display name **Esther** to see “Welcome Esther”.
