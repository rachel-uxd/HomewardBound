"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import { DEMO_CLIENTS, type DemoClient } from "@/lib/demo-data";

interface NewRecipientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: DemoClient) => void;
}

export function NewRecipientModal({
  open,
  onClose,
  onSave,
}: NewRecipientModalProps) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<DemoClient | null>(null);
  const [agreementFile, setAgreementFile] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [proxySearch, setProxySearch] = useState("");
  const [authorizedProxies, setAuthorizedProxies] = useState<DemoClient[]>([]);

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

  const proxyResults = useMemo(() => {
    if (!proxySearch.trim()) return [];
    const q = proxySearch.toLowerCase();
    const excludeIds = new Set([
      selectedClient?.id,
      ...authorizedProxies.map((p) => p.id),
    ]);
    return DEMO_CLIENTS.filter(
      (c) =>
        !excludeIds.has(c.id) &&
        (c.name.toLowerCase().includes(q) ||
          c.alias?.toLowerCase().includes(q) ||
          c.ahopeNumber.toLowerCase().includes(q) ||
          c.hmisNumber.includes(q))
    ).slice(0, 6);
  }, [proxySearch, selectedClient?.id, authorizedProxies]);

  const handleSelectClient = (client: DemoClient) => {
    setSelectedClient(client);
    setSearch("");
  };

  const handleAddProxy = (client: DemoClient) => {
    setAuthorizedProxies((prev) => [...prev, client]);
    setProxySearch("");
  };

  const handleRemoveProxy = (clientId: string) => {
    setAuthorizedProxies((prev) => prev.filter((p) => p.id !== clientId));
  };

  const handleSave = () => {
    if (!selectedClient) return;
    onSave(selectedClient);
    handleClose();
  };

  const handleClose = () => {
    setSearch("");
    setSelectedClient(null);
    setAgreementFile(null);
    setSigned(false);
    setProxySearch("");
    setAuthorizedProxies([]);
    onClose();
  };

  const canSave = selectedClient && signed;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New mail agreement"
      subtitle="Set a new client up to receive mail"
      className="!w-[560px]"
    >
      {/* Client search */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Client
        </label>
        {selectedClient ? (
          <div className="flex items-center gap-3 px-3.5 py-3 border border-cream-border rounded-[10px] bg-cream-faint">
            <Avatar initials={selectedClient.initials} size="md" />
            <div className="flex flex-col leading-[1.3] flex-1 min-w-0">
              <span className="text-[15px] font-bold text-text">
                Name: {selectedClient.name}
              </span>
              <span className="text-[12px] text-text-secondary">
                {selectedClient.alias ? `Alias: ${selectedClient.alias} · ` : ""}
                YOB: {selectedClient.yob} · HMIS #: {selectedClient.hmisNumber}
              </span>
            </div>
            <button
              onClick={() => setSelectedClient(null)}
              className="w-8 h-8 border-0 rounded-button bg-cream-dark text-text-secondary text-sm hover:bg-cream-border flex items-center justify-center"
            >
              ✕
            </button>
          </div>
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

      {/* Mail pick-up agreement section */}
      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Mail pick-up agreement
        </label>
        {agreementFile ? (
          <div className="flex items-center gap-3 px-3.5 py-2.5 border border-cream-border rounded-[8px] bg-cream-faint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[13px] text-text flex-1">{agreementFile}</span>
            <span className="text-[11px] text-text-secondary">500kb</span>
            <button
              onClick={() => setAgreementFile(null)}
              className="text-text-secondary text-sm hover:text-red border-0 bg-transparent"
            >
              ✕
            </button>
          </div>
        ) : (
          <UploadArea
            label="Mail pick-up agreement"
            onUpload={() => setAgreementFile(`mail-agreement-${Date.now()}.pdf`)}
          />
        )}
      </div>

      {/* Signed checkbox */}
      <button
        onClick={() => setSigned(!signed)}
        className="flex items-center gap-3 text-left bg-transparent border-0 p-0 cursor-pointer"
      >
        <span
          className={`w-[22px] h-[22px] border-2 rounded-[5px] inline-flex items-center justify-center flex-shrink-0 ${
            signed
              ? "border-teal bg-teal"
              : "border-cream-muted bg-transparent"
          }`}
        >
          {signed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-cream)" strokeWidth="3.4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="text-[14px] text-text">
          Client signed the mail pick up agreement
        </span>
      </button>

      {/* Authorized pick-up */}
      {selectedClient && (
        <div className="flex flex-col gap-2 border-t border-cream-dark pt-4">
          <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
            Authorized to pick up on behalf of {selectedClient.name.split(" ")[0]}
          </label>
          <p className="text-[12.5px] text-text-secondary leading-[1.5] -mt-1">
            Add other clients who are allowed to pick up mail for this person.
          </p>

          {authorizedProxies.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {authorizedProxies.map((proxy) => (
                <div
                  key={proxy.id}
                  className="flex items-center gap-3 px-3 py-2.5 border border-cream-border rounded-[8px] bg-cream-faint"
                >
                  <Avatar initials={proxy.initials} size="sm" />
                  <div className="flex flex-col leading-[1.3] flex-1 min-w-0">
                    <span className="text-[13px] font-bold text-text">{proxy.name}</span>
                    <span className="text-[11px] text-text-secondary">
                      {proxy.ahopeNumber}
                      {proxy.alias ? ` · "${proxy.alias}"` : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveProxy(proxy.id)}
                    className="w-7 h-7 border-0 rounded-button bg-cream-dark text-text-secondary text-xs hover:bg-cream-border flex items-center justify-center flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <SearchInput
              value={proxySearch}
              onChange={(e) => setProxySearch(e.target.value)}
              placeholder="Search for a client to add"
            />
            {proxyResults.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 flex flex-col gap-1 max-h-[180px] overflow-y-auto bg-white border border-cream-border rounded-[10px] shadow-[0_8px_24px_rgba(9,51,68,.12)] p-1.5">
                {proxyResults.map((cl) => (
                  <button
                    key={cl.id}
                    onClick={() => handleAddProxy(cl)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[8px] border border-transparent bg-white hover:border-teal hover:bg-teal/[.03]"
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
          </div>
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
          disabled={!canSave}
          className="min-h-[40px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function UploadArea({
  label,
  onUpload,
}: {
  label: string;
  onUpload?: () => void;
}) {
  return (
    <div className="border-[1.5px] border-dashed border-cream-border rounded-[10px] p-4 flex items-center gap-4">
      <button
        onClick={onUpload}
        className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-[8px] border border-cream-border bg-white hover:bg-cream-faint text-center min-w-[100px]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span className="text-[11px] text-text-secondary font-semibold">Take photo</span>
        <span className="text-[10px] text-text-secondary">Use iPad camera</span>
      </button>
      <button
        onClick={onUpload}
        className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-[8px] border border-cream-border bg-white hover:bg-cream-faint text-center min-w-[100px]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[11px] text-text-secondary font-semibold">Upload file</span>
        <span className="text-[10px] text-text-secondary">Max 10 MB</span>
      </button>
    </div>
  );
}
