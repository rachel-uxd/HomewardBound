"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    firstName: string;
    lastName: string;
    alias: string;
    yob: string;
    pronouns: string;
  }) => void;
}

const PRONOUN_OPTIONS = ["he/him", "she/her", "they/them", "other"];

export function NewClientModal({ open, onClose, onSave }: NewClientModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [yob, setYob] = useState("");
  const [pronouns, setPronouns] = useState("");

  const canSave = firstName.trim() && lastName.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({ firstName: firstName.trim(), lastName: lastName.trim(), alias: alias.trim(), yob: yob.trim(), pronouns });
    setFirstName("");
    setLastName("");
    setAlias("");
    setYob("");
    setPronouns("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New client" subtitle="Create a new client record.">
      <div className="grid grid-cols-2 gap-3.5">
        <TextInput label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" autoFocus />
        <TextInput label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last initial or full" />
      </div>
      <TextInput label="Alias / nickname" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Optional" />
      <TextInput label="Year of birth" value={yob} onChange={(e) => setYob(e.target.value)} placeholder="e.g. 1985" type="number" />
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-teal">Pronouns</span>
        <div className="flex gap-2 flex-wrap">
          {PRONOUN_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPronouns(pronouns === p ? "" : p)}
              className={`px-3.5 py-[9px] rounded-pill text-[13.5px] font-medium border-[1.5px] ${
                pronouns === p
                  ? "border-teal bg-teal text-cream"
                  : "border-cream-border bg-white text-text hover:border-teal"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave} className="flex-1">
          Create record
        </Button>
      </div>
    </Modal>
  );
}
