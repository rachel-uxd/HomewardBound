"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/providers/AuthProvider";
import { DEMO_CLIENTS, DEMO_MAIL, DEMO_ACTION_ITEMS, TODAY_LABEL, type DemoClient, type DemoActionItem } from "@/lib/demo-data";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterChip } from "@/components/ui/FilterChip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ServiceTile } from "@/components/ui/ServiceTile";
import { Toast } from "@/components/ui/Toast";
import { NewClientModal } from "@/components/modals/NewClientModal";
import { NoteEntryModal } from "@/components/modals/NoteEntryModal";
import { FlagRecordModal } from "@/components/modals/FlagRecordModal";
import { ShowerQueueChoiceModal } from "@/components/modals/ShowerQueueModal";
import { LockerHasModal, LockerNoneModal } from "@/components/modals/LockerModal";
import { MailPickupModal } from "@/components/modals/MailPickupModal";
import { TaskModal } from "@/components/modals/TaskModal";

type ModalType = "newClient" | "note" | "glimmer" | "plan" | "flag" | "shower" | "lockerHas" | "lockerNone" | "mail" | "newTask" | "editTask" | null;

export function AttendanceScreen() {
  const { isCM } = useAuth();
  const [searchQ, setSearchQ] = useState("");
  const [filter, setFilter] = useState<"here" | "all">("here");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string>>(new Set());
  const [localTasks, setLocalTasks] = useState<DemoActionItem[]>([]);
  const [editingTask, setEditingTask] = useState<DemoActionItem | null>(null);

  const filteredClients = useMemo(() => {
    let list = DEMO_CLIENTS;
    if (filter === "here") {
      list = list.filter((c) => c.checkedIn);
    }
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.alias?.toLowerCase().includes(q) ||
          c.ahopeNumber.toLowerCase().includes(q) ||
          c.yob?.toString().includes(q)
      );
    }
    return list;
  }, [filter, searchQ]);

  const hereCount = DEMO_CLIENTS.filter((c) => c.checkedIn).length;
  const selected = selectedId
    ? DEMO_CLIENTS.find((c) => c.id === selectedId)
    : null;

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const getClientTasks = useCallback(
    (clientId: string) => {
      const demoTasks = DEMO_ACTION_ITEMS.filter(
        (a) => a.clientId === clientId && a.status !== "done" && !completedTaskIds.has(a.id) && !deletedTaskIds.has(a.id)
      );
      const added = localTasks.filter(
        (a) => a.clientId === clientId && !completedTaskIds.has(a.id) && !deletedTaskIds.has(a.id)
      );
      return [...added, ...demoTasks];
    },
    [completedTaskIds, deletedTaskIds, localTasks]
  );

  const handleAddTask = useCallback(
    (task: { text: string }) => {
      if (!selected) return;
      const newTask: DemoActionItem = {
        id: `local-${Date.now()}`,
        clientId: selected.id,
        clientName: selected.name,
        clientInitials: selected.initials,
        clientAlias: selected.alias,
        task: task.text,
        priority: "normal",
        status: "open",
        lastCheckedIn: selected.checkinTime ? `Today, ${selected.checkinTime}` : undefined,
        isHereToday: selected.checkedIn,
      };
      setLocalTasks((prev) => [newTask, ...prev]);
      showToast(`Task added for ${selected.name}`);
    },
    [selected, showToast]
  );

  const handleEditTask = useCallback(
    (task: { text: string }) => {
      if (!editingTask) return;
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, task: task.text } : t))
      );
      showToast("Task updated");
      setEditingTask(null);
    },
    [editingTask, showToast]
  );

  const handleCompleteTask = useCallback(
    (taskId: string, clientName: string) => {
      setCompletedTaskIds((prev) => new Set(prev).add(taskId));
      showToast(`Task completed for ${clientName}`);
    },
    [showToast]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      setDeletedTaskIds((prev) => new Set(prev).add(taskId));
      setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("Task removed");
    },
    [showToast]
  );

  return (
    <div className="flex-1 grid grid-cols-[372px_1fr] min-h-0 h-[calc(100vh-var(--height-topbar))]">
      {/* Left rail */}
      <div className="bg-cream-dark border-r border-cream-border flex flex-col min-h-0">
        <div className="px-[18px] pt-5 pb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-semibold text-[22px] uppercase tracking-[.02em] text-teal">
              Attendance
            </span>
            <Button size="sm" className="text-[13px]" onClick={() => setActiveModal("newClient")}>
              + New client
            </Button>
          </div>
          <SearchInput
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search name, alias, YOB, AHOPE #"
          />
          <div className="flex gap-1.5">
            <FilterChip
              label={`Here today · ${hereCount}`}
              active={filter === "here"}
              onClick={() => setFilter("here")}
              className="flex-1"
            />
            <FilterChip
              label="All clients"
              active={filter === "all"}
              onClick={() => setFilter("all")}
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2">
          {filteredClients.map((cl) => (
            <button
              key={cl.id}
              onClick={() => setSelectedId(cl.id)}
              className={cn(
                "flex items-center gap-3 w-full text-left p-3 min-h-[68px] rounded-[12px] shadow-[0_1px_3px_rgba(9,51,68,.07)]",
                "hover:border-[1.5px] hover:border-teal",
                selectedId === cl.id
                  ? "border-[1.5px] border-teal bg-white"
                  : "border-[1.5px] border-cream-border bg-white"
              )}
            >
              <Avatar initials={cl.initials} size="lg" />
              <span className="flex flex-col leading-[1.3] flex-1 min-w-0">
                <span className="text-[15px] font-bold text-text whitespace-nowrap overflow-hidden text-ellipsis">
                  {cl.name}
                </span>
                <span className="text-[12.5px] text-text-secondary">
                  {cl.ahopeNumber}
                  {cl.alias ? ` · "${cl.alias}"` : ""}
                  {cl.yob ? ` · ${cl.yob}` : ""}
                </span>
              </span>
              {cl.checkinTime && (
                <span className="text-[11.5px] font-bold text-green bg-green/12 rounded-pill px-[9px] py-1 whitespace-nowrap">
                  {cl.checkinTime}
                </span>
              )}
            </button>
          ))}
          {filteredClients.length === 0 && (
            <div className="px-3.5 py-7 text-center flex flex-col gap-2.5 items-center">
              <span className="text-sm font-bold text-text">
                No clients found for &ldquo;{searchQ}&rdquo;
              </span>
              <span className="text-[13px] text-text-secondary">
                Try searching by year of birth or alias.
              </span>
              <Button onClick={() => setActiveModal("newClient")}>Create new record</Button>
            </div>
          )}
        </div>
      </div>

      {/* Right pane */}
      <div className="overflow-y-auto min-h-0">
        {!selected ? (
          <EmptyState hereCount={hereCount} onNewClient={() => setActiveModal("newClient")} />
        ) : (
          <ClientDetail
            client={selected}
            isCM={isCM}
            onOpenModal={setActiveModal}
            tasks={getClientTasks(selected.id)}
            onCompleteTask={(id) => handleCompleteTask(id, selected.name)}
            onDeleteTask={handleDeleteTask}
            onEditTask={(task) => { setEditingTask(task); setActiveModal("editTask"); }}
          />
        )}
      </div>

      {/* Modals */}
      <NewClientModal
        open={activeModal === "newClient"}
        onClose={() => setActiveModal(null)}
        onSave={(data) => showToast(`Created record for ${data.firstName} ${data.lastName}`)}
      />
      {selected && (
        <>
          <NoteEntryModal
            open={activeModal === "note"}
            onClose={() => setActiveModal(null)}
            onSave={() => showToast(`Note added for ${selected.name}`)}
            title="Leave a note"
            subtitle={`Add a note to ${selected.name}'s record.`}
            placeholder="Type your note..."
            saveLabel="Save note"
          />
          <NoteEntryModal
            open={activeModal === "glimmer"}
            onClose={() => setActiveModal(null)}
            onSave={() => showToast(`Glimmer added for ${selected.name}`)}
            title="Add glimmer"
            subtitle={`Record a small win for ${selected.name}.`}
            placeholder="What's the glimmer?"
            saveLabel="Save glimmer"
          />
          <NoteEntryModal
            open={activeModal === "plan"}
            onClose={() => setActiveModal(null)}
            onSave={() => showToast(`Engagement plan updated for ${selected.name}`)}
            title="Edit engagement plan"
            subtitle={`Update ${selected.name}'s engagement plan.`}
            placeholder="Goals, next steps, preferences..."
            saveLabel="Update plan"
          />
          <FlagRecordModal
            open={activeModal === "flag"}
            onClose={() => setActiveModal(null)}
            onSave={() => showToast(`Flag added to ${selected.name}'s record`)}
            clientName={selected.name}
          />
          <ShowerQueueChoiceModal
            open={activeModal === "shower"}
            onClose={() => setActiveModal(null)}
            onSelect={(queue) => showToast(`${selected.name} added to ${queue}'s shower queue`)}
            clientName={selected.name}
          />
          <LockerHasModal
            open={activeModal === "lockerHas"}
            onClose={() => setActiveModal(null)}
            onRelease={() => showToast(`Locker #${selected.lockerNumber} released`)}
            clientName={selected.name}
            lockerNumber={selected.lockerNumber ?? 0}
          />
          <LockerNoneModal
            open={activeModal === "lockerNone"}
            onClose={() => setActiveModal(null)}
            onAssign={() => showToast(`Locker assigned to ${selected.name}`)}
            onWaitlist={() => showToast(`${selected.name} added to locker waitlist`)}
            clientName={selected.name}
            nextAvailable={15}
          />
          <MailPickupModal
            open={activeModal === "mail"}
            onClose={() => setActiveModal(null)}
            onSave={(_client, items) => showToast(`${items.length} item(s) released to ${selected.name}`)}
          />
          <TaskModal
            open={activeModal === "newTask"}
            onClose={() => setActiveModal(null)}
            onSave={handleAddTask}
            clientName={selected.name}
          />
          <TaskModal
            open={activeModal === "editTask"}
            onClose={() => { setActiveModal(null); setEditingTask(null); }}
            onSave={handleEditTask}
            clientName={selected.name}
            editingTask={editingTask ? { text: editingTask.task } : null}
          />
        </>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function EmptyState({ hereCount, onNewClient }: { hereCount: number; onNewClient: () => void }) {
  return (
    <div className="h-full flex flex-col px-7 py-[22px] box-border">
      <div className="flex items-center justify-between gap-[18px] flex-wrap border-b border-dashed border-cream-muted pb-[18px]">
        <span className="font-heading font-semibold text-sm tracking-[.14em] uppercase text-teal">
          {TODAY_LABEL}
        </span>
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-0.5 border-[1.5px] border-cream-muted rounded-[12px] bg-white px-5 py-3.5 min-w-[170px] box-border">
            <span className="flex items-baseline gap-2">
              <span className="font-heading font-semibold text-[30px] text-teal leading-none">
                {hereCount}
              </span>
              <span className="text-[15px] font-bold text-teal">
                Checked in
              </span>
            </span>
            <span className="text-[13px] text-text-secondary">
              clients here today
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3.5 p-10 text-center">
        <span className="font-heading font-semibold text-[34px] uppercase text-teal">
          Client look-up
        </span>
        <span className="text-[16px] text-text-secondary max-w-[44ch]">
          Search by name, alias, or year of birth to open a record — or select
          someone already here today.
        </span>
        <Button onClick={onNewClient} className="flex items-center gap-2.5 min-h-[52px] px-6 text-[15px] mt-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" />
            <path d="M19 8v6M16 11h6" />
          </svg>
          New client
        </Button>
      </div>
    </div>
  );
}

function ClientDetail({
  client,
  isCM,
  onOpenModal,
  tasks,
  onCompleteTask,
  onDeleteTask,
  onEditTask,
}: {
  client: DemoClient;
  isCM: boolean;
  onOpenModal: (modal: ModalType) => void;
  tasks: DemoActionItem[];
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: DemoActionItem) => void;
}) {
  const sel = client;
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null);

  return (
    <div className="px-7 py-6 pb-12 flex flex-col gap-[18px] max-w-[1080px]">
      {/* Record header */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-[18px] flex-wrap">
          <Avatar initials={sel.initials} size="xl" />
          <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="font-heading font-semibold text-[30px] uppercase tracking-[.01em] text-teal leading-none">
                {sel.name}
              </span>
              {sel.checkinTime && (
                <span className="text-[12.5px] font-bold text-green bg-green/12 rounded-pill px-3 py-[5px]">
                  Checked in · {sel.checkinTime}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {sel.flags.map((f, i) => (
                <Badge key={i} variant={f.variant} dot>
                  {f.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-3.5 border-t border-dashed border-cream-border pt-3.5">
          {sel.metaPairs.map((mp) => (
            <div key={mp.k} className="flex flex-col gap-0.5">
              <span className="font-heading text-[10.5px] tracking-[.14em] uppercase text-text-secondary">
                {mp.k}
              </span>
              <span className="text-[15px] font-medium text-text">{mp.v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Service transactions */}
      <div className="flex flex-col gap-2.5">
        <SectionLabel>Service transactions</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-3">
          <ServiceTile
            variant={sel.checkedIn ? "active" : "default"}
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <polyline points="8 12 11 15 16 9" />
              </svg>
            }
            label={sel.checkedIn ? "Checked in" : "Check in"}
          />
          <ServiceTile
            onClick={() => onOpenModal("shower")}
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3c3 4 6 7.5 6 10.5a6 6 0 0 1-12 0C6 10.5 9 7 12 3z" />
              </svg>
            }
            label="Shower"
          />
          <ServiceTile
            onClick={() => onOpenModal("mail")}
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            }
            label="Mail pick-up"
          />
          <ServiceTile
            onClick={() => onOpenModal(sel.lockerNumber ? "lockerHas" : "lockerNone")}
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="8" y1="8" x2="8" y2="11" />
                <line x1="16" y1="8" x2="16" y2="11" />
              </svg>
            }
            label={sel.lockerNumber ? `Locker #${sel.lockerNumber}` : "Locker"}
          />
        </div>
      </div>

      {/* Record keeping */}
      <div className="flex flex-col gap-2.5">
        <SectionLabel>Record keeping</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(158px,1fr))] gap-3">
          <ServiceTile
            onClick={() => onOpenModal("note")}
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="14" y2="13" />
              </svg>
            }
            label="Leave note"
          />
          <ServiceTile
            onClick={() => onOpenModal("glimmer")}
            icon={
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l2.2 5.6L20 10l-5 3.8L16.5 20 12 16.5 7.5 20 9 13.8 4 10l5.8-1.4L12 3z" />
              </svg>
            }
            label="Add glimmer"
          />
          {isCM && (
            <ServiceTile
              onClick={() => onOpenModal("flag")}
              variant="danger"
              icon={
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 21V4" />
                  <path d="M5 4h12l-2.5 4L17 12H5" />
                </svg>
              }
              label="Flag record"
            />
          )}
        </div>
      </div>

      {/* Action items */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <SectionLabel>
            Action items
            {tasks.length > 0 && ` (${tasks.length})`}
          </SectionLabel>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => onOpenModal("newTask")}
          >
            + Add task
          </Button>
        </div>
        <div className="bg-white rounded-card shadow-[0_2px_4px_var(--color-shadow-card),0_8px_24px_var(--color-shadow-card-deep)]">
          <div className="grid grid-cols-[1fr_150px_48px] gap-2.5 items-center bg-teal text-cream px-[18px] py-3 font-heading text-xs tracking-[.08em] uppercase rounded-t-card">
            <span>Task</span>
            <span>Last checked-in</span>
            <span />
          </div>
          {tasks.length === 0 ? (
            <div className="px-[18px] py-6 text-center text-sm text-text-secondary italic">
              No outstanding tasks for this client.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-[1fr_150px_48px] gap-2.5 items-center px-[18px] py-2.5 border-b border-cream-dark"
              >
                <span className="text-sm text-text">{task.task}</span>
                <span
                  className={cn(
                    "text-[13.5px]",
                    task.isHereToday
                      ? "text-green font-bold"
                      : "text-text-secondary font-normal"
                  )}
                >
                  {task.lastCheckedIn ?? "—"}
                </span>
                {isCM ? (
                  <TaskRowMenu
                    isOpen={taskMenuOpen === task.id}
                    onToggle={() => setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id)}
                    onClose={() => setTaskMenuOpen(null)}
                    onMarkDone={() => { onCompleteTask(task.id); setTaskMenuOpen(null); }}
                    onEdit={() => { onEditTask(task); setTaskMenuOpen(null); }}
                    onDelete={() => { onDeleteTask(task.id); setTaskMenuOpen(null); }}
                  />
                ) : (
                  <span />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Engagement plan */}
      {isCM && sel.engagementPlan && (
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2.5">
            <span className="font-heading font-semibold text-lg uppercase text-teal">
              Engagement plan
            </span>
            <Button variant="secondary" size="sm" className="text-xs" onClick={() => onOpenModal("plan")}>
              Edit
            </Button>
          </div>
          <span className="text-[15px] text-text leading-[1.55]">
            {sel.engagementPlan}
          </span>
          <span className="text-xs text-text-secondary uppercase tracking-[.05em]">
            {sel.engagementPlanMeta}
          </span>
        </Card>
      )}

      {/* Glimmers */}
      <Card className="flex flex-col gap-3">
        <span className="font-heading font-semibold text-lg uppercase text-teal">
          Glimmers
        </span>
        {sel.glimmers.length === 0 ? (
          <span className="text-sm text-text-secondary italic">
            No glimmers yet — small wins get logged here.
          </span>
        ) : (
          sel.glimmers.map((gl, i) => (
            <div
              key={i}
              className="border-l-[3px] border-gold pl-3.5 py-0.5 flex flex-col gap-[3px]"
            >
              <span className="text-[14.5px] text-text leading-[1.5]">
                {gl.text}
              </span>
              <span className="text-[11.5px] text-text-secondary uppercase tracking-[.05em]">
                {gl.meta}
              </span>
            </div>
          ))
        )}
      </Card>

      {/* Activity */}
      <Card className="flex flex-col gap-0.5">
        <span className="font-heading font-semibold text-lg uppercase text-teal mb-2">
          Activity
        </span>
        {sel.activity.map((ac, i) => (
          <div
            key={i}
            className="grid grid-cols-[150px_1fr] gap-3.5 py-3 border-b border-dashed border-cream-border"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-[12.5px] tracking-[.08em] uppercase text-red">
                {ac.type}
              </span>
              <span className="text-[12.5px] text-text-secondary">
                {ac.date}
              </span>
              <span className="text-[11.5px] text-text-muted">{ac.ago}</span>
            </div>
            <div className="flex flex-col gap-[3px]">
              <span className="text-[14.5px] text-text leading-[1.5]">
                {ac.note}
              </span>
              <span className="text-[11.5px] text-text-secondary italic">
                {ac.by}
              </span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function TaskRowMenu({
  isOpen,
  onToggle,
  onClose,
  onMarkDone,
  onEdit,
  onDelete,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkDone: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        onClick={onToggle}
        className="w-9 h-9 rounded-button border-[1.5px] border-cream-border bg-white text-text-secondary text-sm font-bold hover:bg-cream-dark flex items-center justify-center"
        aria-label="Task actions"
      >
        &middot;&middot;&middot;
      </button>
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[160px] bg-white border border-cream-border rounded-[10px] shadow-[0_8px_24px_rgba(9,51,68,.12)] py-1">
          <button
            onClick={onMarkDone}
            className="w-full text-left px-4 py-2.5 text-[13.5px] text-text hover:bg-cream-faint border-0 bg-transparent flex items-center gap-2.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark as done
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full text-left px-4 py-2.5 text-[13.5px] text-text hover:bg-cream-faint border-0 bg-transparent flex items-center gap-2.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2.5 text-[13.5px] text-red hover:bg-red/5 border-0 bg-transparent flex items-center gap-2.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
