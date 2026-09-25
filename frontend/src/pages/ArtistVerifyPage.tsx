import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiGet, apiPost } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

type ArtistHit = {
  id: string;
  slug: string;
  name: string;
  isVerified: boolean;
  ownerUserId: string;
};

export function ArtistVerifyPage() {
  const [q, setQ] = useState("");
  const [evidence, setEvidence] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const search = useQuery({
    queryKey: ["artist-search", q],
    queryFn: () => apiGet<{ artists: ArtistHit[] }>(`/api/v1/artists/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length >= 2,
  });

  const request = useMutation({
    mutationFn: () =>
      apiPost(`/api/v1/artists/${selected}/verify-request`, { evidence: evidence || undefined }),
  });

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Verified artist</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Search your artist name, select your profile, and submit verification for admin review.
        </p>
      </div>
      <Input placeholder="Artist name" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="space-y-2">
        {(search.data?.artists ?? []).map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className={`w-full rounded-lg border px-4 py-3 text-left ${
                selected === a.id ? "border-violet-500" : "border-zinc-800"
              }`}
              onClick={() => setSelected(a.id)}
            >
              {a.name} {a.isVerified && <span className="text-emerald-400 text-sm">✓ Verified</span>}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm"
            placeholder="Evidence (links, socials, ID note…)"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          />
          <Button type="button" disabled={request.isPending} onClick={() => void request.mutateAsync()}>
            Request verification
          </Button>
          {request.isSuccess && (
            <p className="text-sm text-emerald-400">Request submitted. Admin will review.</p>
          )}
        </>
      )}
    </div>
  );
}
