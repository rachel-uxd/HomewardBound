"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";
import {
  DEMO_CLIENTS,
  DEMO_MAIL,
  type DemoClient,
  type DemoMailItem,
  type DemoProxyPickup,
} from "@/lib/demo-data";

interface MailPickupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: DemoClient, selectedItems: DemoMailItem[]) => void;
  preselectedIds?: Set<string>;
}

export function MailPickupModal({
  open,
  onClose,
  onSave,
  preselectedIds,
}: MailPickupModalProps) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);
  const initialPreselected = useRef<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [agreementAdded, setAgreementAdded] = useState(false);

  const [releaseableMail, setReleaseableMail] = useState<DemoMailItem[]>([]);

  useEffect(() => {
    if (open) {
      const ids = new Set(preselectedIds);
      initialPreselected.current = ids;
      setSelectedItems(ids);
      setSelectedClient(null);
      setSearch("");
      setAgreementAdded(false);
      setReleaseableMail(
        DEMO_MAIL.filter((m) => m.status === "held" && ids.has(m.id))
      );
    }
  }, [open, preselectedIds]);

  const clientResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return DEMO_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alias?.toLowerCase().includes(q) ||
        c.ahopeNumber.toLowerCase().includes(q) ||
        c.hmisNumber.includes(q)
    ).slice(0, 8);
  }, [search]);

  const handleSelectClient = (client: DemoClient) => {
    setSelectedClient(client);
    setSearch("");
  };

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!selectedClient) return;
    const items = DEMO_MAIL.filter((m) => selectedItems.has(m.id));
    onSave(selectedClient, items);
    handleClose();
  };

  const handleClose = () => {
    setSearch("");
    setSelectedClient(null);
    setSelectedItems(new Set());
    setAgreementAdded(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Mail pick-up"
      subtitle="Log a client service transaction"
      className="!w-[620px]"
    >
      {/* Client search */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Client picking up mail
        </label>
        {selectedClient ? (
          <ClientCard
            client={selectedClient}
            onClear={() => { setSelectedClient(null); setAgreementAdded(false); }}
            agreementAdded={agreementAdded}
            onAgreementAdded={() => setAgreementAdded(true)}
          />
        ) : (
          <>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients"
              autoFocus
            />
            {clientResults.length > 0 && (
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                {clientResults.map((cl) => (
                  <button
                    key={cl.id}
                    onClick={() => handleSelectClient(cl)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[8px] border border-cream-border bg-white hover:border-teal hover:bg-teal/[.03]"
                  >
                    <Avatar initials={cl.initials} size="sm" />
                    <div className="flex flex-col leading-[1.3] flex-1 min-w-0">
                      <span className="text-[13.5px] font-bold text-text">
                        {cl.name}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        {cl.ahopeNumber}
                        {cl.alias ? ` · "${cl.alias}"` : ""}
                        {cl.yob ? ` · ${cl.yob}` : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected mail items */}
      {selectedClient && releaseableMail.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
            Mail to release ({selectedItems.size} selected)
          </span>
          <div className="border border-cream-border rounded-[10px] overflow-hidden max-h-[200px] overflow-y-auto">
            {releaseableMail.map((m) => {
              const checked = selectedItems.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleItem(m.id)}
                  className={cn(
                    "flex items-center gap-3 w-full text-left px-3.5 py-2.5 border-b border-cream-dark last:border-0",
                    checked ? "bg-cream" : "bg-white hover:bg-cream-faint"
                  )}
                >
                  <span
                    className={cn(
                      "w-[22px] h-[22px] border-2 rounded-[5px] inline-flex items-center justify-center flex-shrink-0",
                      checked
                        ? "border-teal bg-teal"
                        : "border-cream-muted bg-transparent"
                    )}
                  >
                    {checked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-cream)" strokeWidth="3.4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[13px] font-bold text-text min-w-0 truncate">
                    {m.recipientName}
                  </span>
                  <span className="text-[12px] text-text-secondary">{m.type}</span>
                  <span className="text-[12px] text-text-secondary">{m.from}</span>
                  <span className="text-[12px] text-text-secondary">{m.date}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedClient && releaseableMail.length === 0 && (
        <div className="py-4 text-center text-sm text-text-secondary border border-cream-border rounded-[10px]">
          No mail selected. Select items from the mailroom table first.
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleClose}
          className="min-h-[40px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!selectedClient || selectedItems.size === 0 || (!selectedClient.hasMailAgreement && !agreementAdded)}
          className="min-h-[40px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function ClientCard({
  client,
  onClear,
  agreementAdded,
  onAgreementAdded,
}: {
  client: DemoClient;
  onClear: () => void;
  agreementAdded: boolean;
  onAgreementAdded: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [signed, setSigned] = useState(false);

  const hasAgreement = client.hasMailAgreement || agreementAdded;

  const handleConfirmAgreement = () => {
    onAgreementAdded();
    setShowAddForm(false);
  };

  return (
    <div className="border border-cream-border rounded-[10px] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={client.initials} size="md" />
          <div className="flex flex-col leading-[1.3]">
            <span className="text-[15px] font-bold text-text">
              Name: {client.name}
            </span>
            <span className="text-[12px] text-text-secondary">
              {client.alias ? `Alias: ${client.alias} · ` : ""}
              YOB: {client.yob} · HMIS #: {client.hmisNumber}
            </span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="w-8 h-8 border-0 rounded-button bg-cream-dark text-text-secondary text-sm hover:bg-cream-border flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      {/* Mail agreement status */}
      {hasAgreement ? (
        <div className="flex items-center gap-2 text-[13px]">
          <span className="w-5 h-5 rounded-full bg-green/15 text-green flex items-center justify-center text-xs font-bold">✓</span>
          <span className="font-semibold text-green">Mail pickup agreement on file</span>
        </div>
      ) : showAddForm ? (
        <div className="bg-cream-faint border border-cream-border rounded-[8px] p-3.5 flex flex-col gap-3">
          <span className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
            Add mail pick-up agreement
          </span>
          <div className="border-[1.5px] border-dashed border-cream-border rounded-[10px] p-3 flex items-center gap-4">
            <button
              onClick={() => setUploaded(true)}
              className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[8px] border border-cream-border bg-white hover:bg-cream-faint text-center min-w-[90px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-[11px] text-text-secondary font-semibold">Take photo</span>
            </button>
            <button
              onClick={() => setUploaded(true)}
              className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[8px] border border-cream-border bg-white hover:bg-cream-faint text-center min-w-[90px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-[11px] text-text-secondary font-semibold">Upload file</span>
            </button>
            {uploaded && (
              <div className="flex items-center gap-2 text-[12px] text-green font-semibold">
                <span className="w-4 h-4 rounded-full bg-green/15 text-green flex items-center justify-center text-[10px] font-bold">✓</span>
                Uploaded
              </div>
            )}
          </div>
          <button
            onClick={() => setSigned(!signed)}
            className="flex items-center gap-2.5 text-left bg-transparent border-0 p-0 cursor-pointer"
          >
            <span
              className={cn(
                "w-[20px] h-[20px] border-2 rounded-[5px] inline-flex items-center justify-center flex-shrink-0",
                signed ? "border-teal bg-teal" : "border-cream-muted bg-transparent"
              )}
            >
              {signed && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-cream)" strokeWidth="3.4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="text-[13px] text-text">Client signed the mail pick up agreement</span>
          </button>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAddForm(false); setUploaded(false); setSigned(false); }}
              className="min-h-[34px] px-4 text-xs rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAgreement}
              disabled={!signed}
              className="min-h-[34px] px-4 text-xs rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red/8 border border-red/20 rounded-[8px] px-3.5 py-2.5 flex items-start gap-3">
          <div className="text-[13px] text-red leading-[1.5] flex-1">
            This client doesn&apos;t have a mail agreement on file. To release mail or packages, AHOPE must have a signed agreement on file.
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-shrink-0 min-h-[32px] px-3.5 text-[11px] rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-red/30 bg-white text-red hover:bg-red/5"
          >
            Add agreement
          </button>
        </div>
      )}

      {/* Proxy relationships */}
      <div className="grid grid-cols-2 gap-3">
        <ProxySection
          label="This client can pick up mail for"
          proxies={client.canPickUpFor}
        />
        <ProxySection
          label="Can pick up this client's mail"
          proxies={client.canBePickedUpBy}
        />
      </div>
    </div>
  );
}

function ProxySection({
  label,
  proxies,
}: {
  label: string;
  proxies: DemoProxyPickup[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-heading font-semibold uppercase tracking-[.06em] text-text-secondary">
        {label}
      </span>
      {proxies.length > 0 ? (
        <div className="flex flex-col gap-1">
          {proxies.map((p) => (
            <div
              key={p.clientId}
              className="bg-cream-faint border border-cream-border rounded-[6px] px-2.5 py-1.5 text-[11.5px] leading-[1.4]"
            >
              <span className="font-bold text-text">{p.clientName}</span>
              <br />
              <span className="text-text-secondary">
                {p.clientAlias ? `Alias: ${p.clientAlias} · ` : ""}
                YOB: {p.yob} · HMIS: {p.hmisNumber}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-[12px] text-text-secondary italic">
          No other pick-up agreements on file
        </span>
      )}
    </div>
  );
}
