"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import { DEMO_CLIENTS, type DemoClient } from "@/lib/demo-data";

interface ClientPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (client: DemoClient) => void;
  title?: string;
  subtitle?: string;
  filterCheckedIn?: boolean;
}

export function ClientPickerModal({
  open,
  onClose,
  onSelect,
  title = "Select client",
  subtitle = "Search or pick a client.",
  filterCheckedIn,
}: ClientPickerModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = DEMO_CLIENTS;
    if (filterCheckedIn) {
      list = list.filter((c) => c.checkedIn);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.alias?.toLowerCase().includes(q) ||
          c.ahopeNumber.toLowerCase().includes(q) ||
          c.yob?.toString().includes(q)
      );
    }
    return list;
  }, [search, filterCheckedIn]);

  const handleSelect = (client: DemoClient) => {
    onSelect(client);
    setSearch("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, alias, YOB, AHOPE #"
        autoFocus
      />
      <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto -mx-1 px-1">
        {filtered.map((cl) => (
          <button
            key={cl.id}
            onClick={() => handleSelect(cl)}
            className="flex items-center gap-3 w-full text-left px-3.5 py-3 rounded-[10px] border-[1.5px] border-cream-border bg-white hover:border-teal hover:bg-teal/[.03]"
          >
            <Avatar initials={cl.initials} size="md" />
            <div className="flex flex-col leading-[1.3] flex-1 min-w-0">
              <span className="text-[14.5px] font-bold text-text whitespace-nowrap overflow-hidden text-ellipsis">
                {cl.name}
              </span>
              <span className="text-[12px] text-text-secondary">
                {cl.ahopeNumber}
                {cl.alias ? ` · "${cl.alias}"` : ""}
                {cl.yob ? ` · ${cl.yob}` : ""}
              </span>
            </div>
            {cl.checkedIn && (
              <span className="text-[11px] font-bold text-green bg-green/12 rounded-pill px-2.5 py-[3px]">
                Here
              </span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-text-secondary">
            No clients match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </Modal>
  );
}
