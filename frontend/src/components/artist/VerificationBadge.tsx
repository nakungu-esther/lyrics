import type { ArtistVerificationStatus } from "../../features/artist/types";
import { HubIcon } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";

export function VerificationBadge({
  isVerified,
  status,
  className = "",
}: {
  isVerified: boolean;
  status?: ArtistVerificationStatus;
  className?: string;
}) {
  if (!isVerified && status !== "VERIFIED") return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ${className}`}
    >
      <HubIcon name="verified" size={ICON_SIZE.xs} className="text-emerald-400" />
      Verified Artist
    </span>
  );
}
