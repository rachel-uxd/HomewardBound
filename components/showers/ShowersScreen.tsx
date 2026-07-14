"use client";

import { useState } from "react";
import {
  DEMO_SHOWER_WOMEN,
  DEMO_SHOWER_MEN,
  TODAY_LABEL,
} from "@/lib/demo-data";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { ClientPickerModal } from "@/components/modals/ClientPickerModal";

function avgWait(items: Array<{ waitMinutes: number }>) {
  if (items.length === 0) return 0;
  return Math.round(
    items.reduce((s, i) => s + i.waitMinutes, 0) / items.length
  );
}

export function ShowersScreen() {
  const womenAvg = avgWait(DEMO_SHOWER_WOMEN);
  const menAvg = avgWait(DEMO_SHOWER_MEN);
  const [pickerQueue, setPickerQueue] = useState<"women" | "men" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-[60px] max-w-[1240px] w-full box-border mx-auto">
      <PageHeader dateLabel={TODAY_LABEL} title="Showers">
        <StatCard
          value={DEMO_SHOWER_WOMEN.length}
          label={`Women · avg wait ${womenAvg} min`}
          className="min-w-[170px]"
        />
        <StatCard
          value={DEMO_SHOWER_MEN.length}
          label={`Men · avg wait ${menAvg} min`}
          className="min-w-[170px]"
        />
      </PageHeader>

      <div className="grid grid-cols-2 gap-6 items-start">
        <QueueColumn
          title="Women"
          items={DEMO_SHOWER_WOMEN}
          onAdd={() => setPickerQueue("women")}
        />
        <QueueColumn
          title="Men"
          items={DEMO_SHOWER_MEN}
          onAdd={() => setPickerQueue("men")}
        />
      </div>

      <ClientPickerModal
        open={pickerQueue !== null}
        onClose={() => setPickerQueue(null)}
        onSelect={(client) => setToast(`${client.name} added to ${pickerQueue}'s shower queue`)}
        title={`Add to ${pickerQueue}'s queue`}
        subtitle="Select a checked-in client."
        filterCheckedIn
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function QueueColumn({
  title,
  items,
  onAdd,
}: {
  title: string;
  items: Array<{
    id: string;
    name: string;
    ahopeNumber: string;
    position: number;
    waitMinutes: number;
  }>;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-heading font-semibold text-2xl uppercase text-teal">
          {title}
        </span>
        <Button onClick={onAdd} className="min-h-[46px] px-[18px] text-[13px]">
          + Add to queue
        </Button>
      </div>
      {items.map((qr) => (
        <div
          key={qr.id}
          className="bg-white rounded-[12px] shadow-[0_1px_3px_rgba(9,51,68,.09)] px-4 py-3 flex items-center gap-3.5"
        >
          <span className="font-heading font-semibold text-[26px] text-gold w-8 text-center">
            {qr.position}
          </span>
          <span className="flex flex-col leading-[1.3] flex-1 min-w-0">
            <span className="text-[15px] font-bold text-text">{qr.name}</span>
            <span className="text-xs text-text-secondary">
              AHOPE # {qr.ahopeNumber}
            </span>
          </span>
          <span className="text-[12.5px] text-text-secondary text-right leading-[1.3]">
            Waiting for
            <br />
            <strong className="text-text text-sm">{qr.waitMinutes} min</strong>
          </span>
          <Button variant="success" size="sm" className="min-h-[46px] text-xs">
            Done
          </Button>
          <button className="min-h-[46px] w-[46px] border-[1.5px] border-red/40 rounded-button bg-transparent text-red text-lg leading-none hover:bg-red/[.08]">
            ✕
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <div className="bg-cream-dark rounded-[12px] px-[22px] py-[22px] text-center text-sm text-text-secondary italic">
          Queue is empty
        </div>
      )}
    </div>
  );
}
