import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { HubIcon } from "../components/icons/HubIcon";

const MOCK_LINES = [
  { time: "0:12", end: "0:17", text: "Nze nkuyagala nnyo", words: ["Nze", "nkuyagala", "nnyo"] },
  { time: "0:18", end: "0:23", text: "Oli musana mu bulamu bwange", words: ["Oli", "musana", "mu", "bulamu", "bwange"] },
  { time: "0:24", end: "0:29", text: "Nga nkulaba nseka", words: ["Nga", "nkulaba", "nseka"] },
  { time: "0:30", end: "0:36", text: "Omutima gwange gukuyita", words: ["Omutima", "gwange", "gukuyita"] },
  { time: "0:37", end: "0:43", text: "Nze nkuyagala nnyo", words: ["Nze", "nkuyagala", "nnyo"] },
  { time: "0:44", end: "0:51", text: "Tewali kintu kisinga ggwe", words: ["Tewali", "kintu", "kisinga", "ggwe"] },
];

const waveform = Array.from({ length: 92 }, (_, index) => 18 + ((index * 37) % 48));

export function SongLyricsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [playing, setPlaying] = useState(false);
  const [syncMode, setSyncMode] = useState<"line" | "word">("line");
  const [activeLine, setActiveLine] = useState(0);
  const [font, setFont] = useState("Montserrat");
  const [animation, setAnimation] = useState("Fade in");
  const [highlight, setHighlight] = useState("#facc15");
  const [position, setPosition] = useState("Center");
  const [saved, setSaved] = useState(false);

  const currentLine = MOCK_LINES[activeLine] ?? { time: "0:00", end: "0:05", text: "", words: [] };
  const currentTime = useMemo(() => currentLine.time, [currentLine]);

  return (
<<<<<<< HEAD
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Lyrics editor</h1>
          <p className="mt-1 text-sm text-zinc-400">{song?.title}</p>
          <p className="mt-2 text-sm text-emerald-400/90">{statusLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSyncMode(syncMode === "line" ? "word" : "line")}
          >
            {syncMode === "line" ? "Word sync" : "Line sync"}
          </Button>
          <Link to={`/artist/songs/${id}/language`}>
            <Button type="button" variant="ghost">
              Language
            </Button>
          </Link>
          <Link to="/lrc-studio">
            <Button type="button" variant="ghost">
              LyricsHub LRC (new upload)
            </Button>
          </Link>
=======
    <main className="min-h-screen bg-[#090d18] text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#0c1220] px-5 py-3">
        <div className="flex items-center gap-4">
          <Link to="/artist/songs" className="text-slate-400 hover:text-white"><span aria-hidden="true" className="text-lg">←</span></Link>
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">Lyrics editor</p><h1 className="text-base font-semibold">Nze nkuyagala <span className="font-normal text-slate-500">· Unsaved changes</span></h1></div>
>>>>>>> e711cfddafb0be738c823e5a9c3aae82821ed99c
        </div>
        <div className="flex items-center gap-2"><button className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Preview</button><Button type="button" onClick={() => setSaved(true)}>{saved ? "Saved" : "Save draft"}</Button><button className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold text-white">Export</button></div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)] flex-col xl:flex-row">
        <section className="min-w-0 flex-1 border-b border-slate-800 p-4 lg:p-6 xl:border-b-0 xl:border-r">
          <div className="mx-auto max-w-[920px]">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs text-slate-500">Project / Lyrics synchronization</p><h2 className="mt-1 text-lg font-semibold">Nze nkuyagala</h2></div><div className="flex items-center gap-2 text-xs text-slate-400"><span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-300">4:3 Canvas</span><span>00:12 / 03:45</span></div></div>
            <div className="relative mx-auto aspect-[4/3] max-h-[58vh] overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-950 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(129,140,248,.35),transparent_28%),linear-gradient(145deg,transparent,rgba(2,6,23,.7))]" />
              <div className="absolute left-7 top-7 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">Live preview</div>
              <div className={`absolute inset-x-5 ${position === "Top" ? "top-20" : position === "Bottom" ? "bottom-20" : "top-1/2 -translate-y-1/2"} text-center`}><p className="text-xs text-white/70">{currentLine.text}</p><p className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow-lg md:text-5xl">{currentLine.words.map((word, i) => <span key={word} style={{ color: i === 1 ? highlight : "white" }}>{word} </span>)}</p></div>
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[10px] text-white/60"><span>LYRICSHUB ORIGINAL</span><span>{animation}</span></div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-800 bg-[#0d1424] p-3"><div className="flex items-center gap-3"><button onClick={() => setPlaying(!playing)} className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500 text-white">{playing ? "Ⅱ" : "▶"}</button><span className="font-mono text-xs text-slate-300">{currentTime}</span><div className="h-1.5 flex-1 rounded-full bg-slate-700"><div className="h-full w-[17%] rounded-full bg-violet-400" /></div><span className="font-mono text-xs text-slate-500">03:45</span><button className="text-slate-400">↗</button></div></div>
            <div className="mt-4 rounded-xl border border-slate-800 bg-[#0d1424] p-3"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-300">Audio waveform</span><span className="text-slate-500">BPM 96 · C major</span></div><div className="flex h-14 items-center gap-[2px] overflow-hidden rounded bg-[#10192b] px-2">{waveform.map((height, i) => <span key={i} className={`w-1 shrink-0 rounded-full ${i < 16 ? "bg-violet-400" : "bg-slate-600"}`} style={{ height: `${height}%` }} />)}</div><div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>00:00</span><span>01:00</span><span>02:00</span><span>03:00</span><span>03:45</span></div></div>
          </div>
        </section>

        <aside className="w-full shrink-0 bg-[#0b111e] xl:w-[390px] 2xl:w-[450px]">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h2 className="font-semibold">Lyrics</h2><p className="mt-1 text-xs text-slate-500">Luganda · Ready to edit</p></div><div className="flex rounded-lg border border-slate-700 p-0.5 text-xs"><button onClick={() => setSyncMode("line")} className={`rounded px-2.5 py-1.5 ${syncMode === "line" ? "bg-violet-500 text-white" : "text-slate-400"}`}>Line sync</button><button onClick={() => setSyncMode("word")} className={`rounded px-2.5 py-1.5 ${syncMode === "word" ? "bg-violet-500 text-white" : "text-slate-400"}`}>Word sync</button></div></div>
          <div className="max-h-[54vh] overflow-y-auto p-4">{MOCK_LINES.map((line, index) => <button key={line.time} onClick={() => setActiveLine(index)} className={`mb-2 w-full rounded-lg border p-3 text-left transition ${activeLine === index ? "border-violet-500/70 bg-violet-500/10" : "border-slate-800 bg-slate-900/40 hover:border-slate-600"}`}><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[11px] text-violet-300">{line.time} — {line.end}</span><span className="text-[10px] text-slate-500">{index + 1}</span></div>{syncMode === "word" ? <div className="flex flex-wrap gap-1.5">{line.words.map((word, wordIndex) => <span key={word} className={`rounded bg-slate-800 px-2 py-1 text-sm ${activeLine === index && wordIndex === 1 ? "bg-yellow-400/20 text-yellow-300" : "text-slate-200"}`}>{word}</span>)}</div> : <p className="text-sm font-medium text-slate-200">{line.text}</p>}</button>)}</div>
          <div className="border-t border-slate-800 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sync controls</span><button className="text-xs text-violet-400">Auto sync</button></div><div className="grid grid-cols-2 gap-2"><button onClick={() => setActiveLine(Math.max(0, activeLine - 1))} className="rounded-lg border border-slate-700 py-2 text-xs text-slate-300">← Previous line</button><button onClick={() => setActiveLine(Math.min(MOCK_LINES.length - 1, activeLine + 1))} className="rounded-lg border border-slate-700 py-2 text-xs text-slate-300">Next line →</button></div><button onClick={() => setPlaying(!playing)} className="mt-2 w-full rounded-lg bg-violet-500/15 py-2 text-xs font-semibold text-violet-200">{playing ? "Pause playback" : "Play from selected line"}</button></div>
        </aside>
      </div>

      <section className="border-t border-slate-800 bg-[#0c1220] px-5 py-4"><div className="mx-auto flex max-w-[1400px] flex-wrap items-start gap-6"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Typography</p><div className="flex gap-2"><select value={font} onChange={(e) => setFont(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><option>Montserrat</option><option>Poppins</option><option>Inter</option><option>Playfair Display</option></select><button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold">B</button><button className="rounded-lg border border-slate-700 px-3 py-2 text-xs italic">I</button></div></div><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Highlight color</p><div className="flex items-center gap-2">{["#facc15", "#fb7185", "#38bdf8", "#a78bfa", "#ffffff"].map((color) => <button key={color} onClick={() => setHighlight(color)} style={{ backgroundColor: color }} className={`size-7 rounded-full border-2 ${highlight === color ? "border-white" : "border-transparent"}`} aria-label={`Set ${color}`} />)}</div></div><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Animation</p><select value={animation} onChange={(e) => setAnimation(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><option>Fade in</option><option>Karaoke fill</option><option>Slide up</option><option>Type on</option></select></div><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Position</p><select value={position} onChange={(e) => setPosition(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><option>Top</option><option>Center</option><option>Bottom</option></select></div></div></section>
    </main>
  );
}

export default SongLyricsEditorPage;
