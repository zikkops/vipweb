"use client";

import { useEffect, useState } from "react";
import { BOARD_STATUSES, type Board, type BoardItem } from "@/lib/dues";
import { api, errorMessage } from "./api";
import { STATUS_STYLE, daysBetween, formatDay } from "./board";
import { INPUT, LABEL } from "./ui";
import type { Tags } from "./useTags";

const label = (status: BoardItem["status"]) => BOARD_STATUSES.find((s) => s.key === status)!.label;

function timing(item: BoardItem, today: string) {
  if (!item.dueDate) return "No due date";
  const days = daysBetween(today, item.dueDate);
  if (item.status === "done") return `Due ${formatDay(item.dueDate)}`;
  if (days === 0) return "Today";
  if (days < 0) return `${-days} ${days === -1 ? "day" : "days"} late`;
  return `In ${days} ${days === 1 ? "day" : "days"}`;
}

export default function BoardTable({ items, tags, today }: { items: BoardItem[]; tags: Tags; today: string }) {
  const brand = (id: number) => tags.brands.find((t) => t.id === id)?.name ?? "—";
  const section = (id: number) => tags.sections.find((t) => t.id === id)?.name ?? "—";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-hairline font-heading text-xs uppercase tracking-widest text-muted">
            <th className="py-2 pr-4 font-normal">Status</th>
            <th className="py-2 pr-4 font-normal">Who</th>
            <th className="py-2 pr-4 font-normal">Brand / section</th>
            <th className="py-2 pr-4 font-normal">Job code</th>
            <th className="py-2 pr-4 font-normal">Task</th>
            <th className="py-2 pr-4 font-normal">Due date</th>
            <th className="py-2 font-normal">Note</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const style = STATUS_STYLE[item.status];
            return (
              <tr key={item.id} className="border-b border-hairline align-top last:border-0">
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-2 font-medium ${style.text}`}>
                    <span className={`size-2 rounded-full ${style.dot}`} />
                    {label(item.status)}
                  </span>
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">{item.userName}</td>
                <td className="py-2.5 pr-4">
                  {brand(item.brandId)}
                  <span className="block text-muted">{section(item.sectionId)}</span>
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {item.jobCode ?? <span className="text-muted-light">Auto</span>}
                </td>
                <td className={`py-2.5 pr-4 ${item.status === "done" ? "line-through decoration-muted" : ""}`}>
                  {item.task}
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {item.dueDate ? formatDay(item.dueDate) : "—"}
                  <span className={`block text-xs ${item.status === "overdue" ? style.text : "text-muted"}`}>
                    {timing(item, today)}
                  </span>
                </td>
                <td className="py-2.5 whitespace-pre-line">
                  {item.note || <span className="text-muted-light">—</span>}
                  {item.reportDate !== today && item.status !== "done" && (
                    <span className="block text-xs text-muted">From report of {formatDay(item.reportDate)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- data + filters shared by the sheet and the calendar -----------------------

export function useBoard(date: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear while the new date loads
    setError("");
    api<Board>(`admin/board/?date=${date}`)
      .then((b) => !cancelled && setBoard(b))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [date]);

  // Keep showing the previous day's board until the new one arrives, so the
  // page doesn't jump while clicking through dates.
  return { board, error, loading: board?.date !== date };
}

export type BoardFilter = { userId: number | null; brandId: number | null };

export function applyFilter(items: BoardItem[], f: BoardFilter) {
  return items.filter((i) => (!f.userId || i.userId === f.userId) && (!f.brandId || i.brandId === f.brandId));
}

export function BoardFilters({
  board,
  tags,
  filter,
  onChange,
}: {
  board: Board;
  tags: Tags;
  filter: BoardFilter;
  onChange: (f: BoardFilter) => void;
}) {
  // Only offer brands that actually appear on the board.
  const used = new Set(board.items.map((i) => i.brandId));
  const brands = tags.brands.filter((b) => used.has(b.id));

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className={LABEL} htmlFor="board-person">
          Person
        </label>
        <select
          id="board-person"
          className={`${INPUT} w-auto min-w-44`}
          value={filter.userId ?? ""}
          onChange={(e) => onChange({ ...filter, userId: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Everyone</option>
          {board.people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={LABEL} htmlFor="board-brand">
          Brand
        </label>
        <select
          id="board-brand"
          className={`${INPUT} w-auto min-w-44`}
          value={filter.brandId ?? ""}
          onChange={(e) => onChange({ ...filter, brandId: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
