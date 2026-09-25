import type { ArtistSocialLinks as Links } from "../../features/artist/types";

const PLATFORMS: { key: keyof Links; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
];

export function ArtistSocialLinks({
  website,
  socialLinks,
}: {
  website?: string | null;
  socialLinks?: Links | null;
}) {
  const entries: { href: string; label: string }[] = [];
  if (website?.trim()) entries.push({ href: website, label: "Website" });
  for (const { key, label } of PLATFORMS) {
    const href = socialLinks?.[key];
    if (href?.trim()) entries.push({ href, label });
  }

  if (!entries.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {entries.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:border-violet-500/40 hover:text-white"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
