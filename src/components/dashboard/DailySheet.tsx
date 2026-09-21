"use client";

import { useState } from "react";
import { BOARD_STATUSES, localToday, type BoardStatus } from "@/lib/dues";
import BoardTable, { BoardFilters, applyFilter, useBoard, type BoardFilter } from "./BoardTable";
import { STATUS_STYLE, addDays, formatDay } from "./board";
import { BUTTON, INPUT } from "./ui";
import type { Tags } from "./useTags";

/** Everyone's work for one day, grouped late → today → blocked → coming up → done. */
export default function DailySheet({ tags }: { tags: Tags }) {
  const [date, setDate] = useState(localToday());
  const [filter, setFilter] = useState<BoardFilter>({ userId: null, brandId: null });
  const [only, setOnly] = useState<BoardStatus | null>(null);
  const { board, error, loading } = useBoard(date);

  const isToday = date === localToday();

  // "Done" on a daily sheet means ticked off in that day's reports; older
  // finished work lives on the calendar.
  const items = board
    ? applyFilter(board.items, filter).filter((i) => i.status !== "done" || i.reportDate === date)
    : [];
  const byStatus = (s: BoardStatus) => items.filter((i) => i.status === s);
  const missing = board?.people.filter((p) => p.latestReport !== date && (!filter.userId || p.id === filter.userId)) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-heading text-3xl">{formatDay(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          {loading && <p className="text-sm text-muted">Loading…</p>}
        </div>
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
          {!isToday && (
            <button className={BUTTON} onClick={() => setDate(localToday())}>
              Today
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-brand-coral">{error}</p>}

      {board && (
        <>
          <div className="mt-6">
            <BoardFilters board={board} tags={tags} filter={filter} onChange={setFilter} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {BOARD_STATUSES.map((s) => {
              const style = STATUS_STYLE[s.key];
              const active = only === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setOnly(active ? null : s.key)}
                  aria-pressed={active}
                  className={`border p-4 text-left transition ${style.card} ${
                    only && !active ? "opacity-40" : ""
                  } ${active ? "ring-2 ring-ink/70" : "hover:brightness-95"}`}
                >
                  <span className={`flex items-center gap-2 font-heading text-sm uppercase tracking-widest ${style.text}`}>
                    <span className={`size-2 rounded-full ${style.dot}`} />
                    {s.label}
                  </span>
                  <span className={`mt-1 block font-heading text-4xl ${style.text}`}>{byStatus(s.key).length}</span>
                </button>
              );
            })}
          </div>

          {missing.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              <span className="text-ink">No report for this day:</span>{" "}
              {missing
                .map((p) => `${p.name} (${p.latestReport ? `last ${formatDay(p.latestReport)}` : "never"})`)
                .join(", ")}
              . Their rows below come from their last report.
            </p>
          )}

          <div className="mt-8 space-y-6">
            {BOARD_STATUSES.filter((s) => !only || s.key === only).map((s) => {
              const rows = byStatus(s.key);
              return (
                <section key={s.key} className="border border-hairline bg-paper p-5 sm:p-6">
                  <h2 className={`flex items-center gap-3 font-heading text-2xl ${STATUS_STYLE[s.key].text}`}>
                    <span className={`size-3 rounded-full ${STATUS_STYLE[s.key].dot}`} />
                    {s.label} <span className="text-muted">({rows.length})</span>
                  </h2>
                  {rows.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">Nothing.</p>
                  ) : (
                    <div className="mt-4">
                      <BoardTable items={rows} tags={tags} today={date} />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
