"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: { text: string }) => void;
  clientName: string;
  editingTask?: { text: string } | null;
}

export function TaskModal({
  open,
  onClose,
  onSave,
  clientName,
  editingTask,
}: TaskModalProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setText(editingTask?.text ?? "");
    }
  }, [open, editingTask]);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ text: text.trim() });
    setText("");
    onClose();
  };

  const isEdit = !!editingTask;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit task" : "New task"}
      subtitle={`${isEdit ? "Update" : "Add"} an action item for ${clientName}.`}
    >
      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Task
        </label>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the task or follow-up..."
          rows={3}
          autoFocus
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!text.trim()} className="flex-1">
          {isEdit ? "Update" : "Add task"}
        </Button>
      </div>
    </Modal>
  );
}
