"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface LockerHasModalProps {
  open: boolean;
  onClose: () => void;
  onRelease: () => void;
  clientName: string;
  lockerNumber: number;
}

export function LockerHasModal({
  open,
  onClose,
  onRelease,
  clientName,
  lockerNumber,
}: LockerHasModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Locker" subtitle={`${clientName}'s locker assignment.`}>
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-[88px] h-[88px] rounded-card bg-teal/[.08] flex items-center justify-center">
          <span className="font-heading font-semibold text-[40px] text-teal">
            #{lockerNumber}
          </span>
        </div>
        <span className="text-sm text-text-secondary">Currently assigned</span>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button variant="danger" onClick={() => { onRelease(); onClose(); }} className="flex-1">
          Release locker
        </Button>
      </div>
    </Modal>
  );
}

interface LockerNoneModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: () => void;
  onWaitlist: () => void;
  clientName: string;
  nextAvailable?: number;
}

export function LockerNoneModal({
  open,
  onClose,
  onAssign,
  onWaitlist,
  clientName,
  nextAvailable,
}: LockerNoneModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Locker" subtitle={`${clientName} has no locker assigned.`}>
      <div className="flex flex-col gap-3 pt-1">
        {nextAvailable ? (
          <button
            onClick={() => { onAssign(); onClose(); }}
            className="flex items-center gap-4 px-5 py-4 rounded-card border-[1.5px] border-cream-border bg-white hover:border-teal text-left"
          >
            <div className="w-[52px] h-[52px] rounded-[10px] bg-teal/[.08] flex items-center justify-center flex-shrink-0">
              <span className="font-heading font-semibold text-xl text-teal">
                #{nextAvailable}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-semibold text-[15px] uppercase text-teal">
                Assign locker #{nextAvailable}
              </span>
              <span className="text-[13px] text-text-secondary">
                Next available locker
              </span>
            </div>
          </button>
        ) : (
          <div className="px-5 py-4 rounded-card border-[1.5px] border-cream-border bg-cream-dark text-center">
            <span className="text-sm text-text-secondary">No lockers currently available</span>
          </div>
        )}
        <button
          onClick={() => { onWaitlist(); onClose(); }}
          className="flex items-center gap-4 px-5 py-4 rounded-card border-[1.5px] border-cream-border bg-white hover:border-teal text-left"
        >
          <div className="w-[52px] h-[52px] rounded-[10px] bg-gold/15 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading font-semibold text-[15px] uppercase text-teal">
              Add to waitlist
            </span>
            <span className="text-[13px] text-text-secondary">
              Will be assigned when one opens up
            </span>
          </div>
        </button>
      </div>
      <Button variant="ghost" onClick={onClose} className="w-full mt-1">
        Cancel
      </Button>
    </Modal>
  );
}
