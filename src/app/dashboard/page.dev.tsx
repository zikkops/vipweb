"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/components/dashboard/api";
import Combobox from "@/components/dashboard/Combobox";
import { BUTTON, BUTTON_SOLID, INPUT, LABEL, PAGE_TITLE } from "@/components/dashboard/ui";
import { useTags, type Tags } from "@/components/dashboard/useTags";
import { BUCKETS, DATE_RE, localToday, type BucketKey, type Report } from "@/lib/dues";
import { generateJobCode } from "@/lib/jobCode";

type Row = {
  key: number;
  bucket: BucketKey;
  brandId: number | null;
  sectionId: number | null;
  task: string;
  dueDate: string;
  note: string;
  done: boolean;
};

const NOTE_HINT: Record<BucketKey, string> = {
  due_today: "Note",
  overdue: "New date and why",
  coming_up: "Note",
  blocked: "Blocked on who?",
};

let nextKey = 1;
const emptyRow = (bucket: BucketKey): Row => ({
  key: nextKey++,
  bucket,
  brandId: null,
  sectionId: null,
  task: "",
  dueDate: "",
  note: "",
  done: false,
});

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportEditor />
    </Suspense>
  );
}

function ReportEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("date");
  const date = requested && DATE_RE.test(requested) ? requested : localToday();

  const { tags, error: tagsError } = useTags();
  const [rows, setRows] = useState<Row[]>([]);
  const [asanaMatches, setAsanaMatches] = useState<boolean | null>(null);
  const [asanaFixNote, setAsanaFixNote] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [previous, setPrevious] = useState<Report | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset while the new date loads
    setLoading(true);
    setMessage(null);
    setPrevious(null);
    api<{ report: Report | null }>(`reports/?date=${date}`)
      .then(async ({ report }) => {
        if (!report) {
          const { report: prev } = await api<{ report: Report | null }>(`reports/previous/?before=${date}`);
          if (!cancelled) setPrevious(prev);
        }
        if (cancelled) return;
        setRows(
          report?.items.map((i) => ({
            key: nextKey++,
            bucket: i.bucket,
            brandId: i.brandId,
            sectionId: i.sectionId,
            task: i.task,
            dueDate: i.dueDate ?? "",
            note: i.note,
            done: i.done,
          })) ?? []
        );
        setAsanaMatches(report?.asanaMatches ?? null);
        setAsanaFixNote(report?.asanaFixNote ?? "");
        setSavedAt(report?.updatedAt ?? null);
        setDirty(false);
      })
      .catch((err) => !cancelled && setMessage({ kind: "error", text: errorMessage(err) }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date]);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function goTo(nextDate: string) {
    if (!DATE_RE.test(nextDate) || nextDate === date) return;
    if (dirty && !confirm("You have unsaved changes. Leave this date anyway?")) return;
    router.push(`/dashboard/?date=${nextDate}`);
  }

  function edit(fn: (rows: Row[]) => Row[]) {
    setRows(fn);
    setDirty(true);
    setMessage(null);
  }
  const updateRow = (key: number, patch: Partial<Row>) =>
    edit((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  // Unfinished rows from the last report, re-filed by their due date for this day.
  const carryOver = previous?.items.filter((i) => !i.done) ?? [];
  function startFromPrevious() {
    edit(() =>
      carryOver.map((i) => ({
        key: nextKey++,
        bucket:
          i.bucket === "blocked" || !i.dueDate
            ? i.bucket
            : i.dueDate < date
              ? "overdue"
              : i.dueDate === date
                ? "due_today"
                : "coming_up",
        brandId: i.brandId,
        sectionId: i.sectionId,
        task: i.task,
        dueDate: i.dueDate ?? "",
        note: i.note,
        done: false,
      }))
    );
  }

  async function save() {
    const firstBad = rows.findIndex((r) => !r.brandId || !r.sectionId || !r.task.trim());
    if (firstBad >= 0) {
      const r = rows[firstBad];
      const bucket = BUCKETS.find((b) => b.key === r.bucket)!.label;
      setMessage({ kind: "error", text: `A row in “${bucket}” needs a brand, a work section and a task.` });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const { report } = await api<{ report: Report }>("reports/", {
        method: "PUT",
        body: {
          date,
          asanaMatches,
          asanaFixNote,
          items: rows.map(({ bucket, brandId, sectionId, task, dueDate, note, done }) => ({
            bucket,
            brandId,
            sectionId,
            task,
            dueDate,
            note,
            done,
          })),
        },
      });
      setSavedAt(report.updatedAt);
      setDirty(false);
      setMessage({ kind: "ok", text: "Saved." });
    } catch (err) {
      setMessage({ kind: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  const isToday = date === localToday();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className={PAGE_TITLE}>
            Daily dues<span className="text-accent">_</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : "Not submitted yet for this date."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className={BUTTON} onClick={() => goTo(shiftDate(date, -1))} aria-label="Previous day">
            ‹
          </button>
          <input
            type="date"
            aria-label="Report date"
            className={`${INPUT} w-auto`}
            value={date}
            onChange={(e) => goTo(e.target.value)}
          />
          <button className={BUTTON} onClick={() => goTo(shiftDate(date, 1))} aria-label="Next day">
            ›
          </button>
          {!isToday && (
            <button className={BUTTON} onClick={() => goTo(localToday())}>
              Today
            </button>
          )}
        </div>
      </div>

      {tagsError && <p className="mt-6 text-sm text-brand-coral">{tagsError}</p>}

      {loading || !tags ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : (
        <>
          {rows.length === 0 && carryOver.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-accent/30 bg-accent/5 p-5">
              <p className="text-sm">
                Your last report ({previous!.date}) has {carryOver.length} unfinished{" "}
                {carryOver.length === 1 ? "row" : "rows"}. Bring them over and update what changed.
              </p>
              <button className={BUTTON_SOLID} onClick={startFromPrevious}>
                Carry over
              </button>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {BUCKETS.map((b) => (
              <BucketCard
                key={b.key}
                bucket={b.key}
                label={b.label}
                rows={rows.filter((r) => r.bucket === b.key)}
                tags={tags}
                date={date}
                onAdd={() => edit((rs) => [...rs, emptyRow(b.key)])}
                onChange={updateRow}
                onRemove={(key) => edit((rs) => rs.filter((r) => r.key !== key))}
              />
            ))}
          </div>

          <section className="mt-6 border border-hairline bg-paper p-5 sm:p-6">
            <h2 className="font-heading text-2xl">Asana</h2>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="text-sm">Board matches this table:</span>
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map((o) => (
                <label key={o.label} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="asana"
                    className="accent-accent"
                    checked={asanaMatches === o.value}
                    onChange={() => {
                      setAsanaMatches(o.value);
                      setDirty(true);
                    }}
                  />
                  {o.label}
                </label>
              ))}
            </div>
            {asanaMatches === false && (
              <div className="mt-4">
                <label className={LABEL} htmlFor="asana-fix">
                  What you fixed this morning
                </label>
                <textarea
                  id="asana-fix"
                  rows={3}
                  className={INPUT}
                  value={asanaFixNote}
                  onChange={(e) => {
                    setAsanaFixNote(e.target.value);
                    setDirty(true);
                  }}
                />
              </div>
            )}
          </section>

          <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center justify-end gap-4 border-t border-hairline bg-surface/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
            {message && (
              <p className={`text-sm ${message.kind === "ok" ? "text-accent" : "text-brand-coral"}`}>
                {message.text}
              </p>
            )}
            {dirty && !message && <p className="text-sm text-muted">Unsaved changes</p>}
            <button className={BUTTON_SOLID} onClick={save} disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save report"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BucketCard({
  bucket,
  label,
  rows,
  tags,
  date,
  onAdd,
  onChange,
  onRemove,
}: {
  bucket: BucketKey;
  label: string;
  rows: Row[];
  tags: Tags;
  date: string;
  onAdd: () => void;
  onChange: (key: number, patch: Partial<Row>) => void;
  onRemove: (key: number) => void;
}) {
  const grid =
    "lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_7rem_minmax(0,1.6fr)_9.5rem_minmax(0,1.4fr)_3rem_2rem] lg:gap-3";

  return (
    <section className="border border-hairline bg-paper p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl">
          {label} <span className="text-muted">({rows.length})</span>
        </h2>
        <button className={BUTTON} onClick={onAdd}>
          + Add row
        </button>
      </div>

      {rows.length > 0 && (
        <div className="mt-5">
          <div className={`hidden ${grid} border-b border-hairline pb-2 ${LABEL} mb-0`}>
            <span>Brand</span>
            <span>Work section</span>
            <span>Job code</span>
            <span>Task</span>
            <span>Due date</span>
            <span>Note</span>
            <span>Done</span>
            <span />
          </div>

          {rows.map((row) => {
            const jobCode = generateJobCode(
              tags.brands.find((t) => t.id === row.brandId),
              tags.sections.find((t) => t.id === row.sectionId),
              date
            );
            return (
              <div
                key={row.key}
                className={`grid grid-cols-1 gap-3 border-b border-hairline py-4 last:border-0 sm:grid-cols-2 ${grid} lg:items-start lg:py-3 ${
                  row.done ? "opacity-50" : ""
                }`}
              >
                <Field label="Brand">
                  <Combobox
                    label="Brand"
                    tags={tags.brands}
                    value={row.brandId}
                    onChange={(id) => onChange(row.key, { brandId: id })}
                    placeholder="Search brand…"
                  />
                </Field>
                <Field label="Work section">
                  <Combobox
                    label="Work section"
                    tags={tags.sections}
                    value={row.sectionId}
                    onChange={(id) => onChange(row.key, { sectionId: id })}
                    placeholder="Website, branding…"
                  />
                </Field>
                <Field label="Job code">
                  <div
                    className="truncate border border-transparent py-2 text-sm text-muted-light"
                    title="Generated automatically once the rules are set"
                  >
                    {jobCode ?? "Auto"}
                  </div>
                </Field>
                <Field label="Task" className="sm:col-span-2 lg:col-span-1">
                  <input
                    aria-label="Task"
                    className={INPUT}
                    value={row.task}
                    onChange={(e) => onChange(row.key, { task: e.target.value })}
                  />
                </Field>
                <Field label="Due date">
                  <input
                    type="date"
                    aria-label="Due date"
                    className={INPUT}
                    value={row.dueDate}
                    onChange={(e) => onChange(row.key, { dueDate: e.target.value })}
                  />
                </Field>
                <Field label="Note" className="sm:col-span-2 lg:col-span-1">
                  <textarea
                    aria-label="Note"
                    rows={1}
                    className={`${INPUT} field-sizing-content resize-none`}
                    placeholder={NOTE_HINT[bucket]}
                    value={row.note}
                    onChange={(e) => onChange(row.key, { note: e.target.value })}
                  />
                </Field>
                <label className="flex cursor-pointer items-center gap-2 py-2 text-sm lg:justify-center">
                  <input
                    type="checkbox"
                    className="size-4 accent-accent"
                    checked={row.done}
                    onChange={(e) => onChange(row.key, { done: e.target.checked })}
                  />
                  <span className="lg:sr-only">Done</span>
                </label>
                <button
                  onClick={() => onRemove(row.key)}
                  aria-label="Remove row"
                  className="justify-self-start py-2 text-sm text-muted hover:text-brand-coral lg:justify-self-center"
                >
                  <span className="lg:hidden">Remove row</span>
                  <span className="hidden text-lg leading-none lg:inline">×</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <span className={`${LABEL} lg:hidden`}>{label}</span>
      {children}
    </div>
  );
}
