import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Gospel", "Worship", "Praise", "Afrobeat", "Romantic", "Cinematic", "Nature", "Modern", "Minimal", "Karaoke", "Traditional", "Christmas", "Wedding"];

type MockTemplate = { name: string; category: string; description: string; gradient: string; accent: string; motif: string };

const TEMPLATES = ([
  ["Grace Light", "Gospel", "Soft light and uplifting type", "from-violet-950 via-indigo-800 to-slate-950", "#c4b5fd", "✦"],
  ["Choir Room", "Worship", "Warm congregation atmosphere", "from-amber-800 via-orange-700 to-rose-950", "#fde68a", "◉"],
  ["Joyful Noise", "Praise", "Bright celebratory motion", "from-fuchsia-700 via-pink-500 to-orange-400", "#fef08a", "✺"],
  ["Kampala Pulse", "Afrobeat", "Neon rhythm and deep shadows", "from-slate-950 via-cyan-900 to-emerald-700", "#67e8f9", "〰"],
  ["Golden Hour", "Afrobeat", "Sunset gradients for a bold hook", "from-orange-900 via-red-700 to-fuchsia-900", "#fdba74", "☼"],
  ["Velvet Letter", "Romantic", "Elegant handwritten lyric moments", "from-rose-950 via-pink-900 to-purple-950", "#fda4af", "♡"],
  ["Afterglow", "Romantic", "Dreamy grain and soft focus", "from-indigo-950 via-purple-800 to-rose-800", "#ddd6fe", "◌"],
  ["Summit", "Cinematic", "Wide-screen epic titles", "from-slate-950 via-slate-700 to-blue-950", "#bae6fd", "△"],
  ["Noir Frame", "Cinematic", "High contrast film credits", "from-black via-zinc-800 to-zinc-950", "#f8fafc", "▣"],
  ["Wild Fern", "Nature", "Organic shapes and forest tones", "from-emerald-950 via-green-800 to-lime-900", "#bef264", "❧"],
  ["Lake Wind", "Nature", "Airy blue landscape mood", "from-cyan-950 via-sky-800 to-blue-950", "#bae6fd", "≈"],
  ["Gridline", "Modern", "Clean modular typography", "from-slate-950 via-indigo-950 to-violet-900", "#a5b4fc", "＋"],
  ["Chrome Type", "Modern", "Sharp metallic editorial look", "from-zinc-950 via-slate-500 to-zinc-950", "#e2e8f0", "◈"],
  ["Quiet Space", "Minimal", "Calm whitespace and restraint", "from-stone-950 via-stone-800 to-stone-950", "#d6d3d1", "·"],
  ["Mono Caption", "Minimal", "Minimal lyrics, maximum focus", "from-white via-slate-300 to-slate-500", "#111827", "—"],
  ["Sing Along", "Karaoke", "Classic timed word highlight", "from-blue-950 via-indigo-700 to-fuchsia-700", "#fde047", "♪"],
  ["Club Night", "Karaoke", "Electric club-style captions", "from-black via-purple-950 to-cyan-900", "#22d3ee", "⚡"],
  ["Heritage", "Traditional", "Textile-inspired earth palette", "from-amber-950 via-red-900 to-stone-950", "#fbbf24", "✥"],
  ["Mosaic", "Traditional", "Geometric culture-forward layout", "from-red-950 via-orange-800 to-yellow-700", "#fed7aa", "◆"],
  ["December Glow", "Christmas", "Festive lights and snowfall", "from-emerald-950 via-red-800 to-green-950", "#fef3c7", "✧"],
  ["White Wedding", "Wedding", "Soft romantic ceremony titles", "from-slate-100 via-rose-100 to-amber-100", "#be123c", "∞"],
  ["First Dance", "Wedding", "Cinematic vows and slow fades", "from-rose-950 via-slate-800 to-indigo-950", "#fecdd3", "♡"],
] as const).map(([name, category, description, gradient, accent, motif]) => ({ name, category, description, gradient, accent, motif }));

export function TemplatesGalleryPage() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<MockTemplate | null>(null);
  const filtered = useMemo(() => category === "All" ? TEMPLATES : TEMPLATES.filter((template) => template.category === category), [category]);

  return <div className="space-y-8 pb-12">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">LyricsHub Studio</p><h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Template Gallery</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Choose a visual language for your lyrics video. Every template is built on a cinematic 4:3 canvas and can be customized in the editor.</p></div><div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-right"><p className="text-2xl font-bold text-white">{TEMPLATES.length}</p><p className="text-xs text-violet-200">Original Templates</p></div></div>
    <div className="flex gap-2 overflow-x-auto pb-1">{CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}>{item}</button>)}</div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((template) => <article key={template.name} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition duration-200 hover:-translate-y-1 hover:border-violet-500/60 hover:shadow-xl hover:shadow-violet-950/20"><button onClick={() => setSelected(template)} className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${template.gradient} text-left`}><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,transparent_35%,rgba(255,255,255,.25)_36%,transparent_37%),radial-gradient(circle_at_75%_22%,rgba(255,255,255,.35),transparent_18%)]" /><div className="absolute left-4 top-4 rounded-md border border-white/20 bg-black/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70">4:3 preview</div><div className="absolute inset-0 grid place-items-center"><div className="text-center" style={{ color: template.accent }}><p className="mb-3 text-4xl font-light opacity-70">{template.motif}</p><p className="text-xl font-black tracking-tight drop-shadow-lg">Nze nkuyagala</p><p className="mt-1 text-[10px] uppercase tracking-[0.3em] opacity-80">{template.category}</p></div></div><span className="absolute bottom-3 right-3 rounded-full bg-black/35 px-2 py-1 text-[10px] text-white/80 opacity-0 transition group-hover:opacity-100">Preview template</span></button><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-white">{template.name}</h2><p className="mt-1 text-xs text-slate-500">{template.description}</p></div><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400">{template.category}</span></div><Link to="/create" className="mt-4 block rounded-lg border border-slate-700 py-2 text-center text-xs font-semibold text-slate-300 transition hover:border-violet-500 hover:bg-violet-500/10 hover:text-white">Use template</Link></div></article>)}</div>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-white">4:3 primary canvas</h2><p className="mt-1 text-sm text-slate-400">Designed for the standard lyric video composition. Export to vertical, square, or widescreen later.</p></div><div className="flex gap-2 text-xs"><span className="rounded-lg border border-violet-500/60 bg-violet-500/10 px-3 py-2 text-violet-200">4:3 Standard</span><span className="rounded-lg border border-slate-700 px-3 py-2 text-slate-500">9:16</span><span className="rounded-lg border border-slate-700 px-3 py-2 text-slate-500">16:9</span></div></div></section>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setSelected(null)}><div className={`relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br ${selected.gradient} p-8 shadow-2xl`} onClick={(event) => event.stopPropagation()}><button onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-white">×</button><div className="grid h-full place-items-center text-center" style={{ color: selected.accent }}><div><p className="text-6xl opacity-70">{selected.motif}</p><p className="mt-4 text-4xl font-black">Nze nkuyagala</p><p className="mt-2 uppercase tracking-[0.4em]">{selected.name} · 4:3</p><Link to="/create" className="mt-8 inline-block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900">Use this template</Link></div></div></div></div>}
  </div>;
}

export default TemplatesGalleryPage;
