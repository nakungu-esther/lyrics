import { Link } from "react-router-dom";
import { HubIcon, type HubIconName } from "../icons/HubIcon";
import { Card } from "./Card";

type QuickActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: HubIconName;
  accent?: string;
};

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  accent = "from-indigo-600/20 to-violet-600/10",
}: QuickActionCardProps) {
  return (
    <Link to={href} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      <Card hover className={`bg-gradient-to-br ${accent} min-h-[140px]`}>
        <HubIcon name={icon} className="text-indigo-300" size={28} />
        <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{description}</p>
      </Card>
    </Link>
  );
}
