import type { TaskStatus } from "@/lib/tasks";

/**
 * One color per status, used by the daily sheet, calendar and legend alike.
 * Red for late, purple for today, amber for blocked, blue for what is coming
 * and green for done — so a glance at the calendar reads the same as the sheet.
 */
export const STATUS_STYLE: Record<TaskStatus, { dot: string; chip: string; card: string; text: string }> = {
  overdue: {
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 border-l-red-500",
    card: "border-red-200 bg-red-50",
    text: "text-red-700",
  },
  due_today: {
    dot: "bg-accent",
    chip: "bg-violet-50 text-accent border-l-accent",
    card: "border-violet-200 bg-violet-50",
    text: "text-accent",
  },
  blocked: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-800 border-l-amber-500",
    card: "border-amber-200 bg-amber-50",
    text: "text-amber-800",
  },
  coming_up: {
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-800 border-l-sky-500",
    card: "border-sky-200 bg-sky-50",
    text: "text-sky-800",
  },
  done: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-800 border-l-emerald-500 line-through decoration-emerald-800/40",
    card: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-800",
  },
};

export function formatDay(date: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, opts);
}
