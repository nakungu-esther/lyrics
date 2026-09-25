# LyricsHub — Product definition

**LyricsHub** is an AI-powered **Ugandan music, lyrics, and lyric-video platform**.

**Core experience (LyricsHub Studio):** Upload **video** or **audio** → AI analyzes → detect language → generate & synchronize lyrics → **automatic initial video project** → **live editor** (preview while media plays) → customize templates & styling → render.

Entry: **`/create`** or **`/lrc-studio`** → **`/studio/:songId`** (React + TypeScript + Node only — **no Python**)

---

## Two creation modes (core, not optional)

### 1. Video + audio / lyrics

Upload an existing **video clip**. The clip **plays immediately** in the studio editor while AI runs:

- Extract / use audio from the clip  
- Detect language  
- Generate lyrics (STT)  
- Synchronize timings  
- Overlay lyrics on **your video** (Music Video Overlay template by default)

You control the **creative** layer: font, size, colors, highlight color, position, animation, shadows, background mode, template, export aspect, then **render**.

### 2. Audio-only

Upload **audio/song only**. AI runs the same language + lyrics + sync pipeline, then applies a **template library** background (Classic, Karaoke, Gospel/Worship, Dynamic, Afrobeat, Romantic, Minimalist, Cinematic, Waveform, etc.). Lyrics are placed automatically; you customize before export.

---

## Full pipeline (automatic vs human)

| Step | Who |
|------|-----|
| Upload video or audio | User |
| Analyze audio, detect language, transcribe, sync lyrics | **AI (background jobs)** |
| Create initial video project + open editor | **Platform** |
| Choose/change template, fonts, colors, animation, format | **User (creative)** |
| Preview while song/clip plays | **User** |
| Render final MP4 | **AI/worker** |

Users do **not** need to type every line or manually sync every timestamp for the first draft; they refine look & feel and optional lyric edits.

---

## Language, Gospel, discovery, admin

(See previous sections in git history — languages, gospel as genre, search, roles unchanged.)

**Supported languages:** Luganda, English, Runyankole, Lusoga, Acholi, Lugisu, Lugwere, Swahili.

---

## Related docs

- [LYRIC_VIDEO.md](./LYRIC_VIDEO.md) — API & routes  
- [RUN.md](./RUN.md) — dev + workers  
- [PLATFORM_BLUEPRINT.md](./PLATFORM_BLUEPRINT.md) — modules  
