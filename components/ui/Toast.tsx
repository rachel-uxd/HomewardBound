"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-[26px] left-1/2 -translate-x-1/2 z-90 bg-teal text-cream rounded-pill px-[26px] py-3.5 text-[14.5px] font-medium shadow-[0_12px_32px_var(--color-shadow-modal)] animate-[toastIn_.2s_ease] flex items-center gap-2.5">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="2.2"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="8 12 11 15 16 9" />
      </svg>
      {message}
    </div>
  );
}
