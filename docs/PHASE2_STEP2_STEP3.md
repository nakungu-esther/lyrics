# Phase 2 — Step 2 (database) & Step 3 (auth)

LyricsHub already implements the full Step 2 entity model in `backend/prisma/schema.prisma` (User, Artist, Song, lyrics hierarchy, video, playlists, notifications, reports, enums, indexes). Binary media is **not** stored in Postgres—only URLs/keys.

This doc is the **handoff checklist** for Steps 2–3: what exists, how to run migrations, and how to verify auth.

## Step 2 — Prisma & PostgreSQL

### Layout

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/env.ts
│   ├── database/index.ts    # re-exports prisma client
│   ├── lib/prisma.ts
│   └── routes/health.ts     # GET /api/v1/health/db
└── .env.example
```

### Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon or local) |

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lyrics_platform"
```

Do **not** commit `backend/.env`.

### Commands

From repo root (after `npm install`):

```powershell
cd backend
npx prisma format
npx prisma generate
npx prisma migrate dev
# or from root:
npm run db:migrate
```

### Verify database

1. Set `DATABASE_URL` in `backend/.env`.
2. Start API: `npm run dev:api` or `npm run dev` from root.
3. `GET http://127.0.0.1:4000/api/v1/health/db` → `{ "status": "ok", "database": "connected" }`.

### Curriculum vs LyricsHub (Step 2 notes)

| Spec | LyricsHub |
|------|--------|
| `LyricWord.languageId` | FK via `languageCode` → `Language.code` |
| Artist verification `VERIFIED` | Enum value `APPROVED` |
| Languages seed | Migrations + `seed-languages.sql` |

---

## Step 3 — Authentication & roles

### Features

- Register / login / logout / refresh (HTTP-only cookie) / `GET /api/v1/auth/me`
- bcrypt password hashing; `passwordHash` never returned
- JWT access token (`Authorization: Bearer …`) with `sub` + `role`
- Roles: `USER`, `ARTIST`, `ADMIN` (register defaults to `USER`; no public `ADMIN` signup)
- Middleware: `authenticate` / `requireAuth`, `requireRole(...)`
- Rate limit on register/login (30 req / 15 min per IP)
- Helmet + CORS via `CORS_ORIGIN`

### User model (auth-relevant)

- `email` (unique), `passwordHash`, `firstName`, `lastName`, `role`, `avatarUrl`, `isActive`, `createdAt`, `updatedAt`
- Legacy `displayName` kept (set from first + last on register)
- `suspendedAt` disables login in addition to `isActive: false`

### Environment

| Variable | Purpose |
|----------|---------|
| `JWT_ACCESS_SECRET` | Access token signing (alias: `JWT_SECRET`) |
| `JWT_REFRESH_SECRET` | Refresh session hashing |
| `JWT_ACCESS_TTL` | Access TTL (alias: `JWT_EXPIRES_IN`, e.g. `15m`) |
| `JWT_REFRESH_TTL_DAYS` | Refresh cookie lifetime |
| `COOKIE_SECURE` | `true` in production HTTPS |
| `CORS_ORIGIN` | Comma-separated frontend origins |

### Start backend

```powershell
cd path\to\lyricshub
npm run dev
# API only:
npm run dev:api
```

### Example API calls

**Register**

```bash
curl -X POST http://127.0.0.1:4000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"you@example.com\",\"password\":\"password123\",\"firstName\":\"Jane\",\"lastName\":\"Doe\"}"
```

**Login** (sets HTTP-only refresh cookie + returns `accessToken`)

```bash
curl -X POST http://127.0.0.1:4000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -c cookies.txt ^
  -d "{\"email\":\"you@example.com\",\"password\":\"password123\"}"
```

**Me**

```bash
curl http://127.0.0.1:4000/api/v1/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Logout** (revokes refresh session server-side)

```bash
curl -X POST http://127.0.0.1:4000/api/v1/auth/logout -b cookies.txt
```

Responses include both curriculum shape (`success`, `data`) and SPA fields (`user`, `accessToken`) on auth routes.

### Protected routes

- Any route using `authenticate` / `requireAuth` needs a valid Bearer access token.
- Admin routes (`/api/v1/admin/*`) require `requireRole("ADMIN")`.
- Test: USER → `GET /api/v1/admin/overview` → **403**; ADMIN → **200**.

### Tests

```powershell
cd backend
npm test
```

- `validation.test.ts` — always runs (Zod).
- `auth.integration.test.ts` — runs when `DATABASE_URL` is set.

### Migration for Step 3 user fields

If you have not applied migrations yet:

```powershell
npx prisma migrate dev --name user_profile_auth
```

Migration folder: `20250923180000_user_profile_auth`.

---

## Files touched in this alignment

- `backend/prisma/schema.prisma` — `firstName`, `lastName`, `isActive`
- `backend/prisma/migrations/20250923180000_user_profile_auth/`
- `backend/src/services/authService.ts`, `lib/validation.ts`, `routes/auth.ts`
- `backend/src/middleware/auth.ts`, `authRateLimit.ts`, `lib/apiResponse.ts`
- `backend/src/database/index.ts`, `backend/src/tests/*`
- `backend/.env.example`, `backend/package.json`
- `frontend` register flow — first / last name

**Next (Step 4+ in your roadmap):** artist onboarding, uploads, and lyrics—already partially built in later phases; see `docs/RUN.md` and `docs/PHASE*.md`.
