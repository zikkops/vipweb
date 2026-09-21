"use client";

import { useState } from "react";
import { localToday } from "@/lib/dues";
import { TASK_STATUSES, addDays, taskStatus, type Task, type TaskStatus } from "@/lib/tasks";
import BoardTable, { BoardFilters, applyFilter, type BoardFilter } from "./BoardTable";
import { STATUS_STYLE, formatDay } from "./board";
import { BUTTON } from "./ui";
import type { Tags } from "./useTags";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ORDER: TaskStatus[] = TASK_STATUSES.map((s) => s.key);
const MAX_CHIPS = 3;

/** Month view of due dates, colored by where each task stands today. */
export default function DueCalendar({
  tasks,
  people,
  tags,
  onOpen,
}: {
  tasks: Task[];
  people: { id: number; name: string }[];
  tags: Tags;
  onOpen: (task: Task) => void;
}) {
  const today = localToday();
  const [month, setMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [selected, setSelected] = useState<string | null>(today);
  const [filter, setFilter] = useState<BoardFilter>({ userId: null, brandId: null });

  const brand = (id: number) => tags.brands.find((t) => t.id === id)?.name ?? "—";
  const status = (t: Task) => taskStatus(t, today);

  const items = applyFilter(tasks, filter);
  const byDay = new Map<string, Task[]>();
  for (const task of items) {
    if (!task.dueDate) continue;
    const list = byDay.get(task.dueDate) ?? [];
    list.push(task);
    byDay.set(task.dueDate, list);
  }
  for (const list of byDay.values()) list.sort((a, b) => ORDER.indexOf(status(a)) - ORDER.indexOf(status(b)));
  const undated = items.filter((t) => !t.dueDate && status(t) !== "done");

  // Weeks starting on the Monday on or before the 1st.
  const first = `${month}-01`;
  const offset = (new Date(`${first}T12:00:00`).getDay() + 6) % 7;
  const start = addDays(first, -offset);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const visibleDays = days.slice(35).some((d) => d.startsWith(month)) ? days : days.slice(0, 35);

  const monthItems = items.filter((t) => t.dueDate?.startsWith(month));
  const shiftMonth = (delta: number) => {
    const d = new Date(`${first}T12:00:00`);
    d.setMonth(d.getMonth() + delta);
    setMonth(d.toLocaleDateString("en-CA").slice(0, 7));
  };
  const dayItems = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <p className="font-heading text-3xl">{formatDay(first, { month: "long", year: "numeric" })}</p>
        <div className="flex items-center gap-2">
          <button className={BUTTON} onClick={() => shiftMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          {month !== today.slice(0, 7) && (
            <button
              className={BUTTON}
              onClick={() => {
                setMonth(today.slice(0, 7));
                setSelected(today);
              }}
            >
              This month
            </button>
          )}
          <button className={BUTTON} onClick={() => shiftMonth(1)} aria-label="Next month">
            ›
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <BoardFilters tasks={tasks} people={people} tags={tags} filter={filter} onChange={setFilter} />
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {TASK_STATUSES.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${STATUS_STYLE[s.key].dot}`} />
              {s.label}
              <span className="text-muted">{monthItems.filter((t) => status(t) === s.key).length}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-l border-t border-hairline bg-paper">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="border-b border-r border-hairline px-2 py-2 font-heading text-xs uppercase tracking-widest text-muted"
            >
              {d}
            </div>
          ))}
          {visibleDays.map((day) => {
            const list = byDay.get(day) ?? [];
            const inMonth = day.startsWith(month);
            const isSelected = day === selected;
            return (
              <button
                key={day}
                onClick={() => setSelected(isSelected ? null : day)}
                aria-pressed={isSelected}
                aria-label={`${formatDay(day, { weekday: "long", day: "numeric", month: "long" })}, ${list.length} due`}
                className={`flex min-h-16 flex-col gap-1 border-b border-r border-hairline p-1.5 text-left transition-colors sm:min-h-28 ${
                  inMonth ? "" : "bg-surface/60"
                } ${isSelected ? "outline-2 -outline-offset-2 outline-ink" : "hover:bg-surface"}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                    day === today ? "bg-ink text-paper" : inMonth ? "text-ink" : "text-muted-light"
                  }`}
                >
                  {Number(day.slice(8))}
                </span>

                {/* Phones: one dot per status present. */}
                {list.length > 0 && (
                  <span className="flex flex-wrap gap-1 sm:hidden">
                    {ORDER.filter((s) => list.some((t) => status(t) === s)).map((s) => (
                      <span key={s} className={`size-2 rounded-full ${STATUS_STYLE[s].dot}`} />
                    ))}
                  </span>
                )}

                {/* Larger screens: the first few tasks by name. */}
                <span className="hidden w-full flex-col gap-1 sm:flex">
                  {list.slice(0, MAX_CHIPS).map((t) => (
                    <span
                      key={t.id}
                      title={`${t.userName} · ${brand(t.brandId)} · ${t.title}`}
                      className={`block truncate border-l-2 px-1.5 py-0.5 text-[11px] leading-tight ${STATUS_STYLE[status(t)].chip}`}
                    >
                      {brand(t.brandId)} · {t.title}
                    </span>
                  ))}
                  {list.length > MAX_CHIPS && (
                    <span className="px-1.5 text-[11px] text-muted">+{list.length - MAX_CHIPS} more</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {undated.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          {undated.length} open {undated.length === 1 ? "task has" : "tasks have"} no due date and can’t be placed on the
          calendar — see the daily sheet.
        </p>
      )}

      {selected && (
        <section className="mt-6 border border-hairline bg-paper p-5 sm:p-6">
          <h2 className="font-heading text-2xl">
            Due {formatDay(selected, { weekday: "long", day: "numeric", month: "long" })}{" "}
            <span className="text-muted">({dayItems.length})</span>
          </h2>
          {dayItems.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing due.</p>
          ) : (
            <div className="mt-4">
              <BoardTable tasks={dayItems} tags={tags} day={today} onOpen={onOpen} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
