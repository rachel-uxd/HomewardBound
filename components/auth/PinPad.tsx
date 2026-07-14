"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { DEMO_STAFF, PIN_LENGTH, type StaffMember } from "@/lib/constants";

interface PinPadProps {
  onSuccess: (user: StaffMember) => void;
  showHints?: boolean;
}

export function PinPad({ onSuccess, showHints = true }: PinPadProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const longDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const enterDigit = useCallback(
    (d: string) => {
      if (error) setError(false);
      const next = (pin + d).slice(0, PIN_LENGTH);
      setPin(next);
      if (next.length === PIN_LENGTH) {
        setTimeout(() => {
          const user = DEMO_STAFF.find((s) => s.pin === next.slice(0, 4));
          if (user) {
            onSuccess(user);
          } else {
            setPin("");
            setError(true);
          }
        }, 160);
      }
    },
    [pin, error, onSuccess]
  );

  const clear = () => {
    setPin("");
    setError(false);
  };

  const backspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const fillPin = (staff: StaffMember) => {
    setPin("");
    setError(false);
    staff.pin.split("").forEach((d, i) => {
      setTimeout(() => enterDigit(d), 120 * (i + 1));
    });
  };

  const dots = Array.from({ length: PIN_LENGTH }, (_, i) => ({
    filled: i < pin.length,
    error,
  }));

  const keys = [
    ...["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => ({
      label: d,
      fontSize: "text-[26px]",
      bg: "bg-cream-dark",
      action: () => enterDigit(d),
    })),
    {
      label: "Clear",
      fontSize: "text-sm",
      bg: "bg-transparent",
      action: clear,
    },
    {
      label: "0",
      fontSize: "text-[26px]",
      bg: "bg-cream-dark",
      action: () => enterDigit("0"),
    },
    {
      label: "⌫",
      fontSize: "text-[22px]",
      bg: "bg-transparent",
      action: backspace,
    },
  ];

  return (
    <div className="min-h-screen bg-teal flex items-center justify-center p-8 box-border">
      <div className="w-[400px] max-w-full flex flex-col items-center gap-[26px] animate-[riseIn_.35s_cubic-bezier(.22,1,.36,1)]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-heading font-bold text-[44px] tracking-[.08em] text-cream leading-none">
            AHOPE
          </span>
          <span className="font-heading font-medium text-sm tracking-[.3em] text-gold">
            DAY CENTER
          </span>
          <span className="text-sm text-cream/65 mt-1.5">{longDate}</span>
        </div>

        {/* PIN Card */}
        <div className="flex flex-col items-center gap-[18px] bg-cream rounded-[20px] px-[34px] py-[30px] shadow-[0_24px_64px_rgba(0,0,0,.35)] w-full box-border">
          <span className="font-heading font-semibold text-[17px] tracking-[.08em] uppercase text-teal">
            Enter your PIN
          </span>

          <div
            className={cn(
              "flex gap-3.5",
              error && "animate-[shake_.4s_ease]"
            )}
          >
            {dots.map((d, i) => (
              <span
                key={i}
                className={cn(
                  "w-[18px] h-[18px] rounded-full box-border border-[2.5px] transition-colors duration-[120ms]",
                  d.error
                    ? "bg-red border-red"
                    : d.filled
                      ? "bg-teal border-teal"
                      : "bg-transparent border-cream-muted"
                )}
              />
            ))}
          </div>

          <span className="text-[13.5px] font-bold text-red min-h-[18px] leading-[18px]">
            {error ? "That PIN didn’t match — try again." : ""}
          </span>

          <div className="grid grid-cols-3 gap-3 justify-center">
            {keys.map((k) => (
              <button
                key={k.label}
                onClick={k.action}
                className={cn(
                  "h-[68px] w-[84px] rounded-[16px] border-0 text-teal font-medium",
                  "flex items-center justify-center",
                  "hover:bg-cream-border active:bg-gold",
                  k.fontSize,
                  k.bg
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo hints */}
        {showHints && (
          <div className="flex flex-col items-center gap-2.5">
            <span className="font-heading text-[11px] tracking-[.2em] uppercase text-cream/50">
              Prototype PINs — tap to fill
            </span>
            <div className="flex gap-2.5 flex-wrap justify-center">
              {DEMO_STAFF.map((s) => (
                <button
                  key={s.pin}
                  onClick={() => fillPin(s)}
                  className="flex items-center gap-2 min-h-button px-4 pl-2 rounded-pill border-[1.5px] border-cream/30 bg-cream/[.06] hover:bg-cream/[.16]"
                >
                  <span className="w-[30px] h-[30px] rounded-full bg-gold text-teal font-bold text-xs inline-flex items-center justify-center">
                    {s.initials}
                  </span>
                  <span className="text-cream text-[13px] font-bold">
                    {s.name}
                  </span>
                  <span className="text-gold font-heading text-xs tracking-[.1em]">
                    {s.pin}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
