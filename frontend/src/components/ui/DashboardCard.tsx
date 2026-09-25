import { Link } from "react-router-dom";

type DashboardCardProps = {
  title: string;
  description: string;
  count?: number;
  href?: string;
  emptyHint?: string;
};

export function DashboardCard({
  title,
  description,
  count,
  href,
  emptyHint,
}: DashboardCardProps) {
  const body = (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/80">
      <h3 className="font-medium text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {count !== undefined && (
        <p className="mt-4 text-3xl font-semibold tracking-tight text-violet-400">
          {count}
        </p>
      )}
      {emptyHint && count === 0 && (
        <p className="mt-3 text-sm text-zinc-600">{emptyHint}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl">
        {body}
      </Link>
    );
  }

  return body;
}
