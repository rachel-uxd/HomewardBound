import { cn } from "@/lib/utils/cn";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const paddings = {
    sm: "p-3.5",
    md: "px-6 py-5",
    lg: "px-7 py-6",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
