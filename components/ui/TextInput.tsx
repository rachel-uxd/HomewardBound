import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextInput({ label, className, ...props }: TextInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[13px] font-bold text-teal">{label}</span>
      )}
      <input
        className={cn(
          "w-full box-border min-h-input px-3.5 py-[11px]",
          "border-[1.5px] border-cream-border rounded-button text-[15px]",
          className
        )}
        {...props}
      />
    </div>
  );
}
