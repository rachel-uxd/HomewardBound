import { cn } from "@/lib/utils/cn";
import { type ReactNode } from "react";

interface PageHeaderProps {
  dateLabel: string;
  title: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  dateLabel,
  title,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-5 flex-wrap mb-5",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-heading text-[13px] tracking-[.14em] uppercase text-gold font-semibold">
          {dateLabel}
        </span>
        <span className="font-heading font-semibold text-[42px] uppercase text-teal leading-none">
          {title}
        </span>
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  );
}
