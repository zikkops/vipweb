"use client";

import { useEffect, useState } from "react";
import { localToday } from "@/lib/dues";
import {
  activeBlock,
  daysBetween,
  needsSlipReason,
  taskStatus,
  TASK_STATUSES,
  type Task,
  type TaskEvent,
} from "@/lib/tasks";
import { api, errorMessage } from "../api";
import { STATUS_STYLE, formatDay } from "../board";
import Combobox from "../Combobox";
import { BUTTON, BUTTON_SOLID, INPUT, LABEL } from "../ui";
import type { Tags } from "../useTags";
import JobCodePreview from "./JobCodePreview";
import { StatusDot, timing } from "./TaskGroups";

type Mode = "view" | "block" | "edit";

/**
 * Side panel for one task: mark done, block (with a reason and the day it
 * stopped), tick Received to unblock, edit, and see its history. Other
 * people's tasks open read-only.
 */
export default function TaskPanel({
  taskId,
  tags,
  canEdit,
  onClose,
  onChanged,
}: {
  taskId: number;
  tags: Tags;
  canEdit: (task: Task) => boolean;
  onClose: () => void;
  onChanged: (task: Task) => void;
}) {
  const today = localToday();
  const [task, setTask] = useState<Task | null>(null);
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [mode, setMode] = useState<Mode>("view");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{ task: Task; events: TaskEvent[] }>(`tasks/${taskId}/`)
      .then((r) => {
        if (cancelled) return;
        setTask(r.task);
        setEvents(r.events);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function run(request: () => Promise<{ task: Task }>) {
    setBusy(true);
    setError("");
    try {
      const { task: updated } = await request();
      const history = await api<{ task: Task; events: TaskEvent[] }>(`tasks/${taskId}/`);
      setTask(updated);
      setEvents(history.events);
      setMode("view");
      onChanged(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const act = (action: string, extra: Record<string, unknown> = {}) =>
    run(() => api<{ task: Task }>(`tasks/${taskId}/`, { method: "POST", body: { action, today, ...extra } }));

  const status = task ? taskStatus(task, today) : null;
  const block = task ? activeBlock(task, today) : null;
  const editable = task ? canEdit(task) : false;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Task">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          {status ? (
            <span className={`inline-flex items-center gap-2 font-heading text-sm uppercase tracking-widest ${STATUS_STYLE[status].text}`}>
              <StatusDot status={status} />
              {TASK_STATUSES.find((s) => s.key === status)!.label}
            </span>
          ) : (
            <span />
          )}
          <button type="button" onClick={onClose} className="text-2xl leading-none text-muted hover:text-ink" aria-label="Close">
            ×
          </button>
        </div>

        {!task ? (
          <p className="p-6 text-sm text-muted">{error || "Loading…"}</p>
        ) : (
          <div className="space-y-6 p-6">
            <div>
              <h2 className={`font-heading text-3xl normal-case ${status === "done" ? "line-through decoration-muted" : ""}`}>
                {task.title}
              </h2>
              <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
                {!editable && (
                  <>
                    <dt className="text-muted">Who</dt>
                    <dd>{task.userName}</dd>
                  </>
                )}
                <dt className="text-muted">Brand</dt>
                <dd>{tags.brands.find((t) => t.id === task.brandId)?.name ?? "—"}</dd>
                <dt className="text-muted">Work section</dt>
                <dd>{tags.sections.find((t) => t.id === task.sectionId)?.name ?? "—"}</dd>
                <dt className="text-muted">Job code</dt>
                <dd className="font-heading tracking-wider">{task.jobCode ?? <span className="text-muted-light">Not set</span>}</dd>
                <dt className="text-muted">Due</dt>
                <dd>
                  {task.dueDate ? formatDay(task.dueDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "No due date"}
                  <span className="ml-2 text-muted">{timing(task, today)}</span>
                </dd>
              </dl>
            </div>

            {block && (
              <div className={`border p-4 ${STATUS_STYLE.blocked.card}`}>
                <p className="font-heading text-sm uppercase tracking-widest text-amber-800">
                  Blocked since {formatDay(block.blockedOn)} ·{" "}
                  {daysBetween(block.blockedOn, today) === 0 ? "today" : `${daysBetween(block.blockedOn, today)} days`}
                </p>
                <p className="mt-2 text-sm">{block.reason}</p>
                {block.waitingOn && <p className="mt-1 text-sm text-muted">Waiting on {block.waitingOn}</p>}
                {editable && (
                  <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="size-5 accent-accent"
                      disabled={busy}
                      checked={false}
                      onChange={() => act("receive")}
                    />
                    Received{block.waitingOn && <> — {block.waitingOn} came through</>}, unblock it
                  </label>
                )}
              </div>
            )}

            {error && <p className="text-sm text-brand-coral">{error}</p>}

            {editable && mode === "view" && (
              <div className="flex flex-wrap gap-3">
                {status === "done" ? (
                  <button className={BUTTON} disabled={busy} onClick={() => act("reopen")}>
                    Reopen
                  </button>
                ) : (
                  <>
                    <button className={BUTTON_SOLID} disabled={busy} onClick={() => act("done")}>
                      Mark done
                    </button>
                    {!task.blocks.some((b) => b.receivedOn === null) && (
                      <button className={BUTTON} disabled={busy} onClick={() => setMode("block")}>
                        Blocked
                      </button>
                    )}
                  </>
                )}
                <button className={BUTTON} disabled={busy} onClick={() => setMode("edit")}>
                  Edit
                </button>
              </div>
            )}

            {mode === "block" && (
              <BlockForm busy={busy} today={today} onCancel={() => setMode("view")} onSubmit={(b) => act("block", b)} />
            )}

            {mode === "edit" && (
              <EditForm
                task={task}
                tags={tags}
                today={today}
                busy={busy}
                onCancel={() => setMode("view")}
                onSubmit={(body) =>
                  run(() => api<{ task: Task }>(`tasks/${taskId}/`, { method: "PATCH", body: { ...body, today } }))
                }
              />
            )}

            <History events={events} />
          </div>
        )}
      </aside>
    </div>
  );
}

function BlockForm({
  busy,
  today,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  today: string;
  onCancel: () => void;
  onSubmit: (b: { reason: string; waitingOn: string; blockedOn: string }) => void;
}) {
  const [reason, setReason] = useState("");
  const [waitingOn, setWaitingOn] = useState("");
  const [blockedOn, setBlockedOn] = useState(today);

  return (
    <form
      className="space-y-4 border border-hairline p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ reason, waitingOn, blockedOn });
      }}
    >
      <p className="font-heading text-lg">Why is it blocked?</p>
      <div>
        <label className={LABEL} htmlFor="block-reason">
          Reason
        </label>
        <textarea
          id="block-reason"
          required
          rows={2}
          className={INPUT}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Can't finish the layout without the product shots"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <div>
          <label className={LABEL} htmlFor="block-waiting">
            Waiting on
          </label>
          <input
            id="block-waiting"
            className={INPUT}
            value={waitingOn}
            onChange={(e) => setWaitingOn(e.target.value)}
            placeholder="Images from designer"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="block-since">
            Blocked since
          </label>
          <input
            id="block-since"
            type="date"
            required
            max={today}
            className={INPUT}
            value={blockedOn}
            onChange={(e) => setBlockedOn(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className={BUTTON_SOLID} disabled={busy || !reason.trim()}>
          Mark blocked
        </button>
        <button type="button" className={BUTTON} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditForm({
  task,
  tags,
  today,
  busy,
  onCancel,
  onSubmit,
}: {
  task: Task;
  tags: Tags;
  today: string;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const [brandId, setBrandId] = useState(task.brandId);
  const [sectionId, setSectionId] = useState(task.sectionId);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [reason, setReason] = useState("");

  const newDue = dueDate || null;
  const askWhy = newDue !== task.dueDate && needsSlipReason(task, newDue, today);
  const codeMoves = brandId !== task.brandId || sectionId !== task.sectionId;

  return (
    <form
      className="space-y-4 border border-hairline p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ brandId, sectionId, title, dueDate: newDue, ...(askWhy ? { reason } : {}) });
      }}
    >
      <p className="font-heading text-lg">Edit task</p>
      <div>
        <label className={LABEL} htmlFor="edit-title">
          Task
        </label>
        <input id="edit-title" required className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={LABEL}>Brand</span>
          <Combobox label="Brand" tags={tags.brands} value={brandId} onChange={setBrandId} />
        </div>
        <div>
          <span className={LABEL}>Work section</span>
          <Combobox label="Work section" tags={tags.sections} value={sectionId} onChange={setSectionId} />
        </div>
      </div>
      <div className="text-sm">
        <span className={LABEL}>Job code</span>
        {codeMoves ? (
          <JobCodePreview
            brand={tags.brands.find((t) => t.id === brandId)}
            section={tags.sections.find((t) => t.id === sectionId)}
            openedOn={task.createdOn}
          />
        ) : (
          <span className="font-heading tracking-wider">{task.jobCode ?? "—"}</span>
        )}
      </div>
      <div>
        <label className={LABEL} htmlFor="edit-due">
          Due date
        </label>
        <input id="edit-due" type="date" className={`${INPUT} w-auto`} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      {askWhy && (
        <div>
          <label className={LABEL} htmlFor="edit-why">
            This task is late — why is the date moving?
          </label>
          <textarea
            id="edit-why"
            required
            rows={2}
            className={INPUT}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      )}
      <div className="flex gap-3">
        <button type="submit" className={BUTTON_SOLID} disabled={busy || (askWhy && !reason.trim())}>
          Save
        </button>
        <button type="button" className={BUTTON} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function describe(e: TaskEvent): string {
  const day = (d: string | null) => (d ? formatDay(d) : "no date");
  switch (e.type) {
    case "created":
      return e.toValue ? `Added with job code ${e.toValue}` : "Added";
    case "edited":
      return e.note;
    case "due_changed":
      return `Due date ${day(e.fromValue)} → ${day(e.toValue)}${e.note ? ` — ${e.note}` : ""}`;
    case "job_code_changed":
      return `Job code ${e.fromValue ?? "none"} → ${e.toValue ?? "none"}`;
    case "blocked":
      return `Blocked since ${day(e.fromValue)}: ${e.note}${e.toValue ? ` (waiting on ${e.toValue})` : ""}`;
    case "received":
      return `Received${e.toValue ? ` from ${e.toValue}` : ""} — unblocked`;
    case "done":
      return "Marked done";
    case "reopened":
      return "Reopened";
  }
}

function History({ events }: { events: TaskEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section>
      <h3 className={LABEL}>History</h3>
      <ol className="mt-2 space-y-3 border-l border-hairline pl-4">
        {events.map((e) => (
          <li key={e.id} className="text-sm">
            <p>{describe(e)}</p>
            <p className="text-xs text-muted">
              {e.userName} · {new Date(e.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
