# Database (Neon PostgreSQL)

The platform uses **Neon** for PostgreSQL. Prisma schema: `backend/prisma/schema.prisma`.

## 1. Create Neon project

1. Sign in at [neon.tech](https://neon.tech) and create a project.
2. Copy the **connection string** (pooled recommended for serverless/API).

## 2. Configure environment

In the repo root `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

Neon requires SSL; keep `sslmode=require` (or use the string Neon provides verbatim).

## 3. Apply schema (you run this)

From the repo root:

```bash
npm install
copy .env.example .env
# edit DATABASE_URL for Neon
npm run db:generate
npm run db:migrate
```

For a fresh Neon DB with no migration history yet, `migrate dev` creates tables under `backend/prisma/migrations/`.

Alternative (prototypes only):

```bash
npx prisma db push
```

## 4. Seed languages (optional)

After migrations, insert launch languages (Luganda, English, etc.) via Neon SQL editor or:

```sql
INSERT INTO "Language" (code, name) VALUES
  ('lg',  'Luganda'),
  ('en',  'English'),
  ('nyn', 'Runyankole'),
  ('xog', 'Lusoga'),
  ('ach', 'Acholi'),
  ('xlu', 'Lugisu'),
  ('lwg', 'Lugwere'),
  ('sw',  'Swahili')
ON CONFLICT (code) DO NOTHING;
```

## 5. Local Redis (optional)

Postgres is on Neon; Redis for BullMQ can still run locally:

```bat
docker compose up -d
```

Set `REDIS_URL=redis://127.0.0.1:6379` in `.env`.

## Scripts

| Command | Location |
|---------|----------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:studio` | Prisma Studio |
