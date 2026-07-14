"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

interface NoteEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  title: string;
  subtitle?: string;
  placeholder?: string;
  saveLabel?: string;
}

export function NoteEntryModal({
  open,
  onClose,
  onSave,
  title,
  subtitle,
  placeholder = "Type here...",
  saveLabel = "Save",
}: NoteEntryModalProps) {
  const [text, setText] = useState("");

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    setText("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle}>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={4}
        autoFocus
      />
      <div className="flex gap-3 pt-1">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!text.trim()} className="flex-1">
          {saveLabel}
        </Button>
      </div>
    </Modal>
  );
}
