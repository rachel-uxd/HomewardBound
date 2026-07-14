"use client";

import { useAuth } from "@/lib/providers/AuthProvider";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";

const STATION_ICONS: Record<string, React.ReactNode> = {
  attendance: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  actions: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  mailroom: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  lockers: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M12 3v18M8 8h.01M16 8h.01" />
    </svg>
  ),
  showers: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4a5 5 0 0 0-5 5v2h10V9a5 5 0 0 0-5-5z" />
      <path d="M8 15v1M12 15v2M16 15v1M10 19v1M14 19v1" />
    </svg>
  ),
  reports: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  ),
};

const STATION_DESCS: Record<string, string> = {
  attendance: "Check clients in and log services",
  actions: "Follow-ups and open tasks",
  mailroom: "Held mail and pickups",
  lockers: "Assignments and waitlist",
  showers: "Queue and supplies",
  reports: "Program-level numbers",
};

const DEMO_GLIMMERS = [
  { text: "Got a call back for a kitchen job interview!", who: "Maya C. · logged by Crystal", date: "Jul 8" },
  { text: "Finished pre-screen paperwork without frustration — big step.", who: "Carlos R. · logged by Crystal", date: "Jul 2" },
  { text: "Stayed for lunch and a full conversation for the first time.", who: "Sophia L. · logged by volunteer", date: "Jul 1" },
  { text: "First month of rent paid on time — celebrated with the team.", who: "Michael S. · logged by Crystal", date: "Jun 20" },
];

export function Landing() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const hr = new Date().getHours();
  const greeting =
    hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  const stations = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <div className="bg-teal flex items-center gap-1.5 px-5 h-topbar shadow-[0_2px_10px_rgba(9,51,68,.28)]">
        <button className="flex items-baseline gap-2 border-0 bg-transparent p-0 mr-3.5">
          <span className="font-heading font-bold text-2xl tracking-[.06em] text-cream">
            AHOPE
          </span>
          <span className="font-heading font-medium text-[11px] tracking-[.18em] text-gold">
            DAY CENTER
          </span>
        </button>
        <nav className="flex gap-1 items-center flex-1 overflow-x-auto min-w-0">
          {stations.map((st) => (
            <button
              key={st.key}
              onClick={() => router.push(`/pos?screen=${st.key}`)}
              className="flex items-center h-12 my-2 px-4 border-0 bg-transparent text-cream/85 font-heading font-medium text-[15px] tracking-[.05em] uppercase whitespace-nowrap hover:bg-cream/10"
            >
              {st.label}
            </button>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 min-h-[46px] py-[5px] px-4 pl-1.5 border-[1.5px] border-cream/30 rounded-pill bg-cream/[.06] hover:bg-cream/[.14]"
        >
          <Avatar initials={user.initials} size="sm" variant="gold" />
          <span className="flex flex-col items-start leading-[1.15]">
            <span className="text-cream text-[13px] font-bold">{user.name}</span>
            <span className="text-gold font-heading text-[10px] tracking-[.14em] uppercase">
              Sign out
            </span>
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[1180px] w-full mx-auto px-7 py-10 box-border flex flex-col gap-[30px] animate-[riseIn_.4s_cubic-bezier(.22,1,.36,1)]">
        <div className="flex flex-col gap-1.5">
          <span className="font-heading font-semibold text-4xl uppercase text-teal leading-[1.1]">
            {greeting}, {user.first}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-[26px] items-start">
          {/* Workstations */}
          <div className="flex flex-col gap-3.5">
            <span className="font-heading font-semibold text-sm tracking-[.12em] uppercase text-red">
              Workstations
            </span>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5">
              {stations.map((st) => (
                <a
                  key={st.key}
                  href={`/pos?screen=${st.key}`}
                  className="flex flex-col gap-3 p-5 min-h-[130px] rounded-[16px] bg-white shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)] no-underline box-border hover:shadow-[0_4px_8px_rgba(9,51,68,.12),0_14px_34px_rgba(9,51,68,.18)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="w-11 h-11 rounded-[12px] bg-cream-dark text-teal inline-flex items-center justify-center">
                    {STATION_ICONS[st.key]}
                  </span>
                  <span className="flex flex-col gap-[3px]">
                    <span className="font-heading font-semibold text-[17px] tracking-[.04em] uppercase text-teal">
                      {st.label}
                    </span>
                    <span className="text-[13px] text-text-secondary leading-[1.4]">
                      {STATION_DESCS[st.key]}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Glimmers sidebar */}
          <Card className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.8">
                <path d="M12 3l2.2 5.6L20 10l-5 3.8L16.5 20 12 16.5 7.5 20 9 13.8 4 10l5.8-1.4L12 3z" />
              </svg>
              <span className="font-heading font-semibold text-lg uppercase text-teal">
                Recent glimmers
              </span>
            </div>
            <span className="text-[12.5px] text-text-secondary -mt-2">
              Small wins from around the center this week.
            </span>
            {DEMO_GLIMMERS.map((g, i) => (
              <div
                key={i}
                className="border-l-[3px] border-gold pl-3.5 py-0.5 flex flex-col gap-[3px]"
              >
                <span className="text-sm text-text leading-[1.5]">{g.text}</span>
                <span className="text-xs text-text-secondary">
                  {g.who} · {g.date}
                </span>
              </div>
            ))}
            <span className="text-[13px] text-teal font-bold bg-cream-dark rounded-[10px] px-3.5 py-2.5 text-center">
              {DEMO_GLIMMERS.length} glimmers logged this week — keep them coming.
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}
