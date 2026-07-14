import { cn } from "@/lib/utils/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, string> = {
  sm: "w-[30px] h-[30px] text-xs",
  md: "w-[38px] h-[38px] text-[13px]",
  lg: "w-[46px] h-[46px] text-[16px]",
  xl: "w-[76px] h-[76px] text-[26px] rounded-[14px]",
};

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  variant?: "teal" | "gold";
  className?: string;
}

export function Avatar({
  initials,
  size = "md",
  variant = "teal",
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold shrink-0",
        size === "xl" ? "rounded-[14px]" : "rounded-full",
        variant === "teal" ? "bg-teal text-cream" : "bg-gold text-teal",
        sizeMap[size],
        className
      )}
    >
      {initials}
    </span>
  );
}
