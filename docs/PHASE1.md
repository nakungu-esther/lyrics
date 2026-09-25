# Phase 1 — Step 1: Project foundation

Monorepo with **two apps** that run **independently**:

```text
lyrics-platform/          # repo root (Nyimba)
├── frontend/             # React + TypeScript + Vite + Tailwind + Router + TanStack Query
├── backend/              # Node + TypeScript + Express + Prisma + PostgreSQL (Neon)
├── eslint.config.js      # shared ESLint
├── prettier.config.js
└── package.json          # npm workspaces
```

No business features yet — only health check API and scaffold UI.

## Install (once)

```bat
install.bat
```

Or: `npm install`, then copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env`.

## Run independently

**Terminal 1 — backend** (port 4000):

```bat
npm run dev:backend
```

Health: http://127.0.0.1:4000/api/v1/health  
DB: http://127.0.0.1:4000/api/v1/health/db (needs `DATABASE_URL` in `backend/.env`)

**Terminal 2 — frontend** (port 5173):

```bat
npm run dev:frontend
```

App: http://127.0.0.1:5173 (proxies `/api` to the backend)

## Neon / Prisma

Set `DATABASE_URL` in `backend/.env`, then:

```bat
npm run db:generate
npm run db:migrate
```

## Lint & format

```bat
npm run lint
npm run format
```
