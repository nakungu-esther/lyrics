import { Link } from "react-router-dom";
import { HubIcon, type HubIconName } from "../icons/HubIcon";
import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string | number;
  href?: string;
  icon?: HubIconName;
  trend?: string;
};

export function StatCard({ label, value, href, icon, trend }: StatCardProps) {
  const inner = (
    <Card hover={Boolean(href)} className="hub-stat-card flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-zinc-400">{label}</p>
        {icon && (
          <HubIcon name={icon} className="text-indigo-400/90" size={22} />
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      {trend && <p className="text-xs text-emerald-400/90">{trend}</p>}
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
