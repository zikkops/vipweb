"use client";

import { useState } from "react";
import { localToday } from "@/lib/dues";
import { addDays } from "@/lib/tasks";
import { REPORT_DATE_BY, reportFileName, reportRows, type ReportDateBy, type ReportFilter } from "@/lib/report";
import type { Task } from "@/lib/tasks";
import { formatDay } from "./board";
import { downloadExcel, downloadPdf, type ReportInfo } from "./reportFiles";
import { BUTTON, BUTTON_SOLID, INPUT, LABEL } from "./ui";
import type { Tags } from "./useTags";

type Option<Id> = { id: Id; label: string };

/** First and last day of the month `day` is in. */
function monthOf(day: string) {
  const next = new Date(`${day.slice(0, 7)}-01T12:00:00`);
  next.setMonth(next.getMonth() + 1);
  return { from: `${day.slice(0, 7)}-01`, to: addDays(`${next.toLocaleDateString("en-CA").slice(0, 7)}-01`, -1) };
}

/**
 * The admin Reporting tab: export a task report as Excel or PDF for a time
 * frame (this month to start with), by due, added or done date, optionally
 * for some employees, clients and types of work (none ticked = all).
 */
export default function ReportExport({
  tasks,
  people,
  tags,
}: {
  tasks: Task[];
  people: { id: string; name: string }[];
  tags: Tags;
}) {
  const [from, setFrom] = useState(() => monthOf(localToday()).from);
  const [to, setTo] = useState(() => monthOf(localToday()).to);
  const [dateBy, setDateBy] = useState<ReportDateBy>("due");
  const [userIds, setUserIds] = useState<string[]>([]);
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [sectionIds, setSectionIds] = useState<number[]>([]);
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);
  const [error, setError] = useState("");

  const filter: ReportFilter = { from, to, dateBy, userIds, brandIds, sectionIds };
  const validRange = !!from && !!to && from <= to;
  const rows = validRange ? reportRows(tasks, tags, filter, localToday()) : [];

  const names = <Id,>(options: Option<Id>[], ids: Id[]) =>
    ids.length ? options.filter((o) => ids.includes(o.id)).map((o) => o.label).join(", ") : "all";
  const peopleOptions = people.map((p) => ({ id: p.id, label: p.name }));
  const clientOptions = tags.brands.filter((t) => t.active || brandIds.includes(t.id)).map((t) => ({ id: t.id, label: t.name }));
  const typeOptions = tags.sections.filter((t) => t.active || sectionIds.includes(t.id)).map((t) => ({ id: t.id, label: t.name }));

  async function download(kind: "excel" | "pdf") {
    const day = (d: string) => formatDay(d, { day: "numeric", month: "short", year: "numeric" });
    const info: ReportInfo = {
      fileName: reportFileName(filter),
      period: `${REPORT_DATE_BY.find((d) => d.key === dateBy)!.label} ${day(from)} – ${day(to)}`,
      filters: [
        `Employees: ${names(peopleOptions, userIds)}`,
        `Clients: ${names(clientOptions, brandIds)}`,
        `Types of work: ${names(typeOptions, sectionIds)}`,
      ],
    };
    setBusy(kind);
    setError("");
    try {
      await (kind === "excel" ? downloadExcel(rows, info) : downloadPdf(rows, info));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The export failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="border border-hairline bg-paper p-5 sm:p-6">
      <h2 className="font-heading text-2xl">Export a task report</h2>
      <p className="mt-1 text-sm text-muted">Pick a time frame and who or what it covers, then download it as Excel or PDF.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[repeat(3,minmax(0,12rem))]">
        <div>
          <label className={LABEL} htmlFor="report-from">
            From
          </label>
          <input id="report-from" type="date" className={INPUT} value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className={LABEL} htmlFor="report-to">
            To
          </label>
          <input id="report-to" type="date" className={INPUT} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className={LABEL} htmlFor="report-date-by">
            Tasks by
          </label>
          <select
            id="report-date-by"
            className={INPUT}
            value={dateBy}
            onChange={(e) => setDateBy(e.target.value as ReportDateBy)}
          >
            {REPORT_DATE_BY.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <CheckList title="Employees" options={peopleOptions} selected={userIds} onChange={setUserIds} />
        <CheckList title="Clients" options={clientOptions} selected={brandIds} onChange={setBrandIds} />
        <CheckList title="Types of work" options={typeOptions} selected={sectionIds} onChange={setSectionIds} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="mr-auto text-sm">
          {validRange ? (
            <>
              <span className="font-heading text-lg">{rows.length}</span> {rows.length === 1 ? "task matches" : "tasks match"}
            </>
          ) : (
            <span className="text-brand-coral">Pick a start date on or before the end date.</span>
          )}
        </p>
        <button className={BUTTON_SOLID} disabled={!rows.length || !!busy} onClick={() => download("excel")}>
          {busy === "excel" ? "Exporting…" : "Export Excel"}
        </button>
        <button className={BUTTON} disabled={!rows.length || !!busy} onClick={() => download("pdf")}>
          {busy === "pdf" ? "Exporting…" : "Export PDF"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
    </section>
  );
}

/** Tick any number of options; none ticked means all. Long lists get a search box. */
function CheckList<Id extends string | number>({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: Option<Id>[];
  selected: Id[];
  onChange: (ids: Id[]) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const toggle = (id: Id) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <fieldset className="min-w-0">
      <legend className={`${LABEL} flex w-full items-baseline justify-between`}>
        <span>
          {title} <span className="normal-case tracking-normal text-muted-light">({selected.length ? `${selected.length} picked` : "all"})</span>
        </span>
        {selected.length > 0 && (
          <button type="button" className="normal-case tracking-normal hover:text-accent" onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </legend>
      {options.length > 8 && (
        <input
          aria-label={`Search ${title.toLowerCase()}`}
          className={`${INPUT} mb-2`}
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="max-h-48 overflow-auto border border-hairline p-2">
        {visible.length === 0 && <p className="px-1 py-1 text-sm text-muted">Nothing here.</p>}
        {visible.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-center gap-2 px-1 py-1 text-sm hover:bg-surface">
            <input type="checkbox" className="accent-accent" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
