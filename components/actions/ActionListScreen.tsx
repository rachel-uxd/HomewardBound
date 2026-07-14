"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import {
  DEMO_ACTION_ITEMS,
  DEMO_CLIENTS,
  TODAY_LABEL,
} from "@/lib/demo-data";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/StatCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";


const PAGE_SIZE = 25;

export function ActionListScreen() {
  const [filter, setFilter] = useState<"here" | "all">("here");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const hereCount = useMemo(() => DEMO_CLIENTS.filter((c) => c.checkedIn).length, []);
  const openCount = useMemo(
    () => DEMO_ACTION_ITEMS.filter((a) => a.status !== "done" && !completedIds.has(a.id) && !deletedIds.has(a.id)).length,
    [completedIds, deletedIds]
  );

  const filtered = useMemo(() => {
    let items = DEMO_ACTION_ITEMS.filter(
      (a) => a.status !== "done" && !completedIds.has(a.id) && !deletedIds.has(a.id)
    );
    if (filter === "here") {
      items = [...items].sort((a, b) => {
        if (a.isHereToday && !b.isHereToday) return -1;
        if (!a.isHereToday && b.isHereToday) return 1;
        return 0;
      });
    }
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      items = items.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) ||
          a.task.toLowerCase().includes(q) ||
          a.clientAlias?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [filter, searchQ, completedIds, deletedIds]);

  const handleMarkDone = (item: (typeof DEMO_ACTION_ITEMS)[number]) => {
    setCompletedIds((prev) => new Set(prev).add(item.id));
    setMenuOpen(null);
    setToast(`Done — ${item.task} for ${item.clientName}`);
  };

  const handleDelete = (item: (typeof DEMO_ACTION_ITEMS)[number]) => {
    setDeletedIds((prev) => new Set(prev).add(item.id));
    setMenuOpen(null);
    setToast(`Task removed for ${item.clientName}`);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-[60px] max-w-[1240px] w-full box-border mx-auto">
      <PageHeader dateLabel={TODAY_LABEL} title="Action list">
        <StatCard value={openCount} label="Open requests & alerts" />
        <StatCard value={hereCount} label="Clients checked in" />
      </PageHeader>

      <div className="flex gap-[18px] items-center flex-wrap mb-3.5">
        <SearchInput
          value={searchQ}
          onChange={(e) => { setSearchQ(e.target.value); setPage(0); }}
          placeholder="Search client or task"
          className="w-[260px]"
        />
        <div className="flex gap-1.5">
          <FilterChip
            label="Here today first"
            active={filter === "here"}
            onClick={() => { setFilter("here"); setPage(0); }}
            pill
          />
          <FilterChip
            label="All open"
            active={filter === "all"}
            onClick={() => { setFilter("all"); setPage(0); }}
            pill
          />
        </div>
      </div>

      <div className="bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)]">
        {/* Header */}
        <div className="grid grid-cols-[1.4fr_1.2fr_150px_48px] gap-2.5 items-center bg-teal text-cream px-[18px] py-3 font-heading text-xs tracking-[.08em] uppercase rounded-t-card">
          <span>Client</span>
          <span>Task</span>
          <span>Last checked-in</span>
          <span />
        </div>
        {/* Rows */}
        {rows.map((ar) => (
            <div
              key={ar.id}
              className={cn(
                "grid grid-cols-[1.4fr_1.2fr_150px_48px] gap-2.5 items-center px-[18px] py-2.5 border-b border-cream-dark",
                ar.isHereToday ? "bg-white" : "bg-cream-faint"
              )}
            >
              <button className="flex items-center gap-2.5 border-0 bg-transparent p-0 py-1.5 text-left min-h-12 hover:opacity-75">
                <Avatar initials={ar.clientInitials} size="md" />
                <span className="flex flex-col leading-[1.25]">
                  <span className="text-[14.5px] font-bold text-teal underline decoration-teal/30">
                    {ar.clientName}
                  </span>
                  {ar.clientAlias && (
                    <span className="text-xs text-text-secondary">
                      &ldquo;{ar.clientAlias}&rdquo;
                    </span>
                  )}
                </span>
              </button>
              <span className="text-sm text-text">{ar.task}</span>
              <span
                className={cn(
                  "text-[13.5px]",
                  ar.isHereToday
                    ? "text-green font-bold"
                    : "text-text-secondary font-normal"
                )}
              >
                {ar.lastCheckedIn}
              </span>
              <TaskRowMenu
                isOpen={menuOpen === ar.id}
                onToggle={() => setMenuOpen(menuOpen === ar.id ? null : ar.id)}
                onClose={() => setMenuOpen(null)}
                onMarkDone={() => handleMarkDone(ar)}
                onDelete={() => handleDelete(ar)}
              />
            </div>
        ))}

        {rows.length === 0 && (
          <div className="px-[18px] py-8 text-center text-sm text-text-secondary">
            No action items match these filters.
          </div>
        )}

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-[18px] py-3 bg-cream-faint border-t border-cream-dark">
          <span className="text-[12.5px] text-text-secondary">
            Showing {rangeStart}–{rangeEnd} of {filtered.length} items
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-bold hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default"
            >
              &lsaquo;
            </button>
            <span className="text-[13px] font-medium text-text min-w-[80px] text-center">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-bold hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function TaskRowMenu({
  isOpen,
  onToggle,
  onClose,
  onMarkDone,
  onEdit,
  onDelete,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkDone: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        onClick={onToggle}
        className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-text-secondary text-sm font-bold hover:bg-cream-dark flex items-center justify-center"
        aria-label="Task actions"
      >
        &middot;&middot;&middot;
      </button>
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[160px] bg-white border border-cream-border rounded-[10px] shadow-[0_8px_24px_rgba(9,51,68,.12)] py-1">
          <button
            onClick={onMarkDone}
            className="w-full text-left px-4 py-2.5 text-[13.5px] text-text hover:bg-cream-faint border-0 bg-transparent flex items-center gap-2.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark as done
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full text-left px-4 py-2.5 text-[13.5px] text-text hover:bg-cream-faint border-0 bg-transparent flex items-center gap-2.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2.5 text-[13.5px] text-red hover:bg-red/5 border-0 bg-transparent flex items-center gap-2.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
