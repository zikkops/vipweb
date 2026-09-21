"use client";

import { useState } from "react";
import { TASK_STATUSES, activeBlock, addDays, daysBetween, taskStatus, type Task, type TaskStatus } from "@/lib/tasks";
import { STATUS_STYLE, formatDay } from "../board";
import type { Tags } from "../useTags";

/** "2 days late", "Today", "In 3 days", "Blocked 4 days"… */
export function timing(task: Task, day: string): string {
  const status = taskStatus(task, day);
  if (status === "done") return task.doneOn ? `Done ${formatDay(task.doneOn)}` : "Done";
  if (status === "blocked") {
    const since = daysBetween(activeBlock(task, day)!.blockedOn, day);
    return since === 0 ? "Blocked today" : `Blocked ${since} ${since === 1 ? "day" : "days"}`;
  }
  if (!task.dueDate) return "No due date";
  const days = daysBetween(day, task.dueDate);
  if (days === 0) return "Today";
  if (days < 0) return `${-days} ${days === -1 ? "day" : "days"} late`;
  return `In ${days} ${days === 1 ? "day" : "days"}`;
}

export function StatusDot({ status }: { status: TaskStatus }) {
  return <span className={`size-2.5 shrink-0 rounded-full ${STATUS_STYLE[status].dot}`} aria-hidden />;
}

const DONE_WINDOW_DAYS = 7;

/**
 * Tasks filed automatically into Overdue → Due today → Blocked → Coming up,
 * with the last week's finished work collapsed underneath.
 */
export default function TaskGroups({
  tasks,
  tags,
  today,
  onOpen,
  showOwner = false,
}: {
  tasks: Task[];
  tags: Tags;
  today: string;
  onOpen: (task: Task) => void;
  showOwner?: boolean;
}) {
  const [showDone, setShowDone] = useState(false);
  const since = addDays(today, -DONE_WINDOW_DAYS);
  const grouped = new Map<TaskStatus, Task[]>(TASK_STATUSES.map((s) => [s.key, []]));
  for (const task of tasks) {
    const status = taskStatus(task, today);
    if (status === "done" && task.doneOn! < since) continue;
    grouped.get(status)!.push(task);
  }

  const brand = (id: number) => tags.brands.find((t) => t.id === id)?.name ?? "—";
  const section = (id: number) => tags.sections.find((t) => t.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      {TASK_STATUSES.map(({ key, label }) => {
        const list = grouped.get(key)!;
        const isDone = key === "done";
        const style = STATUS_STYLE[key];
        if (isDone && list.length === 0) return null;
        return (
          <section key={key} className="border border-hairline bg-paper">
            <button
              type="button"
              disabled={!isDone}
              onClick={() => setShowDone(!showDone)}
              aria-expanded={isDone ? showDone : undefined}
              className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-default sm:px-6"
            >
              <span className={`size-3 rounded-full ${style.dot}`} />
              <h2 className={`font-heading text-2xl ${style.text}`}>
                {label}
                {isDone && <span className="text-muted"> — last {DONE_WINDOW_DAYS} days</span>}{" "}
                <span className="text-muted">({list.length})</span>
              </h2>
              {isDone && <span className="ml-auto text-sm text-accent">{showDone ? "Hide" : "Show"}</span>}
            </button>

            {(!isDone || showDone) &&
              (list.length === 0 ? (
                <p className="border-t border-hairline px-5 py-4 text-sm text-muted sm:px-6">Nothing here.</p>
              ) : (
                <ul className="divide-y divide-hairline border-t border-hairline">
                  {list.map((task) => {
                    const block = activeBlock(task, today);
                    return (
                      <li key={task.id}>
                        <button
                          type="button"
                          onClick={() => onOpen(task)}
                          className="grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 px-5 py-3 text-left transition-colors hover:bg-surface sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-6"
                        >
                          <span className="pt-1.5">
                            <StatusDot status={key} />
                          </span>
                          <span className="min-w-0">
                            <span className={`block font-medium ${isDone ? "line-through decoration-muted" : ""}`}>
                              {task.title}
                            </span>
                            <span className="block truncate text-sm text-muted">
                              {showOwner && <>{task.userName} · </>}
                              {brand(task.brandId)} · {section(task.sectionId)}
                              {task.jobCode && <> · {task.jobCode}</>}
                            </span>
                            {block && (
                              <span className="mt-1 block text-sm text-amber-800">
                                {block.reason}
                                {block.waitingOn && <> — waiting on {block.waitingOn}</>}
                              </span>
                            )}
                          </span>
                          <span className="col-start-2 text-sm sm:col-start-3 sm:text-right">
                            {task.dueDate && <span className="block">{formatDay(task.dueDate)}</span>}
                            <span className={`block ${key === "overdue" || key === "blocked" ? style.text : "text-muted"}`}>
                              {timing(task, today)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ))}
          </section>
        );
      })}
    </div>
  );
}
