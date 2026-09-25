import type { ButtonHTMLAttributes } from "react";
import { HubIcon, type HubIconName } from "../icons/HubIcon";
import { ICON_SIZE, ICON_STROKE, type IconSizeToken } from "../icons/iconDefaults";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: HubIconName;
  /** Visible label (optional). When omitted, `aria-label` is required. */
  label?: string;
  variant?: "default" | "ghost" | "danger" | "primary";
  size?: "sm" | "md" | "lg";
  iconSize?: IconSizeToken | number;
};

const variantClass = {
  default: "text-zinc-300 hover:bg-white/5 hover:text-white",
  ghost: "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
  danger: "text-red-400 hover:bg-red-500/10 hover:text-red-300",
  primary: "bg-indigo-600/90 text-white hover:bg-indigo-500",
} as const;

const padClass = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
} as const;

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  iconSize = "md",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  const px = typeof iconSize === "number" ? iconSize : ICON_SIZE[iconSize];

  return (
    <button
      type={type}
      title={label}
      aria-label={label ?? props["aria-label"]}
      className={[
        "inline-flex items-center justify-center rounded-xl transition disabled:pointer-events-none disabled:opacity-50",
        padClass[size],
        variantClass[variant],
        label ? "gap-2 px-3" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <HubIcon name={icon} size={px} strokeWidth={ICON_STROKE} />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </button>
  );
}
