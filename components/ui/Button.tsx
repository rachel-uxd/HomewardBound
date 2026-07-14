import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-0 bg-teal text-cream hover:bg-teal-dark",
  secondary:
    "border-[1.5px] border-teal bg-transparent text-teal hover:bg-teal hover:text-cream",
  danger:
    "border-0 bg-red text-white hover:bg-red-dark",
  ghost:
    "border-0 bg-transparent text-teal hover:bg-cream-dark",
  success:
    "border-0 bg-green text-white hover:opacity-[.88]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-3.5 text-xs",
  md: "min-h-[44px] px-4 text-[13px]",
  lg: "min-h-[48px] px-[18px] text-[13px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-button font-heading font-semibold tracking-[.06em] uppercase",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
