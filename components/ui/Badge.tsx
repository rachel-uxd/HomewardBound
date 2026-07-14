import { cn } from "@/lib/utils/cn";

type BadgeVariant = "green" | "red" | "gold" | "teal" | "muted";

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-green/12 text-green",
  red: "bg-red/12 text-red",
  gold: "bg-gold/12 text-gold",
  teal: "bg-teal/12 text-teal",
  muted: "bg-cream-dark text-text-secondary",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "muted",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold px-[11px] py-[5px] rounded-pill uppercase tracking-[.04em]",
        variantStyles[variant],
        className
      )}
    >
      {dot && <span>●</span>}
      {children}
    </span>
  );
}
