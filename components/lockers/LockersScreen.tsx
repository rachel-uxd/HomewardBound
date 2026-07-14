"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import {
  DEMO_LOCKERS,
  DEMO_LOCKER_WAITLIST,
  TODAY_LABEL,
  type DemoLockerAssignment,
  type DemoLockerWaitlist,
} from "@/lib/demo-data";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { ClientPickerModal } from "@/components/modals/ClientPickerModal";

type Tab = "assigned" | "waiting";
const PAGE_SIZE = 20;

export function LockersScreen() {
  const [tab, setTab] = useState<Tab>("assigned");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assignments, setAssignments] = useState<DemoLockerAssignment[]>(DEMO_LOCKERS);
  const [waitlist, setWaitlist] = useState<DemoLockerWaitlist[]>(DEMO_LOCKER_WAITLIST);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(0);
    setSearchQ("");
    setMenuOpen(null);
  };

  const handleAssign = (wl: DemoLockerWaitlist) => {
    const newAssignment: DemoLockerAssignment = {
      id: `assigned-${Date.now()}`,
      clientId: wl.clientId,
      clientName: wl.clientName,
      clientInitials: wl.clientInitials,
      lockerNumber: wl.nextLocker,
      since: "Jul 14, 2026",
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setWaitlist((prev) => prev.filter((w) => w.id !== wl.id));
    setToast(`Locker #${wl.nextLocker} assigned to ${wl.clientName}`);
  };

  const handleUnassign = (lk: DemoLockerAssignment) => {
    setAssignments((prev) => prev.filter((a) => a.id !== lk.id));
    setMenuOpen(null);
    setToast(`Locker #${lk.lockerNumber} unassigned from ${lk.clientName}`);
  };

  const handleRemoveFromWaitlist = (wl: DemoLockerWaitlist) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== wl.id));
    setToast(`${wl.clientName} removed from waitlist`);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-[60px] max-w-[1240px] w-full box-border mx-auto">
      <PageHeader dateLabel={TODAY_LABEL} title="Lockers">
        <StatCard value={assignments.length} label="Lockers" sublabel="Currently assigned" />
        <StatCard value={waitlist.length} label="Queued" sublabel="Clients waiting" />
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b-[2px] border-cream-dark mb-4">
        <button
          onClick={() => handleTabChange("assigned")}
          className={cn(
            "px-6 py-3 font-heading font-semibold text-[15px] uppercase tracking-[.05em] border-b-[3px] -mb-[2px]",
            tab === "assigned"
              ? "border-teal text-teal"
              : "border-transparent text-text-secondary hover:text-teal"
          )}
        >
          Assigned
          <span className="ml-2 text-[12px] font-bold bg-teal text-cream rounded-pill px-2 py-0.5 align-middle">
            {assignments.length}
          </span>
        </button>
        <button
          onClick={() => handleTabChange("waiting")}
          className={cn(
            "px-6 py-3 font-heading font-semibold text-[15px] uppercase tracking-[.05em] border-b-[3px] -mb-[2px]",
            tab === "waiting"
              ? "border-teal text-teal"
              : "border-transparent text-text-secondary hover:text-teal"
          )}
        >
          Waiting
          <span className="ml-2 text-[12px] font-bold bg-text-secondary text-cream rounded-pill px-2 py-0.5 align-middle">
            {waitlist.length}
          </span>
        </button>
      </div>

      {tab === "assigned" ? (
        <AssignedTab
          data={assignments}
          searchQ={searchQ}
          setSearchQ={(q) => { setSearchQ(q); setPage(0); }}
          page={page}
          setPage={setPage}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onUnassign={handleUnassign}
          onLogTransaction={(lk) => {
            setToast(`Locker access logged for ${lk.clientName} (Locker #${lk.lockerNumber})`);
            setMenuOpen(null);
          }}
        />
      ) : (
        <WaitingTab
          data={waitlist}
          searchQ={searchQ}
          setSearchQ={(q) => { setSearchQ(q); setPage(0); }}
          page={page}
          setPage={setPage}
          onAssign={handleAssign}
          onRemove={handleRemoveFromWaitlist}
          onAddToWaitlist={() => setPickerOpen(true)}
        />
      )}

      <ClientPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(client) => {
          setPickerOpen(false);
          setToast(`${client.firstName} ${client.lastName} added to locker waitlist`);
        }}
        title="Add to waitlist"
        subtitle="Select a client to add to the locker waitlist."
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function AssignedTab({
  data,
  searchQ,
  setSearchQ,
  page,
  setPage,
  menuOpen,
  setMenuOpen,
  onUnassign,
  onLogTransaction,
}: {
  data: DemoLockerAssignment[];
  searchQ: string;
  setSearchQ: (q: string) => void;
  page: number;
  setPage: (p: number | ((p: number) => number)) => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
  onUnassign: (lk: DemoLockerAssignment) => void;
  onLogTransaction: (lk: DemoLockerAssignment) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQ.trim()) return data;
    const q = searchQ.toLowerCase();
    return data.filter(
      (l) =>
        l.clientName.toLowerCase().includes(q) ||
        l.clientAlias?.toLowerCase().includes(q) ||
        String(l.lockerNumber).includes(q)
    );
  }, [searchQ, data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  return (
    <div className="bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)] overflow-visible">
      {/* Table header with search */}
      <div className="grid grid-cols-[1.6fr_1fr_140px_60px] gap-2.5 items-center bg-teal text-cream px-[18px] py-3 font-heading text-xs tracking-[.08em] uppercase rounded-t-card">
        <span className="flex items-center gap-2.5">
          Client
          <SearchInput
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search"
            className="w-[180px] text-text !text-xs !min-h-[32px] !py-1 !px-2.5 !rounded-[6px] !border-cream/30 !bg-white/15 placeholder:!text-cream/60 !text-cream"
          />
        </span>
        <span>Assigned</span>
        <span>Locker</span>
        <span>Edit</span>
      </div>

      {rows.map((lk) => (
        <LockerRow
          key={lk.id}
          locker={lk}
          menuOpen={menuOpen === lk.id}
          onToggleMenu={() => setMenuOpen(menuOpen === lk.id ? null : lk.id)}
          onCloseMenu={() => setMenuOpen(null)}
          onUnassign={() => onUnassign(lk)}
          onLogTransaction={() => onLogTransaction(lk)}
        />
      ))}

      {rows.length === 0 && (
        <div className="px-[18px] py-8 text-center text-sm text-text-secondary">
          No lockers match &ldquo;{searchQ}&rdquo;
        </div>
      )}

      <PaginationFooter
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

function LockerRow({
  locker,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onUnassign,
  onLogTransaction,
}: {
  locker: DemoLockerAssignment;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onUnassign: () => void;
  onLogTransaction: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, onCloseMenu]);

  return (
    <div className="grid grid-cols-[1.6fr_1fr_140px_60px] gap-2.5 items-center px-[18px] py-2.5 border-b border-cream-dark">
      <button className="flex items-center gap-2.5 border-0 bg-transparent p-0 py-1.5 text-left min-h-12 hover:opacity-75">
        <Avatar initials={locker.clientInitials} size="md" />
        <span className="flex flex-col leading-[1.25]">
          <span className="text-[14.5px] font-bold text-teal underline decoration-teal/30">
            {locker.clientName}
          </span>
          {locker.clientAlias && (
            <span className="text-xs text-text-secondary">
              Alias: {locker.clientAlias}
            </span>
          )}
        </span>
      </button>
      <span className="text-[13.5px] text-text-secondary">
        {locker.since}
      </span>
      <span className="font-heading font-semibold text-[22px] text-teal">
        {locker.lockerNumber}
      </span>
      <div className="relative" ref={menuRef}>
        <button
          onClick={onToggleMenu}
          className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-text-secondary text-lg font-bold hover:bg-cream-dark flex items-center justify-center"
          aria-label="Actions"
        >
          &middot;&middot;&middot;
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-[42px] z-50 bg-white rounded-[10px] shadow-[0_8px_24px_rgba(9,51,68,.15)] border border-cream-border min-w-[220px] py-1.5 animate-[modalIn_.12s_ease]">
            <button
              onClick={onUnassign}
              className="w-full text-left px-4 py-2.5 text-[14px] text-text hover:bg-cream-dark border-0 bg-transparent"
            >
              Unassign
            </button>
            <button
              onClick={onLogTransaction}
              className="w-full text-left px-4 py-2.5 text-[14px] text-text hover:bg-cream-dark border-0 bg-transparent"
            >
              Log service transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WaitingTab({
  data,
  searchQ,
  setSearchQ,
  page,
  setPage,
  onAssign,
  onRemove,
  onAddToWaitlist,
}: {
  data: DemoLockerWaitlist[];
  searchQ: string;
  setSearchQ: (q: string) => void;
  page: number;
  setPage: (p: number | ((p: number) => number)) => void;
  onAssign: (wl: DemoLockerWaitlist) => void;
  onRemove: (wl: DemoLockerWaitlist) => void;
  onAddToWaitlist: () => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQ.trim()) return data;
    const q = searchQ.toLowerCase();
    return data.filter(
      (l) =>
        l.clientName.toLowerCase().includes(q) ||
        l.clientInitials.toLowerCase().includes(q)
    );
  }, [searchQ, data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  return (
    <>
    <div className="flex justify-end mb-3">
      <button
        onClick={onAddToWaitlist}
        className="min-h-[40px] px-5 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark"
      >
        + Add to waitlist
      </button>
    </div>
    <div className="bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)] overflow-hidden">
      <div className="grid grid-cols-[1.6fr_1fr_140px_100px_60px] gap-2.5 items-center bg-teal text-cream px-[18px] py-3 font-heading text-xs tracking-[.08em] uppercase rounded-t-card">
        <span className="flex items-center gap-2.5">
          Client
          <SearchInput
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search"
            className="w-[180px] text-text !text-xs !min-h-[32px] !py-1 !px-2.5 !rounded-[6px] !border-cream/30 !bg-white/15 placeholder:!text-cream/60 !text-cream"
          />
        </span>
        <span>Requested</span>
        <span>Next locker</span>
        <span />
        <span />
      </div>

      {rows.map((wl) => (
        <div
          key={wl.id}
          className="grid grid-cols-[1.6fr_1fr_140px_100px_60px] gap-2.5 items-center px-[18px] py-2.5 border-b border-cream-dark"
        >
          <span className="flex items-center gap-2.5 py-1.5">
            <Avatar initials={wl.clientInitials} size="md" />
            <span className="text-[14.5px] font-bold text-text">
              {wl.clientName}
            </span>
          </span>
          <span className="text-[13.5px] text-text-secondary">
            {wl.since}
          </span>
          <span className="font-heading font-semibold text-[18px] text-teal">
            #{wl.nextLocker}
          </span>
          <button
            onClick={() => onAssign(wl)}
            className="min-h-[36px] px-3 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark"
          >
            Assign
          </button>
          <button
            onClick={() => onRemove(wl)}
            className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-red text-lg font-bold hover:bg-red/10 flex items-center justify-center"
            aria-label={`Remove ${wl.clientName} from waitlist`}
          >
            &times;
          </button>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="px-[18px] py-8 text-center text-sm text-text-secondary">
          No waitlist entries match &ldquo;{searchQ}&rdquo;
        </div>
      )}

      <PaginationFooter
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
    </>
  );
}

function PaginationFooter({
  rangeStart,
  rangeEnd,
  total,
  page,
  totalPages,
  setPage,
}: {
  rangeStart: number;
  rangeEnd: number;
  total: number;
  page: number;
  totalPages: number;
  setPage: (p: number | ((p: number) => number)) => void;
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-[18px] py-3 bg-cream-faint border-t border-cream-dark">
      <span className="text-[12.5px] text-text-secondary">
        Showing {rangeStart}–{rangeEnd} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage((p: number) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="h-8 px-2.5 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-medium hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default flex items-center gap-1"
        >
          &lsaquo; Previous
        </button>
        {pageNumbers.map((pn, i) =>
          pn === "..." ? (
            <span key={`e${i}`} className="px-1 text-text-secondary text-sm">
              &hellip;
            </span>
          ) : (
            <button
              key={pn}
              onClick={() => setPage(pn as number)}
              className={cn(
                "w-8 h-8 rounded-button text-sm font-medium",
                page === pn
                  ? "bg-teal text-cream border-0"
                  : "border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
              )}
            >
              {(pn as number) + 1}
            </button>
          )
        )}
        <button
          onClick={() => setPage((p: number) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="h-8 px-2.5 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-medium hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default flex items-center gap-1"
        >
          Next &rsaquo;
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): Array<number | "..."> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: Array<number | "..."> = [];
  pages.push(0);
  if (current > 2) pages.push("...");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 3) pages.push("...");
  pages.push(total - 1);
  return pages;
}
