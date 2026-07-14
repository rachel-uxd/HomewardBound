"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

interface FlagRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (flagType: string, reason: string) => void;
  clientName: string;
}

const FLAG_TYPES = [
  { key: "safety", label: "Safety concern", color: "bg-red" },
  { key: "housing", label: "Housing referral", color: "bg-gold" },
  { key: "medical", label: "Medical alert", color: "bg-red" },
  { key: "behavioral", label: "Behavioral note", color: "bg-gold" },
  { key: "other", label: "Other", color: "bg-teal" },
];

export function FlagRecordModal({ open, onClose, onSave, clientName }: FlagRecordModalProps) {
  const [flagType, setFlagType] = useState("");
  const [reason, setReason] = useState("");

  const canSave = flagType && reason.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave(flagType, reason.trim());
    setFlagType("");
    setReason("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Flag record" subtitle={`Flag ${clientName}'s record for follow-up.`}>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-teal">Flag type</span>
        <div className="flex flex-col gap-2">
          {FLAG_TYPES.map((ft) => (
            <button
              key={ft.key}
              onClick={() => setFlagType(ft.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-button border-[1.5px] text-left text-[14.5px] font-medium ${
                flagType === ft.key
                  ? "border-teal bg-teal/[.06]"
                  : "border-cream-border bg-white hover:border-teal"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${ft.color}`} />
              {ft.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-teal">Reason</span>
        <TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the reason for this flag..."
          rows={3}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="danger" onClick={handleSave} disabled={!canSave} className="flex-1">
          Add flag
        </Button>
      </div>
    </Modal>
  );
}
