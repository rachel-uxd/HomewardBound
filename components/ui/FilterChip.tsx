import { cn } from "@/lib/utils/cn";

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  pill?: boolean;
  className?: string;
}

export function FilterChip({
  label,
  active,
  onClick,
  pill = false,
  className,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-button border-[1.5px] border-teal font-heading font-semibold text-[13px] tracking-[.05em] uppercase",
        pill ? "rounded-pill px-[18px]" : "rounded-button px-4",
        active ? "bg-teal text-cream" : "bg-transparent text-teal hover:bg-teal hover:text-cream",
        className
      )}
    >
      {label}
    </button>
  );
}
