# Phase 2 — Step 4: User dashboard

Authenticated **user** dashboard UI with React Router, TanStack Query, and Step 3 auth APIs.

## What was built

- **Auth state:** `AuthProvider` + refresh cookie + Bearer access token; user loaded from `GET /api/v1/auth/me` via `useCurrentUser()`.
- **API layer:** `frontend/src/api/client.ts` (HTTP) + `frontend/src/api/auth.ts` (register, login, logout, refresh, me, dashboard summary).
- **Routes:** `/login`, `/register`, `/dashboard` (+ sidebar sections as placeholders).
- **Protection:** `ProtectedRoute`, `GuestRoute`, `LoadingScreen`.
- **Dashboard chrome:** `DashboardLayout`, `DashboardHeader`, `DashboardSidebar`, `UserMenu`, summary `DashboardCard`, `EmptyState`.

Artist upload, AI, and video flows are **not** part of this step; sidebar sections show empty states only.

## Environment

```env
# frontend/.env — leave empty in dev to use Vite proxy
VITE_API_URL=
```

Backend must be running on `http://127.0.0.1:4000` (see `docs/RUN.md`).

## Commands

```powershell
cd C:\Users\THINKPAD\LRCGen
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Manual test checklist

1. Register at `/register` (confirm password must match).
2. Land on `/dashboard` — “Welcome, {firstName}”.
3. Refresh the page — session restored via refresh cookie + `/me`.
4. Open `/dashboard` in a private window — redirect to `/login`.
5. Log out (header menu or user menu) — redirect to `/login`; `/dashboard` blocked.
6. Log in at `/login`.
7. Resize to mobile — hamburger opens sidebar.
8. Visit sidebar: My Songs / Playlists / Videos / Recent — empty states.

## Backend changes

**None required** for Step 4. Existing endpoints:

- `POST /api/v1/auth/register|login|logout|refresh`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/dashboard` (summary counts)

Ensure `DATABASE_URL` is set and migrations are applied (`npm run db:migrate`).
