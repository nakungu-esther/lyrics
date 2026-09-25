export type ArtistVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type ArtistSocialLinks = {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  x?: string;
};

export type ArtistVerification = {
  status: ArtistVerificationStatus;
  rejectionNote: string | null;
};

export type Artist = {
  id: string;
  slug: string;
  name: string;
  biography: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  genre: string | null;
  location: string | null;
  website: string | null;
  socialLinks: ArtistSocialLinks | null;
  isVerified: boolean;
  verification?: ArtistVerification;
  createdAt?: string;
  updatedAt?: string;
};

export type ArtistPublic = Artist & {
  stats: {
    songs: number;
    albums: number;
    lyrics: number;
    videos: number;
  };
};

export type ArtistMeResponse = {
  success?: boolean;
  data?: { artist: Artist | null };
  artist?: Artist | null;
};

/** @deprecated Use `Artist` */
export type ArtistProfile = Artist;

export type ArtistDashboardStats = {
  songs: number;
  albums: number;
  lyrics: number;
  videos: number;
  views: number;
};

export type ArtistDashboardResponse = {
  success?: boolean;
  data?: {
    stats: ArtistDashboardStats;
    artist: Artist | null;
  };
  stats?: ArtistDashboardStats;
  artist?: Artist | null;
};

export type ProcessingJobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type UploadJob = {
  id: string;
  status: ProcessingJobStatus;
  progress: number;
  message: string | null;
  error?: string | null;
};
