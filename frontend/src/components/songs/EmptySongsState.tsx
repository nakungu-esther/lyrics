import { Link } from "react-router-dom";
import { HubIcon } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";
import { Button } from "../ui/Button";

export function EmptySongsState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
      <HubIcon name="songs" size={ICON_SIZE.empty} className="mx-auto mb-4 text-zinc-500" strokeWidth={1.5} />
      <h2 className="text-lg font-medium text-zinc-100">No songs yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        Create your first song to start building your music library.
      </p>
      <Link to="/artist/songs/new" className="mt-6 inline-block">
        <Button type="button" leadingIcon="create">Add Song</Button>
      </Link>
    </div>
  );
}
