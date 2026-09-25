import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
};

const tones = {
  default: "bg-white/10 text-zinc-200",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-amber-500/15 text-amber-200",
  danger: "bg-red-500/15 text-red-300",
  accent: "bg-indigo-500/20 text-indigo-200",
};

export function Badge({ children, tone = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
