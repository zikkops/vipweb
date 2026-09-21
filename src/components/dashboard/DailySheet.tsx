"use client";

import { useEffect, useState } from "react";
import { localToday } from "@/lib/dues";
import { TASK_STATUSES, addDays, taskStatus, type Checkin, type Task, type TaskStatus } from "@/lib/tasks";
import { api } from "./api";
import BoardTable, { BoardFilters, applyFilter, type BoardFilter } from "./BoardTable";
import { STATUS_STYLE, formatDay } from "./board";
import { BUTTON, INPUT } from "./ui";
import type { Tags } from "./useTags";

type Person = { userId: number; name: string; checkin: Checkin | null };

/**
 * Everyone's tasks as they stood on one day, grouped
 * overdue → due today → blocked → coming up → done that day.
 */
export default function DailySheet({
  tasks,
  tags,
  onOpen,
}: {
  tasks: Task[];
  tags: Tags;
  onOpen: (task: Task) => void;
}) {
  const [date, setDate] = useState(localToday());
  const [filter, setFilter] = useState<BoardFilter>({ userId: null, brandId: null });
  const [only, setOnly] = useState<TaskStatus | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ people: Person[] }>(`admin/checkins/?date=${date}`)
      .then((r) => !cancelled && setPeople(r.people))
      .catch(() => !cancelled && setPeople([]));
    return () => {
      cancelled = true;
    };
  }, [date]);

  // Tasks that existed that day; finished ones only on the day they were done.
  const visible = applyFilter(tasks, filter).filter(
    (t) => t.createdOn <= date && (t.doneOn === null || t.doneOn >= date)
  );
  const byStatus = (s: TaskStatus) => visible.filter((t) => taskStatus(t, date) === s);
  const missing = (people ?? []).filter((p) => !p.checkin && (!filter.userId || p.userId === filter.userId));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <p className="font-heading text-3xl">
          {formatDay(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-2">
          <button className={BUTTON} onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
            ‹
          </button>
          <input
            type="date"
            aria-label="Sheet date"
            className={`${INPUT} w-auto`}
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
          <button className={BUTTON} onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
            ›
          </button>
          {date !== localToday() && (
            <button className={BUTTON} onClick={() => setDate(localToday())}>
              Today
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <BoardFilters
          tasks={tasks}
          people={(people ?? []).map((p) => ({ id: p.userId, name: p.name }))}
          tags={tags}
          filter={filter}
          onChange={setFilter}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TASK_STATUSES.map((s) => {
          const style = STATUS_STYLE[s.key];
          const active = only === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setOnly(active ? null : s.key)}
              aria-pressed={active}
              className={`border p-4 text-left transition ${style.card} ${only && !active ? "opacity-40" : ""} ${
                active ? "ring-2 ring-ink/70" : "hover:brightness-95"
              }`}
            >
              <span className={`flex items-center gap-2 font-heading text-sm uppercase tracking-widest ${style.text}`}>
                <span className={`size-2 rounded-full ${style.dot}`} />
                {s.key === "done" ? "Done that day" : s.label}
              </span>
              <span className={`mt-1 block font-heading text-4xl ${style.text}`}>{byStatus(s.key).length}</span>
            </button>
          );
        })}
      </div>

      {missing.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          <span className="text-ink">No check-in for this day:</span> {missing.map((p) => p.name).join(", ")}.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {TASK_STATUSES.filter((s) => !only || s.key === only).map((s) => {
          const rows = byStatus(s.key);
          return (
            <section key={s.key} className="border border-hairline bg-paper p-5 sm:p-6">
              <h2 className={`flex items-center gap-3 font-heading text-2xl ${STATUS_STYLE[s.key].text}`}>
                <span className={`size-3 rounded-full ${STATUS_STYLE[s.key].dot}`} />
                {s.key === "done" ? "Done that day" : s.label} <span className="text-muted">({rows.length})</span>
              </h2>
              {rows.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Nothing.</p>
              ) : (
                <div className="mt-4">
                  <BoardTable tasks={rows} tags={tags} day={date} onOpen={onOpen} />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
