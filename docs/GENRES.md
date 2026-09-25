# Genres & Gospel on LyricsHub

**Genre and language are independent fields on `Song`.**

Example:

| Title        | Genre  | Subgenre | Language |
|-------------|--------|----------|----------|
| Katonda Wange | Gospel | Worship  | Luganda (`lg`) |

Search examples (published catalog):

- `GET /api/v1/search?language=lg&genre=Gospel` — Luganda Gospel
- `GET /api/v1/search?genre=Gospel&subgenre=Worship` — Gospel Worship
- `GET /api/v1/search?genre=Gospel&artist=…` — Gospel by artist

## Catalog API

`GET /api/v1/genres` returns primary genres, Gospel subgenres, and planned Gospel video template metadata.

## Gospel video templates

Seed with `backend/prisma/seed-video-templates.sql` (slugs: `gospel-worship`, `gospel-praise`, `gospel-choir`, `gospel-music-video`). Full render styling comes in the video phase.

## Migration

`20250923230000_song_subgenre` adds optional `Song.subgenre`.
