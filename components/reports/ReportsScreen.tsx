"use client";

import { useMemo } from "react";
import {
  DEMO_CLIENTS,
  DEMO_MAIL,
  DEMO_LOCKERS,
  DEMO_SHOWER_WOMEN,
  DEMO_SHOWER_MEN,
  TODAY_LABEL,
} from "@/lib/demo-data";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const DEMO_GLIMMER_FEED = [
  { text: "Got a call back for a kitchen job interview!", meta: "Maya C. · Crystal G. · Jul 8" },
  { text: "Finished pre-screen paperwork without frustration — big step.", meta: "Carlos R. · Crystal G. · Jul 2" },
  { text: "Stayed for lunch and a full conversation for the first time.", meta: "Sophia L. · Volunteer · Jul 1" },
  { text: "First month of rent paid on time — celebrated with the team.", meta: "Michael S. · Crystal G. · Jun 20" },
  { text: "Brought a pay stub from a new part-time job.", meta: "Terrence A. · Kim L. · Jul 10" },
  { text: "Made a doctor appointment and actually went.", meta: "Lisa P. · Jordan P. · Jul 7" },
];

export function ReportsScreen() {
  const stats = useMemo(() => {
    const checkedIn = DEMO_CLIENTS.filter((c) => c.checkedIn).length;
    const showersCompleted = DEMO_SHOWER_WOMEN.length + DEMO_SHOWER_MEN.length + 38;
    const mailPickups = DEMO_MAIL.filter((m) => m.status === "released").length;
    const newClients = DEMO_CLIENTS.filter((c) =>
      c.metaPairs.some((m) => m.k === "Visits (30d)" && parseInt(m.v) <= 3)
    ).length;
    const lockerAssignments = DEMO_LOCKERS.length;
    return { checkedIn, showersCompleted, mailPickups, newClients, lockerAssignments };
  }, []);

  const SERVICE_MIX = [
    { label: "Check-ins", n: stats.checkedIn, pct: `${Math.round((stats.checkedIn / DEMO_CLIENTS.length) * 100)}%` },
    { label: "Showers", n: stats.showersCompleted, pct: `${Math.min(100, Math.round((stats.showersCompleted / stats.checkedIn) * 100))}%` },
    { label: "Mail", n: stats.mailPickups, pct: `${Math.round((stats.mailPickups / DEMO_MAIL.length) * 100)}%` },
    { label: "Lockers", n: stats.lockerAssignments, pct: `${Math.round((stats.lockerAssignments / DEMO_CLIENTS.length) * 100)}%` },
  ];

  const TODAY_STATS = [
    { n: stats.checkedIn, label: "Checked in today" },
    { n: stats.showersCompleted, label: "Showers completed" },
    { n: stats.mailPickups, label: "Mail pickups" },
    { n: stats.newClients, label: "New client records" },
    { n: stats.lockerAssignments, label: "Locker assignments" },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-[60px] max-w-[1240px] w-full box-border mx-auto">
      <PageHeader dateLabel={TODAY_LABEL} title="Today" />

      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 mb-6">
        {TODAY_STATS.map((tc) => (
          <Card key={tc.label} className="flex flex-col gap-1 px-[22px] py-5">
            <span className="font-heading font-semibold text-[40px] text-teal leading-none">
              {tc.n}
            </span>
            <span className="text-[13.5px] text-text-secondary">
              {tc.label}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Attendance chart */}
        <Card className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-heading font-semibold text-xl uppercase text-teal">
              Daily attendance
            </span>
            <div className="flex gap-4 text-[12.5px] text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal" />
                This year
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cream-muted" />
                Last year
              </span>
            </div>
          </div>
          <svg viewBox="0 0 680 240" className="w-full h-auto">
            <line x1="40" y1="20" x2="40" y2="210" stroke="var(--color-cream-border)" strokeWidth="1" />
            <line x1="40" y1="210" x2="670" y2="210" stroke="var(--color-cream-border)" strokeWidth="1" />
            <line x1="40" y1="145" x2="670" y2="145" stroke="#F1EADC" strokeWidth="1" />
            <line x1="40" y1="80" x2="670" y2="80" stroke="#F1EADC" strokeWidth="1" />
            <text x="34" y="214" textAnchor="end" fontSize="11" fill="var(--color-text-secondary)" fontFamily="DM Sans">0</text>
            <text x="34" y="149" textAnchor="end" fontSize="11" fill="var(--color-text-secondary)" fontFamily="DM Sans">125</text>
            <text x="34" y="84" textAnchor="end" fontSize="11" fill="var(--color-text-secondary)" fontFamily="DM Sans">250</text>
            <polyline
              points="60,180 110,170 160,160 210,165 260,155 310,145 360,140 410,150 460,130 510,120 560,125 610,115 660,110"
              fill="none"
              stroke="var(--color-cream-muted)"
              strokeWidth="2"
            />
            <polyline
              points="60,175 110,165 160,150 210,140 260,135 310,125 360,115 410,120 460,105 510,95 560,90 610,85 660,80"
              fill="none"
              stroke="var(--color-teal)"
              strokeWidth="2.5"
            />
          </svg>
          <div className="grid grid-cols-4 gap-2.5 border-t border-dashed border-cream-border pt-3.5">
            {SERVICE_MIX.map((sm) => (
              <div key={sm.label} className="flex flex-col gap-[5px]">
                <span className="text-xs text-text-secondary">{sm.label}</span>
                <div className="h-2 rounded-pill bg-cream-dark overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-pill"
                    style={{ width: sm.pct }}
                  />
                </div>
                <span className="font-heading font-semibold text-[16px] text-teal">
                  {sm.n}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Glimmers this week */}
        <Card className="flex flex-col gap-3">
          <span className="font-heading font-semibold text-xl uppercase text-teal">
            Glimmers this week
          </span>
          <span className="text-[12.5px] text-text-secondary -mt-1.5">
            Brief celebrations worth sharing with the team.
          </span>
          {DEMO_GLIMMER_FEED.map((gf, i) => (
            <div
              key={i}
              className="border-l-[3px] border-gold pl-3.5 py-0.5 flex flex-col gap-[3px]"
            >
              <span className="text-sm text-text leading-[1.5]">{gf.text}</span>
              <span className="text-[11.5px] text-text-secondary uppercase tracking-[.05em]">
                {gf.meta}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
