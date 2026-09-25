import { Link } from "react-router-dom";
import { CreateStudioPage } from "./CreateStudioPage";

/**
 * LyricsHub LRC Studio — React + TypeScript + Node API.
 * Same create flow: upload video or audio → AI lyrics → /studio editor.
 */
export function LrcStudioPage() {
  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">
        Stack: React · TypeScript · Express · BullMQ workers ·{" "}
        <code className="text-zinc-400">AI_TRANSCRIBE_MODE</code> on the backend (not Python).
      </p>
      <CreateStudioPage />
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
        <p className="font-medium text-zinc-200">Already have lyrics on a song?</p>
        <p className="mt-1">
          Open the{" "}
          <Link to="/artist/songs" className="text-violet-400 hover:underline">
            song lyrics editor
          </Link>{" "}
          to fine-tune lines, word times, and export LRC from the platform API.
        </p>
      </section>
    </div>
  );
}
