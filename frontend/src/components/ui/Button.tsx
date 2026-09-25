import type { ButtonHTMLAttributes } from "react";
import { HubIcon, type HubIconName } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leadingIcon?: HubIconName;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  leadingIcon,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const styles = {
    primary: "hub-btn-primary text-white",
    secondary:
      "border border-blue-500/40 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20",
    outline: "hub-btn-outline",
    ghost: "text-zinc-300 hover:bg-white/5 hover:text-white",
    danger: "bg-red-600/90 text-white hover:bg-red-500",
  };
  const iconPx = size === "sm" ? ICON_SIZE.sm : size === "lg" ? ICON_SIZE.lg : ICON_SIZE.md;

  return (
    <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...props}>
      {leadingIcon ? (
        <HubIcon name={leadingIcon} size={iconPx} className={children ? "mr-2 shrink-0" : ""} />
      ) : null}
      {children}
    </button>
  );
}
