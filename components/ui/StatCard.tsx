import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  className?: string;
}

export function StatCard({ value, label, sublabel, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)] px-5 py-3.5 min-w-[150px]",
        className
      )}
    >
      <span className="font-heading font-semibold text-[28px] text-teal leading-none">
        {value}
      </span>
      <span className="block text-[12.5px] text-text-secondary">{label}</span>
      {sublabel && (
        <span className="block text-[12px] text-text-secondary">{sublabel}</span>
      )}
    </div>
  );
}
