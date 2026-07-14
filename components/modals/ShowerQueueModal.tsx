"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ShowerQueueChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (queue: "women" | "men") => void;
  clientName: string;
}

export function ShowerQueueChoiceModal({
  open,
  onClose,
  onSelect,
  clientName,
}: ShowerQueueChoiceModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add to shower queue" subtitle={`Which queue for ${clientName}?`}>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <button
          onClick={() => { onSelect("women"); onClose(); }}
          className="flex flex-col items-center gap-3 p-6 rounded-card border-[1.5px] border-cream-border bg-white hover:border-teal hover:bg-teal/[.04] group"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="1.6" className="group-hover:scale-110 transition-transform">
            <circle cx="12" cy="5" r="3" />
            <path d="M12 8v4m-4 8l2.5-8h3L16 20M8 13h8" />
          </svg>
          <span className="font-heading font-semibold text-lg uppercase text-teal">Women</span>
        </button>
        <button
          onClick={() => { onSelect("men"); onClose(); }}
          className="flex flex-col items-center gap-3 p-6 rounded-card border-[1.5px] border-cream-border bg-white hover:border-teal hover:bg-teal/[.04] group"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="1.6" className="group-hover:scale-110 transition-transform">
            <circle cx="12" cy="5" r="3" />
            <path d="M12 8v8M8 20v-4h8v4M8 13h8" />
          </svg>
          <span className="font-heading font-semibold text-lg uppercase text-teal">Men</span>
        </button>
      </div>
      <Button variant="ghost" onClick={onClose} className="w-full mt-1">
        Cancel
      </Button>
    </Modal>
  );
}

interface ShowerQueueStatusModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  onRemove: () => void;
  clientName: string;
  queue: "women" | "men";
  position: number;
  waitMinutes: number;
}

export function ShowerQueueStatusModal({
  open,
  onClose,
  onDone,
  onRemove,
  clientName,
  queue,
  position,
  waitMinutes,
}: ShowerQueueStatusModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Shower status" subtitle={clientName}>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex flex-col items-center gap-1">
          <span className="font-heading font-semibold text-[56px] text-teal leading-none">
            #{position}
          </span>
          <span className="text-sm text-text-secondary">
            in the {queue}&apos;s queue
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          Waiting for {waitMinutes} min
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="danger" onClick={() => { onRemove(); onClose(); }} className="flex-1">
          Remove
        </Button>
        <Button variant="success" onClick={() => { onDone(); onClose(); }} className="flex-1">
          Done
        </Button>
      </div>
    </Modal>
  );
}
