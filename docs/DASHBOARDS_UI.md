# LyricsHub dashboards & tabs (UI mockup map)

Reference: product design board (dark theme `#0f172a`, accent `#6366f1` / `#3b82f6`, Lucide icons).

## 1. User dashboard (`DashboardLayout` · `/dashboard/*`)

| Sidebar tab | Route | Purpose |
|-------------|-------|---------|
| **Home** | `/dashboard` | Greeting, stats, recent projects, quick actions, recent songs table |
| **My Videos** | `/dashboard/videos` | Lyric video projects / renders |
| **My Songs** | `/dashboard/songs` | Songs tied to creator account |
| **Templates** | `/dashboard/templates` | Template gallery + aspect presets |
| **My Projects** | `/dashboard/projects` | All studio projects |
| **Playlists** | `/dashboard/playlists` | User playlists |
| **Recently played** | `/dashboard/recent` | Playback history |
| **Settings** | `/dashboard/settings` | Account preferences |
| **+ Create New** | `/create` | Primary CTA (bottom of sidebar) |

**Home content (mockup):**

- Stats: Total Videos · Total Songs · Templates Used · Storage Used  
- Recent Projects: horizontal cards, status badges (Completed / Processing)  
- Quick actions: Upload Video · Upload Audio · Create New Video · Browse Templates  
- Recent songs table: Title · Language · Genre · Status  

**Also in shell:** `/create`, `/studio/:songId`, `/lrc-studio` (same layout, wide main).

---

## 2. Artist dashboard (`ArtistLayout` · `/artist/*`)

| Sidebar tab | Route | Purpose |
|-------------|-------|---------|
| **Dashboard** | `/artist/dashboard` | Welcome, performance stats, recent songs |
| **My Songs** | `/artist/songs` | Catalog CRUD |
| **Albums** | `/artist/albums` | Albums (placeholder) |
| **Lyrics** | `/artist/lyrics` | Lyrics library → LRC studio |
| **Music Videos** | `/artist/videos` | Lyric videos |
| **Analytics** | `/artist/analytics` | Views / plays |
| **Profile** | `/artist/profile` | Public artist profile |
| **Settings** | `/artist/settings` | Artist preferences |
| **+ Create New** | `/create` | Bottom CTA |

**Dashboard content (mockup):**

- Stats: Total Songs · Total Views · Total Plays · Followers  
- Recent songs list (thumb, plays, Published / Draft)  
- **Right panel:** Quick links (Upload Song, Create Video, Manage Albums, View Analytics) + mini profile card  

---

## 3. Admin (`AdminLayout` · `/admin/*`)

| Sidebar tab | Route | API (backend) |
|-------------|-------|----------------|
| **Overview** | `/admin` | `GET /api/v1/admin/overview` |
| **Users** | `/admin/users` | `GET /api/v1/admin/users` |
| **Artists** | `/admin/artists` | `GET /api/v1/admin/artists` |
| **Songs** | `/admin/songs` | `GET /api/v1/admin/songs` |
| **Albums** | `/admin/albums` | (future) |
| **Languages** | `/admin/languages` | `GET /api/v1/admin/languages` |
| **Templates** | `/admin/templates` | `GET /api/v1/admin/templates` |
| **Reports** | `/admin/reports` | `GET /api/v1/admin/reports` |
| **Verification** | `/admin/verification` | `GET /api/v1/admin/verifications` |
| **Settings** | `/admin/settings` | Platform config (future) |

**Overview page (mockup):**

- Platform stats: Users · Artists · Songs · Videos  
- **Platform growth** chart (users / artists / songs over time)  
- **Recent activity** log (uploads, verifications, signups)  
- **System health:** API · Database · Media processing · Storage — all **Online**  

**Verification tab:** queue with Approve / Reject (existing flows).

---

## 4. Creation flow tabs (not separate dashboards)

| Step | UI | Route / notes |
|------|-----|----------------|
| Upload | Drag-drop + song form | `/create` |
| Language confirm | Confidence + alternatives | `/artist/songs/:id/language` |
| Lyrics sync | Player + timed lines | `/artist/songs/:id/lyrics` |
| Template | Gallery filters | `/dashboard/templates` |
| Customize / preview | Studio editor | `/studio/:songId` |
| Export | Format + render | Studio editor |

Footer **workflow ribbon** (8 steps): Upload → AI Analysis → Generate & Sync → Choose Template → Customize → Preview → Render → Download & Share.

---

## Code pointers

- Nav config: `frontend/src/lib/dashboardNav.ts`  
- User shell: `DashboardSidebar.tsx`, `DashboardHomePage.tsx`  
- Artist shell: `ArtistSidebar.tsx`, `ArtistDashboardOverviewPage.tsx`  
- Admin shell: `AdminLayout.tsx`, `AdminSidebar.tsx`, `frontend/src/pages/admin/*`
