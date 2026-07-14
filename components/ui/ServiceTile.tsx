import { cn } from "@/lib/utils/cn";
import { type ReactNode } from "react";

interface ServiceTileProps {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  variant?: "default" | "active" | "danger";
  className?: string;
}

const variantStyles = {
  default: "border-0 bg-white text-teal",
  active: "border-0 bg-teal text-cream",
  danger: "border-[1.5px] border-red/35 bg-white text-red hover:bg-red/[.06]",
};

export function ServiceTile({
  icon,
  label,
  sublabel,
  onClick,
  variant = "default",
  className,
}: ServiceTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2.5 p-4 min-h-[104px] rounded-tile",
        "shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)]",
        "text-left hover:-translate-y-px transition-transform",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      <span className="flex flex-col gap-0.5">
        <span className="font-heading font-semibold text-[15px] tracking-[.05em] uppercase">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs font-medium font-body normal-case tracking-normal opacity-85">
            {sublabel}
          </span>
        )}
      </span>
    </button>
  );
}
