// Task reports for export (Excel / PDF): which tasks match, and the rows.
// Plain data in, plain data out, so the rules are easy to test.

import type { Tag } from "./dues.ts";
import { TASK_STATUSES, taskStatus, type Task } from "./tasks.ts";

/** Which of a task's dates must fall inside the time frame. */
export type ReportDateBy = "due" | "created" | "done";

export const REPORT_DATE_BY: { key: ReportDateBy; label: string }[] = [
  { key: "due", label: "Due date" },
  { key: "created", label: "Date added" },
  { key: "done", label: "Date done" },
];

export type ReportFilter = {
  /** Inclusive YYYY-MM-DD bounds. */
  from: string;
  to: string;
  dateBy: ReportDateBy;
  /** Empty means everyone / every client / every type. */
  userIds: string[];
  brandIds: number[];
  sectionIds: number[];
};

export type ReportRow = {
  employee: string;
  jobCode: string;
  client: string;
  type: string;
  task: string;
  description: string;
  added: string;
  due: string;
  done: string;
  status: string;
};

/** Column order, headings and widths (in characters, for Excel) shared by both exports. */
export const REPORT_COLUMNS: { key: keyof ReportRow; header: string; width: number }[] = [
  { key: "employee", header: "Employee", width: 18 },
  { key: "jobCode", header: "Job code", width: 34 },
  { key: "client", header: "Client", width: 22 },
  { key: "type", header: "Type of work", width: 24 },
  { key: "task", header: "Task", width: 36 },
  { key: "description", header: "Description", width: 44 },
  { key: "added", header: "Added", width: 12 },
  { key: "due", header: "Due", width: 12 },
  { key: "done", header: "Done", width: 12 },
  { key: "status", header: "Status", width: 12 },
];

const dateOf = (task: Task, by: ReportDateBy) =>
  by === "due" ? task.dueDate : by === "created" ? task.createdOn : task.doneOn;

/** Tasks in the time frame that pass every filter, by employee then date. */
export function reportRows(tasks: Task[], tags: { brands: Tag[]; sections: Tag[] }, filter: ReportFilter, today: string) {
  const name = (list: Tag[], id: number) => list.find((t) => t.id === id)?.name ?? "—";
  const label = (task: Task) => TASK_STATUSES.find((s) => s.key === taskStatus(task, today))!.label;

  return tasks
    .filter((t) => {
      const day = dateOf(t, filter.dateBy);
      return (
        !!day &&
        day >= filter.from &&
        day <= filter.to &&
        (!filter.userIds.length || filter.userIds.includes(t.userId)) &&
        (!filter.brandIds.length || filter.brandIds.includes(t.brandId)) &&
        (!filter.sectionIds.length || filter.sectionIds.includes(t.sectionId))
      );
    })
    .sort(
      (a, b) =>
        a.userName.localeCompare(b.userName) ||
        (dateOf(a, filter.dateBy) ?? "").localeCompare(dateOf(b, filter.dateBy) ?? "") ||
        a.id - b.id
    )
    .map(
      (t): ReportRow => ({
        employee: t.userName,
        jobCode: t.jobCode ?? "",
        client: name(tags.brands, t.brandId),
        type: name(tags.sections, t.sectionId),
        task: t.title,
        description: t.description,
        added: t.createdOn,
        due: t.dueDate ?? "",
        done: t.doneOn ?? "",
        status: label(t),
      })
    );
}

/** A file name for the report, e.g. vipminds-tasks-2026-10-01-to-2026-10-31. */
export const reportFileName = (filter: ReportFilter) => `vipminds-tasks-${filter.from}-to-${filter.to}`;
