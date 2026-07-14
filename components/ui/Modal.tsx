"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-80 bg-[rgba(9,51,68,.45)] animate-[overlayIn_.18s_ease]"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-81 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[540px] max-w-[94vw] max-h-[86vh] overflow-y-auto",
          "bg-white rounded-card shadow-[0_24px_64px_var(--color-shadow-modal)]",
          "px-7 py-[26px] animate-[modalInCentered_.22s_cubic-bezier(.22,1,.36,1)]",
          "flex flex-col gap-4 box-border",
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading font-semibold text-2xl uppercase text-teal leading-[1.1]">
            {title}
          </span>
          <button
            onClick={onClose}
            className="w-11 h-11 border-0 rounded-button bg-cream-dark text-teal text-lg hover:bg-cream-border"
          >
            ✕
          </button>
        </div>
        {subtitle && (
          <span className="text-sm text-text-secondary -mt-2">{subtitle}</span>
        )}
        {children}
      </div>
    </>
  );
}
