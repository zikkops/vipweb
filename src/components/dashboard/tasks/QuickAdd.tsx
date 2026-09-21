"use client";

import { useState } from "react";
import { localToday } from "@/lib/dues";
import type { Task } from "@/lib/tasks";
import { api, errorMessage } from "../api";
import Combobox from "../Combobox";
import { BUTTON_SOLID, INPUT, LABEL } from "../ui";
import type { Tags } from "../useTags";
import JobCodePreview from "./JobCodePreview";

/** One row: brand, section, task, due date → Add. The job code updates as you pick. */
export default function QuickAdd({ tags, onAdded }: { tags: Tags; onAdded: (task: Task) => void }) {
  const [brandId, setBrandId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const today = localToday();
  const brand = tags.brands.find((t) => t.id === brandId);
  const section = tags.sections.find((t) => t.id === sectionId);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId || !sectionId || !title.trim()) {
      setError("Pick a brand and a work section, and name the task.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { task } = await api<{ task: Task }>("tasks/", {
        method: "POST",
        body: { brandId, sectionId, title, dueDate: dueDate || null, today },
      });
      onAdded(task);
      // Keep brand and section: people usually add several tasks for one job.
      setTitle("");
      setDueDate("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={add} className="border border-hairline bg-paper p-5 sm:p-6">
      <h2 className="font-heading text-2xl">Add a task</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.8fr)_10rem_auto] lg:items-end">
        <div>
          <span className={LABEL}>Brand</span>
          <Combobox label="Brand" tags={tags.brands} value={brandId} onChange={setBrandId} placeholder="Search brand…" />
        </div>
        <div>
          <span className={LABEL}>Work section</span>
          <Combobox
            label="Work section"
            tags={tags.sections}
            value={sectionId}
            onChange={setSectionId}
            placeholder="Website, branding…"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={LABEL} htmlFor="quick-title">
            Task
          </label>
          <input
            id="quick-title"
            className={INPUT}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="quick-due">
            Due date
          </label>
          <input
            id="quick-due"
            type="date"
            className={INPUT}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" className={BUTTON_SOLID} disabled={busy}>
          {busy ? "Adding…" : "Add"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
        <span className="font-heading text-xs uppercase tracking-widest text-muted">Job code</span>
        <JobCodePreview brand={brand} section={section} openedOn={today} />
      </div>
      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
    </form>
  );
}
