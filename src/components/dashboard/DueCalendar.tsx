"use client";

import { useState } from "react";
import { BOARD_STATUSES, localToday, type BoardItem, type BoardStatus } from "@/lib/dues";
import BoardTable, { BoardFilters, applyFilter, useBoard, type BoardFilter } from "./BoardTable";
import { STATUS_STYLE, addDays, formatDay } from "./board";
import { BUTTON } from "./ui";
import type { Tags } from "./useTags";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ORDER: BoardStatus[] = BOARD_STATUSES.map((s) => s.key);
const MAX_CHIPS = 3;

/** Month view of due dates, colored by where each row stands today. */
export default function DueCalendar({ tags }: { tags: Tags }) {
  const today = localToday();
  const [month, setMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [selected, setSelected] = useState<string | null>(today);
  const [filter, setFilter] = useState<BoardFilter>({ userId: null, brandId: null });
  const { board, error } = useBoard(today);

  const brand = (id: number) => tags.brands.find((t) => t.id === id)?.name ?? "—";

  const items = board ? applyFilter(board.items, filter) : [];
  const byDay = new Map<string, BoardItem[]>();
  for (const item of items) {
    if (!item.dueDate) continue;
    const list = byDay.get(item.dueDate) ?? [];
    list.push(item);
    byDay.set(item.dueDate, list);
  }
  for (const list of byDay.values()) list.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  const undated = items.filter((i) => !i.dueDate && i.status !== "done");

  // Six weeks starting on the Monday on or before the 1st.
  const first = `${month}-01`;
  const offset = (new Date(`${first}T12:00:00`).getDay() + 6) % 7;
  const start = addDays(first, -offset);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const lastWeekNeeded = days.slice(35).some((d) => d.startsWith(month));
  const visibleDays = lastWeekNeeded ? days : days.slice(0, 35);

  const monthItems = items.filter((i) => i.dueDate?.startsWith(month));
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

      {error && <p className="mt-6 text-sm text-brand-coral">{error}</p>}
      {!board && !error && <p className="py-16 text-center text-sm text-muted">Loading…</p>}

      {board && (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <BoardFilters board={board} tags={tags} filter={filter} onChange={setFilter} />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {BOARD_STATUSES.map((s) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${STATUS_STYLE[s.key].dot}`} />
                  {s.label}
                  <span className="text-muted">{monthItems.filter((i) => i.status === s.key).length}</span>
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
                const isToday = day === today;
                const isSelected = day === selected;
                return (
                  <button
                    key={day}
                    onClick={() => setSelected(isSelected ? null : day)}
                    aria-pressed={isSelected}
                    aria-label={`${formatDay(day, { weekday: "long", day: "numeric", month: "long" })}, ${list.length} due`}
                    className={`flex min-h-16 flex-col gap-1 border-b border-r border-hairline p-1.5 text-left align-top transition-colors sm:min-h-28 ${
                      inMonth ? "" : "bg-surface/60"
                    } ${isSelected ? "outline-2 -outline-offset-2 outline-ink" : "hover:bg-surface"}`}
                  >
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                        isToday ? "bg-ink text-paper" : inMonth ? "text-ink" : "text-muted-light"
                      }`}
                    >
                      {Number(day.slice(8))}
                    </span>

                    {/* Phones: one dot per status present. */}
                    {list.length > 0 && (
                      <span className="flex flex-wrap gap-1 sm:hidden">
                        {ORDER.filter((s) => list.some((i) => i.status === s)).map((s) => (
                          <span key={s} className={`size-2 rounded-full ${STATUS_STYLE[s].dot}`} />
                        ))}
                      </span>
                    )}

                    {/* Larger screens: the first few rows by name. */}
                    <span className="hidden w-full flex-col gap-1 sm:flex">
                      {list.slice(0, MAX_CHIPS).map((i) => (
                        <span
                          key={i.id}
                          title={`${i.userName} · ${brand(i.brandId)} · ${i.task}`}
                          className={`block truncate border-l-2 px-1.5 py-0.5 text-[11px] leading-tight ${STATUS_STYLE[i.status].chip}`}
                        >
                          {brand(i.brandId)} · {i.task}
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
              {undated.length} open {undated.length === 1 ? "row has" : "rows have"} no due date and can’t be placed on
              the calendar — see the daily sheet.
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
                  <BoardTable items={dayItems} tags={tags} today={today} />
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
