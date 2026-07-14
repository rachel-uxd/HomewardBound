"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { DEMO_MAIL, TODAY_LABEL } from "@/lib/demo-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { MailPickupModal } from "@/components/modals/MailPickupModal";
import { NewRecipientModal } from "@/components/modals/NewRecipientModal";

const PAGE_SIZE = 50;

export function MailroomScreen() {
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [newRecipientOpen, setNewRecipientOpen] = useState(false);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"All" | "Letter" | "Package">("All");

  const heldMail = useMemo(() => DEMO_MAIL.filter((m) => m.status === "held"), []);

  const filtered = useMemo(() => {
    let items = heldMail;
    if (typeFilter !== "All") {
      items = items.filter((m) => m.type === typeFilter);
    }
    if (!searchQ.trim()) return items;
    const q = searchQ.toLowerCase();
    return items.filter(
      (m) =>
        m.recipientName.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.parcelId.includes(q)
    );
  }, [heldMail, searchQ, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = filtered.length > 0 ? page * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-[60px] max-w-[1240px] w-full box-border mx-auto">
      <PageHeader dateLabel={TODAY_LABEL} title="Mailroom">
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-text-secondary">
            <span className="font-bold text-text">{heldMail.length.toLocaleString()}</span> pieces on hand
          </span>
        </div>
        <button
          onClick={() => setNewRecipientOpen(true)}
          className="min-h-[44px] px-5 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-[1.5px] border-cream-border bg-white text-teal hover:bg-cream-dark flex items-center gap-2"
        >
          <span className="text-base leading-none">+</span> New mail agreement
        </button>
      </PageHeader>

      {/* Search bar */}
      <div className="flex gap-3 items-center mb-4">
        <SearchInput
          value={searchQ}
          onChange={(e) => { setSearchQ(e.target.value); setPage(0); }}
          placeholder="Search recipient, sender, or parcel ID"
          className="w-[320px]"
        />
        <button
          onClick={() => setPickupOpen(true)}
          disabled={selected.size === 0}
          className="ml-auto min-h-[40px] px-5 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
        >
          Release {selected.size} to client
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)] overflow-visible">
        <div className="grid grid-cols-[40px_1.3fr_90px_1.2fr_110px_70px_100px_40px] gap-2 items-center bg-teal text-cream px-[18px] py-3 font-heading text-xs tracking-[.08em] uppercase rounded-t-card">
          <span />
          <span>Recipient</span>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as "All" | "Letter" | "Package"); setPage(0); }}
            className="bg-transparent text-cream font-heading text-xs tracking-[.08em] uppercase border-0 outline-none cursor-pointer appearance-none pr-3 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 fill=%22%23F9F2E5%22><path d=%22M0 0l5 6 5-6z%22/></svg>')] bg-no-repeat bg-[right_center]"
          >
            <option value="All" className="text-text bg-white">Type</option>
            <option value="Letter" className="text-text bg-white">Letter</option>
            <option value="Package" className="text-text bg-white">Package</option>
          </select>
          <span>Sender</span>
          <span>Date received</span>
          <span>Bin</span>
          <span>Parcel ID</span>
          <span />
        </div>
        {rows.map((mr) => (
          <MailRow
            key={mr.id}
            item={mr}
            isChecked={selected.has(mr.id)}
            onToggle={() => toggleSelect(mr.id)}
            menuOpen={rowMenuId === mr.id}
            onToggleMenu={() => setRowMenuId(rowMenuId === mr.id ? null : mr.id)}
            onCloseMenu={() => setRowMenuId(null)}
            onMarkReturned={() => {
              setToast(`${mr.parcelId} marked as returned`);
              setRowMenuId(null);
            }}
          />
        ))}
        {rows.length === 0 && (
          <div className="px-[18px] py-8 text-center text-sm text-text-secondary">
            No mail matches this search.
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-[18px] py-3 bg-cream-faint border-t border-cream-dark">
            <span className="text-[12.5px] text-text-secondary">
              Showing {rangeStart.toLocaleString()}&ndash;{rangeEnd.toLocaleString()} of {filtered.length.toLocaleString()} items
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 px-2.5 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-medium hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default flex items-center gap-1"
              >
                &lsaquo; Previous
              </button>
              {getPageNumbers(page, totalPages).map((pn, i) =>
                pn === "..." ? (
                  <span key={`e${i}`} className="px-1 text-text-secondary text-sm">&hellip;</span>
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
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-8 px-2.5 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-medium hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default flex items-center gap-1"
              >
                Next &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>

      <MailPickupModal
        open={pickupOpen}
        onClose={() => { setPickupOpen(false); setSelected(new Set()); }}
        onSave={(client, items) => {
          setPickupOpen(false);
          setToast(`Transaction logged — ${client.name}, AHOPE ${client.ahopeNumber}`);
          setSelected(new Set());
        }}
        preselectedIds={selected}
      />

      <NewRecipientModal
        open={newRecipientOpen}
        onClose={() => setNewRecipientOpen(false)}
        onSave={(client) => {
          setNewRecipientOpen(false);
          setToast(`New mail recipient added — ${client.name}, AHOPE ${client.ahopeNumber}`);
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function MailRow({
  item,
  isChecked,
  onToggle,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onMarkReturned,
}: {
  item: typeof DEMO_MAIL[number];
  isChecked: boolean;
  onToggle: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onMarkReturned: () => void;
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
    <div
      className={cn(
        "grid grid-cols-[40px_1.3fr_90px_1.2fr_110px_70px_100px_40px] gap-2 items-center px-[18px] py-3 border-b border-cream-dark min-h-[52px]",
        isChecked ? "bg-cream" : "bg-white"
      )}
    >
      <span className="flex items-center">
        <button
          onClick={onToggle}
          aria-label="Select row"
          className={cn(
            "w-[26px] h-[26px] border-2 rounded-[6px] inline-flex items-center justify-center p-0",
            isChecked
              ? "border-teal bg-teal"
              : "border-cream-muted bg-transparent hover:border-teal"
          )}
        >
          {isChecked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-cream)" strokeWidth="3.4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </span>
      <span className="text-[14px] font-bold text-text">{item.recipientName}</span>
      <span className="text-[13px] text-text-secondary">{item.type}</span>
      <span className="text-[13px] text-text">{item.from}</span>
      <span className="text-[13px] text-text-secondary">{item.date}</span>
      <span className="text-[13px] font-heading font-semibold text-teal">{item.bin}</span>
      <span className="text-[12px] text-text-secondary font-mono">{item.parcelId}</span>
      <div className="relative" ref={menuRef}>
        <button
          onClick={onToggleMenu}
          className="w-8 h-8 rounded-button border-[1.5px] border-cream-border bg-white text-text-secondary text-sm font-bold hover:bg-cream-dark flex items-center justify-center"
          aria-label="Actions"
        >
          &middot;&middot;&middot;
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-[36px] z-50 bg-white rounded-[10px] shadow-[0_8px_24px_rgba(9,51,68,.15)] border border-cream-border min-w-[180px] py-1.5 animate-[modalIn_.12s_ease]">
            <button
              onClick={onMarkReturned}
              className="w-full text-left px-4 py-2.5 text-[14px] text-text hover:bg-cream-dark border-0 bg-transparent"
            >
              Mark as returned
            </button>
          </div>
        )}
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
