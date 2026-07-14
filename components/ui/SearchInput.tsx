import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes } from "react";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

export function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={containerClassName}>
      <input
        type="text"
        className={cn(
          "w-full box-border min-h-input px-3.5 py-[11px]",
          "border-[1.5px] border-cream-border rounded-button",
          "text-[15px] bg-white",
          className
        )}
        {...props}
      />
    </div>
  );
}
