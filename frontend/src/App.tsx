import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/auth/AdminRoute";
import { ArtistRoute } from "./components/auth/ArtistRoute";
import { GuestRoute } from "./components/auth/GuestRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ArtistLayout } from "./components/layout/ArtistLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminOverviewPage } from "./pages/admin/AdminOverviewPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminArtistsPage } from "./pages/admin/AdminArtistsPage";
import { AdminSongsPage } from "./pages/admin/AdminSongsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminVerificationPage } from "./pages/admin/AdminVerificationPage";
import { AdminLanguagesPage } from "./pages/admin/AdminLanguagesPage";
import { AdminTemplatesPage } from "./pages/admin/AdminTemplatesPage";
import { AdminPlaceholderPage } from "./pages/admin/AdminPlaceholderPage";
import { ArtistAnalyticsPage } from "./pages/ArtistAnalyticsPage";
import { ArtistVerifyPage } from "./pages/ArtistVerifyPage";
import { CreateVideoProjectPage } from "./pages/CreateVideoProjectPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ArtistSongDetailPage } from "./pages/artist/songs/ArtistSongDetailPage";
import { ArtistSongEditPage } from "./pages/artist/songs/ArtistSongEditPage";
import { ArtistSongNewPage } from "./pages/artist/songs/ArtistSongNewPage";
import { ArtistSongsListPage } from "./pages/artist/songs/ArtistSongsListPage";
import { NewSongPage } from "./pages/NewSongPage";
import { PlaylistsPage } from "./pages/PlaylistsPage";
import { PublicArtistPage } from "./pages/PublicArtistPage";
import { PublicSongPage } from "./pages/PublicSongPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { SongLanguagePage } from "./pages/SongLanguagePage";
import { SongLyricsEditorPage } from "./pages/SongLyricsEditorPage";
import { UploadMusicVideoPage } from "./pages/UploadMusicVideoPage";
import { VideoEditorPage } from "./pages/VideoEditorPage";
import { ArtistDashboardOverviewPage } from "./pages/artist/ArtistDashboardOverviewPage";
import { ArtistOwnProfilePage } from "./pages/artist/ArtistOwnProfilePage";
import { ArtistProfileEditPage } from "./pages/artist/ArtistProfileEditPage";
import { ArtistSectionPlaceholderPage } from "./pages/artist/ArtistSectionPlaceholderPage";
import { CreateArtistPage } from "./pages/artist/CreateArtistPage";
import { DashboardHomePage } from "./pages/dashboard/DashboardHomePage";
import { DashboardPlaylistsPage } from "./pages/dashboard/DashboardPlaylistsPage";
import { DashboardProfilePage } from "./pages/dashboard/DashboardProfilePage";
import { DashboardProjectsPage } from "./pages/dashboard/DashboardProjectsPage";
import { DashboardRecentPage } from "./pages/dashboard/DashboardRecentPage";
import { DashboardSettingsPage } from "./pages/dashboard/DashboardSettingsPage";
import { DashboardSongsPage } from "./pages/dashboard/DashboardSongsPage";
import { DashboardVideosPage } from "./pages/dashboard/DashboardVideosPage";
import { TemplatesGalleryPage } from "./pages/dashboard/TemplatesGalleryPage";
import { CreateStudioPage } from "./pages/CreateStudioPage";
import { LrcStudioPage } from "./pages/LrcStudioPage";
import { StudioEditorPage } from "./pages/StudioEditorPage";

