"use client";

import { TASK_STATUSES, activeBlock, taskStatus, type Task } from "@/lib/tasks";
import { STATUS_STYLE, formatDay } from "./board";
import { StatusDot, timing } from "./tasks/TaskGroups";
import { INPUT, LABEL } from "./ui";
import type { Tags } from "./useTags";

const label = (task: Task, day: string) => TASK_STATUSES.find((s) => s.key === taskStatus(task, day))!.label;

/** Everyone's tasks in one table, as they stood on `day`. Rows open the task. */
export default function BoardTable({
  tasks,
  tags,
  day,
  onOpen,
}: {
  tasks: Task[];
  tags: Tags;
  day: string;
  onOpen: (task: Task) => void;
}) {
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
            <th className="py-2 font-normal">Blocked on</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = taskStatus(task, day);
            const style = STATUS_STYLE[status];
            const block = activeBlock(task, day);
            return (
              <tr
                key={task.id}
                onClick={() => onOpen(task)}
                className="cursor-pointer border-b border-hairline align-top last:border-0 hover:bg-surface"
              >
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-2 font-medium ${style.text}`}>
                    <StatusDot status={status} />
                    {label(task, day)}
                  </span>
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">{task.userName}</td>
                <td className="py-2.5 pr-4">
                  {brand(task.brandId)}
                  <span className="block text-muted">{section(task.sectionId)}</span>
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {task.jobCode ?? <span className="text-muted-light">—</span>}
                </td>
                <td className={`py-2.5 pr-4 ${status === "done" ? "line-through decoration-muted" : ""}`}>
                  <button type="button" className="text-left hover:text-accent" onClick={() => onOpen(task)}>
                    {task.title}
                  </button>
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {task.dueDate ? formatDay(task.dueDate) : "—"}
                  <span className={`block text-xs ${status === "overdue" ? style.text : "text-muted"}`}>
                    {timing(task, day)}
                  </span>
                </td>
                <td className="py-2.5">
                  {block ? (
                    <>
                      {block.reason}
                      <span className="block text-xs text-muted">
                        {block.waitingOn ? `Waiting on ${block.waitingOn} · ` : ""}since {formatDay(block.blockedOn)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-light">—</span>
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

// ---- filters shared by the sheet and the calendar ---------------------------

export type BoardFilter = { userId: number | null; brandId: number | null };

export function applyFilter(tasks: Task[], f: BoardFilter) {
  return tasks.filter((t) => (!f.userId || t.userId === f.userId) && (!f.brandId || t.brandId === f.brandId));
}

export function BoardFilters({
  tasks,
  people,
  tags,
  filter,
  onChange,
}: {
  tasks: Task[];
  people: { id: number; name: string }[];
  tags: Tags;
  filter: BoardFilter;
  onChange: (f: BoardFilter) => void;
}) {
  // Only offer brands that actually have tasks.
  const used = new Set(tasks.map((t) => t.brandId));
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
          {people.map((p) => (
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
