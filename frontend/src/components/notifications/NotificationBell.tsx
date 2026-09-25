import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiGet, apiPost } from "../../api/client";
import { IconButton } from "../ui/IconButton";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<{ notifications: Notification[] }>("/api/v1/notifications/me"),
    refetchInterval: 30000,
  });

  const unread = (data?.notifications ?? []).filter((n) => !n.readAt).length;

  return (
    <div className="relative">
      <div className="relative">
        <IconButton
          icon="bell"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
          className="text-zinc-300 hover:text-white"
          onClick={() => setOpen(!open)}
        />
        {unread > 0 && (
          <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl p-2 max-h-96 overflow-y-auto">
          {(data?.notifications ?? []).slice(0, 15).map((n) => (
            <div
              key={n.id}
              className={`rounded px-3 py-2 text-sm ${n.readAt ? "text-zinc-500" : "text-zinc-200"}`}
            >
              <p className="font-medium">{n.title}</p>
              {n.body && <p className="text-xs text-zinc-500 mt-0.5">{n.body}</p>}
            </div>
          ))}
          <button
            type="button"
            className="w-full text-xs text-violet-400 py-2"
            onClick={() => {
              void apiPost("/api/v1/notifications/read-all").then(() =>
                queryClient.invalidateQueries({ queryKey: ["notifications"] }),
              );
            }}
          >
            Mark all read
          </button>
        </div>
      )}
    </div>
  );
}
