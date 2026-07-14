"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/providers/AuthProvider";
import { DEMO_STAFF, NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { Avatar } from "@/components/ui/Avatar";

interface TopBarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  badgeCounts?: Record<string, number>;
}

export function TopBar({
  activeScreen,
  onScreenChange,
  badgeCounts = {},
}: TopBarProps) {
  const { user, signOut, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!user) return null;

  const visibleNav = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      <div className="sticky top-0 z-60 bg-teal flex items-center gap-1.5 px-4 h-topbar shadow-[0_2px_10px_rgba(9,51,68,.28)]">
        {/* Logo */}
        <a
          href="/"
          className="flex items-baseline gap-2 mr-3.5 no-underline"
        >
          <span className="font-heading font-bold text-2xl tracking-[.06em] text-cream">
            AHOPE
          </span>
          <span className="font-heading font-medium text-[11px] tracking-[.18em] text-gold">
            DAY CENTER
          </span>
        </a>

        {/* Nav */}
        <nav className="flex gap-1 items-center flex-1 overflow-x-auto min-w-0" style={{ maskImage: "linear-gradient(to right, #000 calc(100% - 18px), transparent)" }}>
          {visibleNav.map((item) => {
            const isActive = item.key === activeScreen;
            const badge = badgeCounts[item.key];
            return (
              <button
                key={item.key}
                onClick={() => onScreenChange(item.key)}
                className={cn(
                  "relative flex items-center gap-[7px] h-12 my-2 px-4 border-0 bg-transparent",
                  "font-heading font-medium text-[15px] tracking-[.05em] uppercase whitespace-nowrap",
                  "hover:bg-cream/10",
                  isActive
                    ? "text-cream shadow-[inset_0_-3px_0_var(--color-gold)]"
                    : "text-cream/70 shadow-none"
                )}
              >
                {item.label}
                {badge !== undefined && badge > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-pill bg-red text-white font-body text-[11px] font-bold inline-flex items-center justify-center px-[5px]">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User pill */}
        <button
          onClick={() => setRoleMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 min-h-[46px] py-[5px] px-3 pl-1.5 border-[1.5px] border-cream/30 rounded-pill bg-cream/[.06] hover:bg-cream/[.14]"
        >
          <Avatar initials={user.initials} size="sm" variant="gold" className="w-[34px] h-[34px] text-sm" />
          <span className="flex flex-col items-start leading-[1.15]">
            <span className="text-cream text-[13px] font-bold">{user.name}</span>
            <span className="text-gold font-heading text-[10px] tracking-[.14em] uppercase">
              {ROLE_LABELS[user.role]}
            </span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-cream)" strokeWidth="2.2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Role menu */}
      {roleMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-70"
            onClick={() => setRoleMenuOpen(false)}
          />
          <div className="fixed top-[70px] right-4 z-71 w-[300px] bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_16px_40px_rgba(9,51,68,.22)] p-2.5 animate-[modalIn_.15s_ease]">
            <div className="font-heading text-[11px] tracking-[.14em] uppercase text-red px-2.5 pt-2 pb-1.5">
              Switch role
            </div>
            {DEMO_STAFF.map((staff) => {
              const isActive = staff.role === user.role;
              return (
                <button
                  key={staff.pin}
                  onClick={() => {
                    switchRole(staff.role);
                    setRoleMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full min-h-[56px] p-2 px-2.5 border-0 rounded-[10px] text-left",
                    isActive ? "bg-cream" : "bg-transparent hover:bg-cream-dark"
                  )}
                >
                  <Avatar
                    initials={staff.initials}
                    size="md"
                    variant={isActive ? "gold" : "teal"}
                    className="w-9 h-9 text-sm"
                  />
                  <span className="flex flex-col leading-[1.25]">
                    <span className="text-sm font-bold text-text">
                      {staff.name} · {ROLE_LABELS[staff.role]}
                    </span>
                    <span className="text-xs text-text-secondary">
                      PIN: {staff.pin}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
