import { cn } from "@/lib/utils/cn";
import { type TextareaHTMLAttributes } from "react";

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full box-border px-3.5 py-3 border-[1.5px] border-cream-border rounded-button text-[15px] leading-[1.5] resize-y",
        className
      )}
      {...props}
    />
  );
}
