"use client";

import { useState } from "react";
import { localToday } from "@/lib/dues";
import type { Task } from "@/lib/tasks";
import { createTask, errorMessage } from "../db";
import Combobox from "../Combobox";
import { BUTTON_SOLID, INPUT, LABEL } from "../ui";
import type { Tags } from "../useTags";
import JobCodeFields, { useJobCodes } from "./JobCodeFields";

/** One row: client, type of work, task, due date → Add. The job code is generated as you type. */
export default function QuickAdd({ tags, onAdded }: { tags: Tags; onAdded: (task: Task) => void }) {
  const [brandId, setBrandId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [parentCode, setParentCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { codes, reload: reloadCodes } = useJobCodes();

  const today = localToday();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId || !sectionId || !title.trim()) {
      setError("Pick a client and a type of work, and name the task.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const task = await createTask(tags, { brandId, sectionId, title, description, dueDate: dueDate || null, today, parentCode });
      onAdded(task);
      // Keep client and type: people usually add several tasks for one client.
      setTitle("");
      setDescription("");
      setDueDate("");
      setParentCode(null);
      reloadCodes();
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
          <span className={LABEL}>Client</span>
          <Combobox label="Client" tags={tags.brands} value={brandId} onChange={setBrandId} placeholder="Search client…" />
        </div>
        <div>
          <span className={LABEL}>Type of work</span>
          <Combobox
            label="Type of work"
            tags={tags.sections}
            value={sectionId}
            onChange={setSectionId}
            placeholder="Pick a type…"
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

      <div className="mt-3">
        <label className={LABEL} htmlFor="quick-description">
          Description <span className="normal-case tracking-normal text-muted-light">(optional, not part of the job code)</span>
        </label>
        <textarea
          id="quick-description"
          rows={2}
          maxLength={2000}
          className={INPUT}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Anything that clarifies the task: what exactly, for whom, where the files are…"
        />
      </div>

      <div className="mt-4">
        <JobCodeFields
          tags={tags}
          brandId={brandId}
          sectionId={sectionId}
          title={title}
          openedAt={new Date()}
          parentCode={parentCode}
          codes={codes}
          onParent={(parent) => {
            setParentCode(parent?.code ?? null);
            if (parent) {
              setBrandId(parent.brandId);
              setSectionId(parent.sectionId);
            }
          }}
        />
      </div>
      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
    </form>
  );
}