export default function App() {
  return (
    <Routes>
      <Route path="/tools/lrc-editor" element={<Navigate to="/lrc-studio" replace />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/songs/:id" element={<PublicSongPage />} />
        <Route path="/artists/:id" element={<PublicArtistPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route
          path="/artist/create"
          element={
            <ProtectedRoute>
              <CreateArtistPage />
            </ProtectedRoute>
          }
        />

        <Route path="/artist/songs/upload-audio" element={<ArtistRoute><NewSongPage /></ArtistRoute>} />
        <Route path="/artist/songs/:id/language" element={<ArtistRoute><SongLanguagePage /></ArtistRoute>} />
        <Route path="/artist/songs/:id/lyrics" element={<ArtistRoute><SongLyricsEditorPage /></ArtistRoute>} />
        <Route path="/artist/videos/new" element={<ArtistRoute><CreateVideoProjectPage /></ArtistRoute>} />
        <Route path="/artist/videos/:id" element={<ArtistRoute><VideoEditorPage /></ArtistRoute>} />
        <Route path="/artist/songs/music-video" element={<ArtistRoute><UploadMusicVideoPage /></ArtistRoute>} />
        <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
        <Route path="/artist/verify" element={<ArtistRoute><ArtistVerifyPage /></ArtistRoute>} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="artists" element={<AdminArtistsPage />} />
          <Route path="songs" element={<AdminSongsPage />} />
          <Route
            path="albums"
            element={
              <AdminPlaceholderPage title="Albums" description="Album moderation will be added in a later phase." />
            }
          />
          <Route path="languages" element={<AdminLanguagesPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="verification" element={<AdminVerificationPage />} />
          <Route
            path="settings"
            element={
              <AdminPlaceholderPage
                title="Settings"
                description="Platform-wide configuration (email, limits, feature flags)."
              />
            }
          />
        </Route>
        <Route path="/my/videos/:id" element={<ProtectedRoute><VideoEditorPage /></ProtectedRoute>} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHomePage />} />
        <Route path="/dashboard/songs" element={<DashboardSongsPage />} />
        <Route path="/dashboard/playlists" element={<DashboardPlaylistsPage />} />
        <Route path="/dashboard/videos" element={<DashboardVideosPage />} />
        <Route path="/dashboard/projects" element={<DashboardProjectsPage />} />
        <Route path="/dashboard/templates" element={<TemplatesGalleryPage />} />
        <Route path="/dashboard/recent" element={<DashboardRecentPage />} />
        <Route path="/dashboard/settings" element={<DashboardSettingsPage />} />
        <Route path="/dashboard/profile" element={<DashboardProfilePage />} />
        <Route path="/create" element={<CreateStudioPage />} />
        <Route path="/create/lyric-video" element={<Navigate to="/create" replace />} />
        <Route path="/lrc-studio" element={<LrcStudioPage />} />
        <Route path="/studio/:songId" element={<StudioEditorPage />} />
      </Route>

      <Route
        element={
          <ArtistRoute>
            <ArtistLayout />
          </ArtistRoute>
        }
      >
        <Route path="/artist/dashboard" element={<ArtistDashboardOverviewPage />} />
        <Route path="/artist/profile" element={<ArtistOwnProfilePage />} />
        <Route path="/artist/profile/edit" element={<ArtistProfileEditPage />} />
        <Route path="/artist/songs" element={<ArtistSongsListPage />} />
        <Route path="/artist/songs/new" element={<ArtistSongNewPage />} />
        <Route path="/artist/songs/:id/edit" element={<ArtistSongEditPage />} />
        <Route path="/artist/songs/:id" element={<ArtistSongDetailPage />} />
        <Route
          path="/artist/albums"
          element={
            <ArtistSectionPlaceholderPage
              title="Albums"
              emptyTitle="No albums yet"
              emptyDescription="Album management will be added later."
            />
          }
        />
        <Route
          path="/artist/lyrics"
          element={
            <ArtistSectionPlaceholderPage
              title="Lyrics"
              emptyTitle="Lyrics library"
              emptyDescription="Manage synced lyrics across your catalog."
              actionHref="/lrc-studio"
              actionLabel="Open studio"
            />
          }
        />
        <Route
          path="/artist/videos"
          element={
            <ArtistSectionPlaceholderPage
              title="Music videos"
              emptyTitle="No lyric videos yet"
              emptyDescription="Create a lyrics video from the studio."
              actionHref="/create"
              actionLabel="Create lyrics video"
            />
          }
        />
        <Route path="/artist/analytics" element={<ArtistAnalyticsPage />} />
        <Route
          path="/artist/settings"
          element={
            <ArtistSectionPlaceholderPage
              title="Settings"
              emptyTitle="Artist settings"
              emptyDescription="Preferences for your artist account will be configurable here."
            />
          }
        />
      </Route>
    </Routes>
  );
}
