import { cn } from "@/lib/utils/cn";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "font-heading text-xs tracking-[.14em] uppercase text-red",
        className
      )}
    >
      {children}
    </span>
  );
}
