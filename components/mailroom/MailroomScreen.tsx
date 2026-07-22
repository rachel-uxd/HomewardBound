"use client";

import { useState, useMemo, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/providers/AuthProvider";
import { ROLE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { TODAY_LABEL } from "@/lib/demo-data";
import {
  createInitialClients,
  genId,
  genAhopeNumber,
  getInitials,
  type MailClient,
  type MailProxy,
  type MailPickup,
} from "./mailroom-data";

type Filter = "all" | "expired";

const ROW_GRID = "grid grid-cols-[1.6fr_200px_220px] gap-2.5 items-center";
const PAGE_SIZE = 20;
const TODAY_DATE = "Jul 22, 2026";
const NEXT_YEAR_DATE = "Jul 22, 2027";

function nowTime(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function MailroomScreen() {
  const { user } = useAuth();
  const [clients, setClients] = useState<MailClient[]>(createInitialClients);
  const [searchQ, setSearchQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const [detailClientId, setDetailClientId] = useState<string | null>(null);
  const [newRecipientOpen, setNewRecipientOpen] = useState(false);
  const [pickupClientId, setPickupClientId] = useState<string | null>(null);
  const [captureAgreementClientId, setCaptureAgreementClientId] = useState<string | null>(null);
  const [captureProxyAgreement, setCaptureProxyAgreement] = useState<{ clientId: string; proxyId: string } | null>(null);

  const expiredCount = clients.filter((c) => c.agreementStatus === "expired").length;
  const pickupsToday = clients.reduce(
    (n, c) => n + c.pickups.filter((p) => p.isToday).length,
    0
  );

  const filtered = useMemo(() => {
    let items = clients;
    if (filter === "expired") items = items.filter((c) => c.agreementStatus === "expired");
    if (!searchQ.trim()) return items;
    const q = searchQ.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ahopeNumber.toLowerCase().includes(q)
    );
  }, [clients, searchQ, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = filtered.length > 0 ? page * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  const handleNewRecipient = (name: string, thumb: string | null) => {
    const newClient: MailClient = {
      id: genId("mc"),
      name,
      initials: getInitials(name),
      ahopeNumber: genAhopeNumber(),
      agreementStatus: "active",
      agreementSigned: TODAY_DATE,
      agreementExpires: NEXT_YEAR_DATE,
      agreementThumb: thumb,
      checkedIn: false,
      proxies: [],
      pickups: [],
    };
    setClients((prev) => [newClient, ...prev]);
    setNewRecipientOpen(false);
    setPage(0);
    setDetailClientId(newClient.id);
    setToast(`${name} registered — mail-holding agreement on file`);
  };

  const handleCaptureAgreement = (clientId: string, thumb: string | null) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              agreementStatus: "active",
              agreementSigned: TODAY_DATE,
              agreementExpires: NEXT_YEAR_DATE,
              agreementThumb: thumb,
            }
          : c
      )
    );
    setCaptureAgreementClientId(null);
    const client = clients.find((c) => c.id === clientId);
    setToast(`New agreement captured for ${client?.name} — valid to ${NEXT_YEAR_DATE}`);
  };

  const handleCaptureProxyAgreement = (clientId: string, proxyId: string, thumb: string | null) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              proxies: c.proxies.map((p) =>
                p.id === proxyId ? { ...p, hasAgreement: true, agreementThumb: thumb } : p
              ),
            }
          : c
      )
    );
    setCaptureProxyAgreement(null);
    setToast("Proxy agreement captured");
  };

  const handleAddProxy = (clientId: string, proxyName: string, thumb: string | null) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const newProxy: MailProxy = {
      id: genId("mp"),
      name: proxyName,
      initials: getInitials(proxyName),
      hasAgreement: !!thumb,
      agreementThumb: thumb,
      signedByLabel: `${proxyName} + ${client.name}`,
    };
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, proxies: [...c.proxies, newProxy] } : c
      )
    );
    setToast(`${proxyName} added as approved picker-upper for ${client.name}`);
  };

  const handleLogPickup = (clientId: string, collectorName: string, collectorType: "self" | "proxy") => {
    if (!user) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const time = nowTime();
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const newPickup: MailPickup = {
      id: genId("pk"),
      collectorName,
      collectorType,
      staffName: user.name,
      staffRole: ROLE_LABELS[user.role],
      date: `${dateStr}, ${time}`,
      isToday: true,
    };
    const needsCheckin = !client.checkedIn;
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              pickups: [newPickup, ...c.pickups],
              checkedIn: true,
              checkinTime: c.checkedIn ? c.checkinTime : time,
            }
          : c
      )
    );
    setPickupClientId(null);
    setToast(
      needsCheckin
        ? `Logged pickup — also checked in ${client.name} at ${time}`
        : `Pickup logged for ${client.name}`
    );
  };

  const handleDeregister = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setDetailClientId(null);
    setToast(`${client?.name} de-registered — no longer receiving mail at AHOPE`);
  };

  const handleRemoveProxy = (clientId: string, proxyId: string) => {
    const client = clients.find((c) => c.id === clientId);
    const proxy = client?.proxies.find((p) => p.id === proxyId);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, proxies: c.proxies.filter((p) => p.id !== proxyId) } : c
      )
    );
    setToast(`${proxy?.name} removed — can no longer pick up for ${client?.name}`);
  };

  const detailClient = detailClientId ? clients.find((c) => c.id === detailClientId) : null;
  const pickupClient = pickupClientId ? clients.find((c) => c.id === pickupClientId) : null;
  const captureClient = captureAgreementClientId ? clients.find((c) => c.id === captureAgreementClientId) : null;
  const captureProxyClient = captureProxyAgreement ? clients.find((c) => c.id === captureProxyAgreement.clientId) : null;
  const captureProxyTarget = captureProxyClient?.proxies.find((p) => p.id === captureProxyAgreement?.proxyId);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-[26px] pb-[60px] max-w-[1240px] w-full box-border mx-auto">
      <PageHeader dateLabel={TODAY_LABEL} title="Mailroom">
        <StatCard value={clients.length} label="Recipients" sublabel="Agreement on file" />
        <StatCard value={pickupsToday} label="Pickups" sublabel="Today" />
        <StatCard value={expiredCount} label="Expired" sublabel="Need a new agreement" />
        <button
          onClick={() => setNewRecipientOpen(true)}
          className="self-center min-h-[48px] px-5 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark flex items-center gap-2"
        >
          <span className="text-base leading-none">+</span> New recipient
        </button>
      </PageHeader>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={searchQ}
          onChange={(e) => { setSearchQ(e.target.value); setPage(0); }}
          placeholder="Search by name or AHOPE #"
          className="w-full"
        />
      </div>

      {/* Filter — segmented control, same style as the Lockers tabs */}
      <div className="flex border-b-[2px] border-cream-dark mb-4">
        <button
          onClick={() => { setFilter("all"); setPage(0); }}
          className={cn(
            "px-6 py-3 font-heading font-semibold text-[15px] uppercase tracking-[.05em] border-b-[3px] -mb-[2px]",
            filter === "all"
              ? "border-teal text-teal"
              : "border-transparent text-text-secondary hover:text-teal"
          )}
        >
          All
          <span className="ml-2 text-[12px] font-bold bg-teal text-cream rounded-pill px-2 py-0.5 align-middle">
            {clients.length}
          </span>
        </button>
        <button
          onClick={() => { setFilter("expired"); setPage(0); }}
          className={cn(
            "px-6 py-3 font-heading font-semibold text-[15px] uppercase tracking-[.05em] border-b-[3px] -mb-[2px]",
            filter === "expired"
              ? "border-teal text-teal"
              : "border-transparent text-text-secondary hover:text-teal"
          )}
        >
          Expired
          <span className="ml-2 text-[12px] font-bold bg-text-secondary text-cream rounded-pill px-2 py-0.5 align-middle">
            {expiredCount}
          </span>
        </button>
      </div>

      {/* Client list — table card, same skeleton as Lockers */}
      <div className="bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)] overflow-hidden">
        <div className={cn(ROW_GRID, "bg-teal text-cream px-[18px] py-3 font-heading text-xs tracking-[.08em] uppercase rounded-t-card")}>
          <span>Client</span>
          <span>Agreement</span>
          <span />
        </div>

        {pageRows.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            onOpenDetail={() => setDetailClientId(client.id)}
            onLogPickup={() => setPickupClientId(client.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="px-[18px] py-8 text-center text-sm text-text-secondary">
            {searchQ.trim()
              ? `No clients match "${searchQ}"`
              : "No clients in this view."}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-[18px] py-3 bg-cream-faint border-t border-cream-dark">
            <span className="text-[12.5px] text-text-secondary">
              Showing {rangeStart}–{rangeEnd} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-9 px-2.5 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-medium hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default flex items-center gap-1"
              >
                &lsaquo; Previous
              </button>
              {getPageNumbers(page, totalPages).map((pn, i) =>
                pn === "..." ? (
                  <span key={`e${i}`} className="px-1 text-text-secondary text-sm">
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={pn}
                    onClick={() => setPage(pn as number)}
                    className={cn(
                      "w-9 h-9 rounded-button text-sm font-medium",
                      page === pn
                        ? "bg-teal text-cream border-0"
                        : "border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
                    )}
                  >
                    {(pn as number) + 1}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-9 px-2.5 rounded-button border-[1.5px] border-cream-border bg-white text-teal text-sm font-medium hover:bg-cream-dark disabled:opacity-30 disabled:cursor-default flex items-center gap-1"
              >
                Next &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Client detail modal — all client actions happen inside this one modal */}
      {detailClient && (
        <ClientDetailModal
          key={detailClient.id}
          client={detailClient}
          staffName={user?.name ?? ""}
          staffRole={user ? ROLE_LABELS[user.role] : ""}
          onClose={() => setDetailClientId(null)}
          onRenewAgreement={(thumb) => handleCaptureAgreement(detailClient.id, thumb)}
          onCaptureProxyAgreement={(proxyId, thumb) =>
            handleCaptureProxyAgreement(detailClient.id, proxyId, thumb)
          }
          onAddProxy={(name, thumb) => handleAddProxy(detailClient.id, name, thumb)}
          onConfirmPickup={(name, type) => handleLogPickup(detailClient.id, name, type)}
          onDeregister={() => handleDeregister(detailClient.id)}
          onRemoveProxy={(proxyId) => handleRemoveProxy(detailClient.id, proxyId)}
        />
      )}

      {/* New recipient modal */}
      <NewRecipientModal
        open={newRecipientOpen}
        onClose={() => setNewRecipientOpen(false)}
        onSave={handleNewRecipient}
      />

      {/* Log pickup modal — launched from the table row */}
      {pickupClient && !detailClient && (
        <LogPickupModal
          open
          client={pickupClient}
          staffName={user?.name ?? ""}
          staffRole={user ? ROLE_LABELS[user.role] : ""}
          onClose={() => setPickupClientId(null)}
          onConfirm={(name, type) => handleLogPickup(pickupClient.id, name, type)}
          onCaptureAgreement={() => {
            const id = pickupClient.id;
            setPickupClientId(null);
            setCaptureAgreementClientId(id);
          }}
          onCaptureProxyAgreement={(proxyId) => {
            const id = pickupClient.id;
            setPickupClientId(null);
            setCaptureProxyAgreement({ clientId: id, proxyId });
          }}
        />
      )}

      {/* Capture / renew agreement — reached from the row pickup gate */}
      {captureClient && !detailClient && (
        <CaptureAgreementModal
          open
          title={
            captureClient.agreementStatus === "expired"
              ? "Capture new agreement"
              : "Capture mail-holding agreement"
          }
          subtitle={
            captureClient.agreementStatus === "expired"
              ? `${captureClient.name}'s previous agreement expired ${captureClient.agreementExpires}`
              : `For ${captureClient.name}`
          }
          onClose={() => setCaptureAgreementClientId(null)}
          onSave={(thumb) => handleCaptureAgreement(captureClient.id, thumb)}
        />
      )}

      {/* Capture proxy agreement — reached from the row pickup gate */}
      {captureProxyTarget && captureProxyAgreement && !detailClient && (
        <CaptureAgreementModal
          open
          title="Capture proxy agreement"
          subtitle={`Signed by ${captureProxyTarget.signedByLabel}`}
          onClose={() => setCaptureProxyAgreement(null)}
          onSave={(thumb) =>
            handleCaptureProxyAgreement(
              captureProxyAgreement.clientId,
              captureProxyAgreement.proxyId,
              thumb
            )
          }
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client row (Lockers-style; tap opens the detail modal)             */
/* ------------------------------------------------------------------ */

function ClientRow({
  client,
  onOpenDetail,
  onLogPickup,
}: {
  client: MailClient;
  onOpenDetail: () => void;
  onLogPickup: () => void;
}) {
  const expired = client.agreementStatus === "expired";

  return (
    <div
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      aria-label={`View details for ${client.name}`}
      className={cn(ROW_GRID, "px-[18px] py-2.5 border-b border-cream-dark cursor-pointer hover:bg-cream-faint/60")}
    >
      {/* Client */}
      <span className="flex items-center gap-2.5 py-1.5 min-h-12">
        <Avatar initials={client.initials} size="md" />
        <span className="flex flex-col leading-[1.25]">
          <span className="text-[14.5px] font-bold text-teal underline decoration-teal/30">
            {client.name}
          </span>
          <span className="text-xs text-text-secondary">
            #{client.ahopeNumber}
            {client.yob ? ` · ${client.yob}` : ""}
            {client.checkedIn && (
              <span className="text-green font-semibold"> · Here {client.checkinTime}</span>
            )}
          </span>
        </span>
      </span>

      {/* Agreement chip */}
      <span>
        {expired ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-red/12 text-red text-[12px] font-bold whitespace-nowrap">
            <span className="w-[7px] h-[7px] rounded-full bg-current" />
            {`Expired ${client.agreementExpires}`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-green/12 text-green text-[12px] font-bold whitespace-nowrap">
            <span className="w-[7px] h-[7px] rounded-full bg-current" />
            On file
          </span>
        )}
      </span>

      {/* Primary action only — everything else lives in the detail modal */}
      <span className="flex items-center justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLogPickup();
          }}
          aria-label="Log a pickup as a service transaction"
          className="min-h-[44px] px-4 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark flex items-center gap-2 whitespace-nowrap"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
          </svg>
          Log a pickup
        </button>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client detail modal — one modal, multiple in-place views           */
/* ------------------------------------------------------------------ */

type DetailView =
  | { kind: "overview" }
  | { kind: "renew" }
  | { kind: "addProxy" }
  | { kind: "captureProxy"; proxyId: string }
  | { kind: "pickup" }
  | { kind: "deregister" }
  | { kind: "removeProxy"; proxyId: string };

function ClientDetailModal({
  client,
  staffName,
  staffRole,
  onClose,
  onRenewAgreement,
  onCaptureProxyAgreement,
  onAddProxy,
  onConfirmPickup,
  onDeregister,
  onRemoveProxy,
}: {
  client: MailClient;
  staffName: string;
  staffRole: string;
  onClose: () => void;
  onRenewAgreement: (thumb: string) => void;
  onCaptureProxyAgreement: (proxyId: string, thumb: string) => void;
  onAddProxy: (name: string, thumb: string | null) => void;
  onConfirmPickup: (collectorName: string, collectorType: "self" | "proxy") => void;
  onDeregister: () => void;
  onRemoveProxy: (proxyId: string) => void;
}) {
  const [view, setView] = useState<DetailView>({ kind: "overview" });
  const [captureThumb, setCaptureThumb] = useState<string | null>(null);
  const [proxyName, setProxyName] = useState("");
  const [selectedCollector, setSelectedCollector] = useState<string>("self");

  const expired = client.agreementStatus === "expired";

  const goto = (v: DetailView) => {
    setCaptureThumb(null);
    setProxyName("");
    setSelectedCollector("self");
    setView(v);
  };

  const viewProxy =
    view.kind === "captureProxy" || view.kind === "removeProxy"
      ? client.proxies.find((p) => p.id === view.proxyId)
      : undefined;

  const titles: Record<DetailView["kind"], { title: string; subtitle: string }> = {
    overview: {
      title: client.name,
      subtitle: `#${client.ahopeNumber}${client.yob ? ` · ${client.yob}` : ""}${
        client.checkedIn ? ` · Here today, ${client.checkinTime}` : " · Not checked in today"
      }`,
    },
    renew: {
      title: "Capture new agreement",
      subtitle: `${client.name}'s previous agreement expired ${client.agreementExpires}`,
    },
    addProxy: {
      title: "Add picker-upper",
      subtitle: `Authorize someone to collect mail for ${client.name}`,
    },
    captureProxy: {
      title: "Capture proxy agreement",
      subtitle: viewProxy ? `Signed by ${viewProxy.signedByLabel}` : "",
    },
    pickup: {
      title: "Log a pickup",
      subtitle: `Record a mail service transaction for ${client.name}`,
    },
    deregister: {
      title: `De-register ${client.name}?`,
      subtitle: "This ends their mail-holding agreement",
    },
    removeProxy: {
      title: viewProxy ? `Remove ${viewProxy.name}?` : "Remove picker-upper?",
      subtitle: "This ends the proxy agreement",
    },
  };

  const { title, subtitle } = titles[view.kind];

  const backButton = (
    <button
      onClick={() => goto({ kind: "overview" })}
      className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark flex items-center gap-1.5"
    >
      &lsaquo; Back
    </button>
  );

  return (
    <Modal open onClose={onClose} title={title} subtitle={subtitle} className="!w-[640px]">
      {view.kind === "overview" && (
        <>
          {/* Agreement */}
          <DetailSection label="Mail-holding agreement">
            {expired ? (
              <div className="mt-2 bg-red/8 border border-red/20 rounded-button px-4 py-3 flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-red)"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1">
                  <p className="text-[13.5px] text-red font-semibold leading-[1.4] mb-0.5">
                    {`Agreement expired ${client.agreementExpires}`}
                  </p>
                  <p className="text-[12.5px] text-text-secondary leading-[1.5] mb-0">
                    {`Signed ${client.agreementSigned}. A new signed agreement must be captured before mail can be released.`}
                  </p>
                </div>
                <button
                  onClick={() => goto({ kind: "renew" })}
                  className="flex-shrink-0 min-h-[40px] px-4 text-[11px] rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark"
                >
                  Capture new agreement
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <AgreementThumb thumb={client.agreementThumb} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-green">On file ✓</span>
                  <span className="text-[11.5px] text-text-secondary">
                    {`Signed ${client.agreementSigned} · Expires ${client.agreementExpires}`}
                  </span>
                </div>
              </div>
            )}
          </DetailSection>

          {/* Proxies */}
          <DetailSection label="Approved picker-uppers">
            {client.proxies.length > 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                {client.proxies.map((proxy) => (
                  <div
                    key={proxy.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 border border-cream-border rounded-button bg-cream-faint"
                  >
                    <Avatar initials={proxy.initials} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13.5px] font-bold text-text">{proxy.name}</span>
                        {proxy.hasAgreement ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-green/12 text-green text-[10px] font-bold">
                            <span className="w-[5px] h-[5px] rounded-full bg-current" />
                            On file
                          </span>
                        ) : (
                          <button
                            onClick={() => goto({ kind: "captureProxy", proxyId: proxy.id })}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-red/12 text-red text-[10px] font-bold border-0 cursor-pointer hover:bg-red/20"
                          >
                            <span className="w-[5px] h-[5px] rounded-full bg-current" />
                            No agreement — capture
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-text-secondary">
                        Signed by {proxy.signedByLabel}
                      </span>
                    </div>
                    <button
                      onClick={() => goto({ kind: "removeProxy", proxyId: proxy.id })}
                      aria-label={`Remove ${proxy.name} as picker-upper for ${client.name}`}
                      className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-red text-lg font-bold hover:bg-red/10 flex items-center justify-center flex-shrink-0"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-text-secondary mt-2 italic">
                No approved picker-uppers yet.
              </p>
            )}
            <button
              onClick={() => goto({ kind: "addProxy" })}
              className="mt-2.5 min-h-[40px] px-4 text-[11px] rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-teal hover:bg-cream-dark flex items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span> Add picker-upper
            </button>
          </DetailSection>

          {/* Recent pickups */}
          <DetailSection label="Recent pickups">
            {client.pickups.length > 0 ? (
              <div className="border border-cream-border rounded-button overflow-hidden mt-2">
                {client.pickups.slice(0, 5).map((pickup, i) => (
                  <div
                    key={pickup.id}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2",
                      i < Math.min(client.pickups.length, 5) - 1 && "border-b border-cream-dark"
                    )}
                  >
                    <span className="text-[11.5px] text-text-secondary w-[110px] flex-shrink-0">
                      {pickup.date}
                    </span>
                    <span className="text-[12.5px] text-text flex-1 min-w-0 truncate">
                      <span className="font-semibold">{pickup.collectorName}</span>
                      <span className="text-text-secondary">
                        {" "}
                        ({pickup.collectorType === "self" ? "self" : "proxy"})
                      </span>
                    </span>
                    <span className="text-[11.5px] text-text-secondary flex-shrink-0">
                      by {pickup.staffName}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-text-secondary mt-2 italic">No pickups recorded.</p>
            )}
          </DetailSection>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-cream-dark">
            <button
              onClick={() => goto({ kind: "deregister" })}
              aria-label={`De-register ${client.name}`}
              className="min-h-[44px] px-4 text-xs rounded-button font-heading font-semibold tracking-[.06em] uppercase border-[1.5px] border-red/40 bg-white text-red hover:bg-red/5 whitespace-nowrap"
            >
              De-register
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
              >
                Close
              </button>
              <button
                onClick={() => goto({ kind: expired ? "renew" : "pickup" })}
                aria-label="Log a pickup as a service transaction"
                className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark flex items-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                </svg>
                Log a pickup
              </button>
            </div>
          </div>
        </>
      )}

      {view.kind === "renew" && (
        <>
          <AgreementCapture
            thumb={captureThumb}
            onCapture={setCaptureThumb}
            onClear={() => setCaptureThumb(null)}
          />
          <div className="flex justify-between gap-3 pt-2">
            {backButton}
            <button
              onClick={() => {
                if (!captureThumb) return;
                onRenewAgreement(captureThumb);
                goto({ kind: "overview" });
              }}
              disabled={!captureThumb}
              className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
            >
              Save agreement
            </button>
          </div>
        </>
      )}

      {view.kind === "captureProxy" && viewProxy && (
        <>
          <p className="text-[13px] text-text-secondary leading-[1.5] -mt-1 mb-0">
            {`This agreement must be signed by both ${viewProxy.name} and ${client.name}.`}
          </p>
          <AgreementCapture
            thumb={captureThumb}
            onCapture={setCaptureThumb}
            onClear={() => setCaptureThumb(null)}
          />
          <div className="flex justify-between gap-3 pt-2">
            {backButton}
            <button
              onClick={() => {
                if (!captureThumb) return;
                onCaptureProxyAgreement(viewProxy.id, captureThumb);
                goto({ kind: "overview" });
              }}
              disabled={!captureThumb}
              className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
            >
              Save agreement
            </button>
          </div>
        </>
      )}

      {view.kind === "addProxy" && (
        <>
          <div className="flex flex-col gap-2">
            <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
              Picker-upper name
            </label>
            <input
              value={proxyName}
              onChange={(e) => setProxyName(e.target.value)}
              placeholder="e.g. Joe M."
              className="w-full px-3.5 py-3 border-[1.5px] border-cream-border rounded-button font-body text-[15px] bg-white focus:outline-[3px] focus:outline-gold focus:outline-offset-[1px] focus:border-teal"
              autoFocus
            />
          </div>

          {proxyName.trim() && (
            <div className="flex flex-col gap-2">
              <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
                Proxy agreement
              </label>
              <p className="text-[12.5px] text-text-secondary leading-[1.5] -mt-1 mb-0">
                {"This agreement must be signed by both "}
                <strong>{proxyName.trim()}</strong>
                {" and "}
                <strong>{client.name}</strong>
                {"."}
              </p>
              <AgreementCapture
                thumb={captureThumb}
                onCapture={setCaptureThumb}
                onClear={() => setCaptureThumb(null)}
              />
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            {backButton}
            <button
              onClick={() => {
                if (!proxyName.trim() || !captureThumb) return;
                onAddProxy(proxyName.trim(), captureThumb);
                goto({ kind: "overview" });
              }}
              disabled={!proxyName.trim() || !captureThumb}
              className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
            >
              Save
            </button>
          </div>
        </>
      )}

      {view.kind === "pickup" && (
        <>
          <div className="flex flex-col gap-2">
            <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
              Who is collecting?
            </label>
            <div className="flex flex-col gap-1.5">
              <CollectorOption
                label={`${client.name} (self)`}
                selected={selectedCollector === "self"}
                onSelect={() => setSelectedCollector("self")}
              />
              {client.proxies.map((proxy) => (
                <CollectorOption
                  key={proxy.id}
                  label={`${proxy.name} (approved proxy)`}
                  selected={selectedCollector === proxy.id}
                  onSelect={() => setSelectedCollector(proxy.id)}
                  blocked={!proxy.hasAgreement}
                  blockedReason="No agreement"
                />
              ))}
            </div>
          </div>

          {(() => {
            const selectedProxy = client.proxies.find((p) => p.id === selectedCollector);
            const proxyBlocked =
              selectedCollector !== "self" && selectedProxy && !selectedProxy.hasAgreement;
            return proxyBlocked && selectedProxy ? (
              <div className="bg-red/8 border border-red/20 rounded-button px-4 py-3 flex items-start gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-red)"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1">
                  <p className="text-[13px] text-red font-semibold leading-[1.4] mb-0.5">
                    {`${selectedProxy.name} doesn't have a proxy agreement on file`}
                  </p>
                  <p className="text-[12px] text-text-secondary leading-[1.5] mb-0">
                    {`A signed agreement between ${selectedProxy.signedByLabel} must be captured first.`}
                  </p>
                </div>
                <button
                  onClick={() => goto({ kind: "captureProxy", proxyId: selectedProxy.id })}
                  className="flex-shrink-0 min-h-[36px] px-3.5 text-[11px] rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-red/30 bg-white text-red hover:bg-red/5"
                >
                  Capture
                </button>
              </div>
            ) : null;
          })()}

          <div className="flex flex-col gap-2">
            <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
              Handed out by
            </label>
            <div className="px-3.5 py-3 border-[1.5px] border-cream-border rounded-button bg-cream-faint text-[14px] text-text">
              {staffName} <span className="text-text-secondary">({staffRole})</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
              Date & time
            </label>
            <div className="px-3.5 py-3 border-[1.5px] border-cream-border rounded-button bg-cream-faint text-[14px] text-text">
              {TODAY_LABEL}, {nowTime()}
            </div>
          </div>

          {!client.checkedIn && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-teal/[.05] border border-teal/15 rounded-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-teal)"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-[12.5px] text-teal leading-[1.5]">
                {`${client.name} isn't on today's "Here Today" list — confirming this pickup will also check them in automatically.`}
              </span>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            {backButton}
            <button
              onClick={() => {
                const selectedProxy = client.proxies.find((p) => p.id === selectedCollector);
                if (selectedCollector === "self") {
                  onConfirmPickup(client.name, "self");
                } else if (selectedProxy?.hasAgreement) {
                  onConfirmPickup(selectedProxy.name, "proxy");
                } else {
                  return;
                }
                goto({ kind: "overview" });
              }}
              disabled={
                selectedCollector !== "self" &&
                !client.proxies.find((p) => p.id === selectedCollector)?.hasAgreement
              }
              className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
            >
              Confirm pickup
            </button>
          </div>
        </>
      )}

      {view.kind === "deregister" && (
        <>
          <p className="text-[14px] text-text-secondary leading-[1.6]">
            {`This ends ${client.name}'s mail-holding agreement and removes them from the mailroom. AHOPE will stop holding mail for them, and all of their approved picker-uppers are removed too.`}
          </p>
          <div className="flex justify-between gap-3 pt-2">
            {backButton}
            <button
              onClick={onDeregister}
              className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-red text-white hover:bg-red-dark"
            >
              De-register
            </button>
          </div>
        </>
      )}

      {view.kind === "removeProxy" && viewProxy && (
        <>
          <p className="text-[14px] text-text-secondary leading-[1.6]">
            {`This ends the proxy agreement between ${viewProxy.signedByLabel}. ${viewProxy.name} will no longer be able to collect mail for ${client.name}.`}
          </p>
          <div className="flex justify-between gap-3 pt-2">
            {backButton}
            <button
              onClick={() => {
                onRemoveProxy(viewProxy.id);
                goto({ kind: "overview" });
              }}
              className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-red text-white hover:bg-red-dark"
            >
              Remove proxy
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPageNumbers(current: number, total: number): Array<number | "..."> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: Array<number | "..."> = [];
  pages.push(0);
  if (current > 2) pages.push("...");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 3) pages.push("...");
  pages.push(total - 1);
  return pages;
}

function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-heading text-[11px] tracking-[.14em] uppercase text-red font-semibold">
        {label}
      </div>
      {children}
    </div>
  );
}

function AgreementThumb({ thumb, small }: { thumb: string | null; small?: boolean }) {
  const size = small ? "w-10 h-10" : "w-14 h-14";

  if (thumb && thumb !== "on-file") {
    return (
      <img
        src={thumb}
        alt="Signed agreement"
        className={cn(size, "rounded-[6px] object-cover border border-cream-border flex-shrink-0")}
      />
    );
  }

  return (
    <div
      className={cn(
        size,
        "rounded-[6px] bg-teal/10 border border-cream-border flex items-center justify-center flex-shrink-0"
      )}
    >
      <svg
        width={small ? "16" : "22"}
        height={small ? "16" : "22"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth="1.5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    </div>
  );
}

function AgreementCapture({
  thumb,
  onCapture,
  onClear,
}: {
  thumb: string | null;
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onCapture(url);
  };

  if (thumb) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 border border-cream-border rounded-button bg-cream-faint">
        <img
          src={thumb}
          alt="Signed agreement"
          className="w-12 h-12 rounded-[6px] object-cover border border-cream-border"
        />
        <div className="flex-1">
          <span className="text-[13px] text-green font-semibold flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-green/15 text-green flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            Image captured
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-text-secondary text-sm hover:text-red border-0 bg-transparent cursor-pointer"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="border-[1.5px] border-dashed border-cream-border rounded-[10px] p-4 flex items-center gap-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-button border border-cream-border bg-white hover:bg-cream-faint text-center min-w-[100px] cursor-pointer"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="1.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-[11px] text-text-secondary font-semibold">Take photo</span>
          <span className="text-[10px] text-text-secondary">Use tablet camera</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-button border border-cream-border bg-white hover:bg-cream-faint text-center min-w-[100px] cursor-pointer"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="1.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-[11px] text-text-secondary font-semibold">Upload file</span>
          <span className="text-[10px] text-text-secondary">Max 10 MB</span>
        </button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </>
  );
}

function CollectorOption({
  label,
  selected,
  onSelect,
  blocked,
  blockedReason,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  blocked?: boolean;
  blockedReason?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 w-full text-left px-3.5 py-3 rounded-button border-[1.5px] cursor-pointer min-h-[52px]",
        selected
          ? "border-teal bg-teal/[.04]"
          : "border-cream-border bg-white hover:border-teal/50 hover:bg-teal/[.02]"
      )}
    >
      <span
        className={cn(
          "w-[22px] h-[22px] rounded-full border-2 inline-flex items-center justify-center flex-shrink-0",
          selected ? "border-teal" : "border-cream-muted"
        )}
      >
        {selected && <span className="w-[10px] h-[10px] rounded-full bg-teal" />}
      </span>
      <span className="text-[14px] text-text flex-1">{label}</span>
      {blocked && <span className="text-[10px] text-red font-semibold">{blockedReason}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Standalone modals (row-level and header flows)                     */
/* ------------------------------------------------------------------ */

function NewRecipientModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, thumb: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [thumb, setThumb] = useState<string | null>(null);

  const handleClose = () => {
    setName("");
    setThumb(null);
    onClose();
  };

  const handleSave = () => {
    if (!name.trim() || !thumb) return;
    onSave(name.trim(), thumb);
    setName("");
    setThumb(null);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New recipient"
      subtitle="Register a client for mail-holding"
      className="!w-[520px]"
    >
      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Client name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Jordan R."
          className="w-full px-3.5 py-3 border-[1.5px] border-cream-border rounded-button font-body text-[15px] bg-white focus:outline-[3px] focus:outline-gold focus:outline-offset-[1px] focus:border-teal"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Signed mail-holding agreement
        </label>
        <AgreementCapture thumb={thumb} onCapture={setThumb} onClear={() => setThumb(null)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleClose}
          className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !thumb}
          className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function LogPickupModal({
  open,
  client,
  staffName,
  staffRole,
  onClose,
  onConfirm,
  onCaptureAgreement,
  onCaptureProxyAgreement,
}: {
  open: boolean;
  client: MailClient;
  staffName: string;
  staffRole: string;
  onClose: () => void;
  onConfirm: (collectorName: string, collectorType: "self" | "proxy") => void;
  onCaptureAgreement: () => void;
  onCaptureProxyAgreement: (proxyId: string) => void;
}) {
  const [selectedCollector, setSelectedCollector] = useState<string>("self");

  if (client.agreementStatus === "expired") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Cannot log pickup"
        subtitle={`${client.name}'s agreement has expired`}
        className="!w-[480px]"
      >
        <div className="bg-red/8 border border-red/20 rounded-button px-4 py-3 flex items-start gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-red)"
            strokeWidth="2"
            className="flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="text-[14px] text-red font-semibold leading-[1.4] mb-1">
              {`Agreement expired ${client.agreementExpires}`}
            </p>
            <p className="text-[13px] text-text-secondary leading-[1.5] mb-0">
              {`${client.name}'s mail-holding agreement is no longer valid. A new signed agreement must be captured before any mail can be released.`}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
          >
            Cancel
          </button>
          <button
            onClick={onCaptureAgreement}
            className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark"
          >
            Capture new agreement
          </button>
        </div>
      </Modal>
    );
  }

  const selectedProxy = client.proxies.find((p) => p.id === selectedCollector);
  const proxyBlocked = selectedCollector !== "self" && selectedProxy && !selectedProxy.hasAgreement;
  const canConfirm =
    selectedCollector === "self" || (selectedProxy && selectedProxy.hasAgreement);

  const handleConfirm = () => {
    if (selectedCollector === "self") {
      onConfirm(client.name, "self");
    } else if (selectedProxy) {
      onConfirm(selectedProxy.name, "proxy");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a pickup"
      subtitle={`Record a mail service transaction for ${client.name}`}
      className="!w-[520px]"
    >
      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Who is collecting?
        </label>
        <div className="flex flex-col gap-1.5">
          <CollectorOption
            label={`${client.name} (self)`}
            selected={selectedCollector === "self"}
            onSelect={() => setSelectedCollector("self")}
          />
          {client.proxies.map((proxy) => (
            <CollectorOption
              key={proxy.id}
              label={`${proxy.name} (approved proxy)`}
              selected={selectedCollector === proxy.id}
              onSelect={() => setSelectedCollector(proxy.id)}
              blocked={!proxy.hasAgreement}
              blockedReason="No agreement"
            />
          ))}
        </div>
      </div>

      {proxyBlocked && selectedProxy && (
        <div className="bg-red/8 border border-red/20 rounded-button px-4 py-3 flex items-start gap-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-red)"
            strokeWidth="2"
            className="flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="text-[13px] text-red font-semibold leading-[1.4] mb-0.5">
              {`${selectedProxy.name} doesn't have a proxy agreement on file`}
            </p>
            <p className="text-[12px] text-text-secondary leading-[1.5] mb-0">
              {`A signed agreement between ${selectedProxy.signedByLabel} must be captured first.`}
            </p>
          </div>
          <button
            onClick={() => onCaptureProxyAgreement(selectedProxy.id)}
            className="flex-shrink-0 min-h-[36px] px-3.5 text-[11px] rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-red/30 bg-white text-red hover:bg-red/5"
          >
            Capture
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Handed out by
        </label>
        <div className="px-3.5 py-3 border-[1.5px] border-cream-border rounded-button bg-cream-faint text-[14px] text-text">
          {staffName} <span className="text-text-secondary">({staffRole})</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-heading text-xs tracking-[.08em] uppercase text-text-secondary font-semibold">
          Date & time
        </label>
        <div className="px-3.5 py-3 border-[1.5px] border-cream-border rounded-button bg-cream-faint text-[14px] text-text">
          {TODAY_LABEL}, {nowTime()}
        </div>
      </div>

      {!client.checkedIn && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-teal/[.05] border border-teal/15 rounded-button">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-teal)"
            strokeWidth="2"
            className="flex-shrink-0 mt-0.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-[12.5px] text-teal leading-[1.5]">
            {`${client.name} isn't on today's "Here Today" list — confirming this pickup will also check them in automatically.`}
          </span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
        >
          Confirm pickup
        </button>
      </div>
    </Modal>
  );
}

function CaptureAgreementModal({
  open,
  title,
  subtitle,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  onSave: (thumb: string) => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);

  const handleClose = () => {
    setThumb(null);
    onClose();
  };

  const handleSave = () => {
    if (!thumb) return;
    onSave(thumb);
    setThumb(null);
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} subtitle={subtitle} className="!w-[480px]">
      <AgreementCapture thumb={thumb} onCapture={setThumb} onClear={() => setThumb(null)} />
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleClose}
          className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-[1.5px] border-cream-border bg-white text-text hover:bg-cream-dark"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!thumb}
          className="min-h-[44px] px-5 text-sm rounded-button font-heading font-semibold tracking-[.04em] uppercase border-0 bg-teal text-cream hover:bg-teal-dark disabled:opacity-40 disabled:cursor-default"
        >
          Save agreement
        </button>
      </div>
    </Modal>
  );
}
