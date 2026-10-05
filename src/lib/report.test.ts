import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reportRows, type ReportFilter } from "./report.ts";
import type { Task } from "./tasks.ts";

const TODAY = "2026-10-05";
const tags = {
  brands: [
    { id: 1, name: "Beirut Duty Free", code: "BDF", active: true },
    { id: 2, name: "Wooden Bakery", code: "WB", active: true },
  ],
  sections: [
    { id: 10, name: "Social media and content", code: "SOC", active: true },
    { id: 11, name: "Reporting", code: "RPT", active: true },
  ],
};

let nextId = 1;
const task = (over: Partial<Task>): Task => ({
  id: nextId++,
  userId: "rita",
  userName: "Rita",
  brandId: 1,
  sectionId: 10,
  title: "Task",
  description: "",
  dueDate: null,
  jobCode: null,
  createdOn: "2026-09-01",
  createdAt: "2026-09-01T09:00:00Z",
  doneOn: null,
  blocks: [],
  updatedAt: "2026-09-01T09:00:00Z",
  ...over,
});

const tasks = [
  task({ title: "Promo posts", dueDate: "2026-10-02", jobCode: "BDF-0926-SOC-PromoPosts", description: "3 posts" }),
  task({ title: "Monthly report", sectionId: 11, dueDate: "2026-10-20", doneOn: "2026-10-03" }),
  task({ title: "Bakery reel", userId: "karim", userName: "Karim", brandId: 2, dueDate: "2026-10-10" }),
  task({ title: "Last month", dueDate: "2026-09-28" }),
  task({ title: "No date" }),
];

const all: ReportFilter = { from: "2026-10-01", to: "2026-10-31", dateBy: "due", userIds: [], brandIds: [], sectionIds: [] };
const titles = (filter: ReportFilter) => reportRows(tasks, tags, filter, TODAY).map((r) => r.task);

describe("reportRows", () => {
  it("keeps tasks whose chosen date is in the time frame, by employee then date", () => {
    assert.deepEqual(titles(all), ["Bakery reel", "Promo posts", "Monthly report"]);
  });

  it("can date tasks by when they were added or done instead", () => {
    assert.deepEqual(titles({ ...all, dateBy: "done" }), ["Monthly report"]);
    assert.deepEqual(titles({ ...all, from: "2026-09-01", to: "2026-09-01", dateBy: "created" }).length, 5);
  });

  it("filters by employees, clients and types, each optional", () => {
    assert.deepEqual(titles({ ...all, userIds: ["karim"] }), ["Bakery reel"]);
    assert.deepEqual(titles({ ...all, brandIds: [1] }), ["Promo posts", "Monthly report"]);
    assert.deepEqual(titles({ ...all, sectionIds: [11] }), ["Monthly report"]);
    assert.deepEqual(titles({ ...all, userIds: ["rita", "karim"], brandIds: [2], sectionIds: [10] }), ["Bakery reel"]);
  });

  it("fills each row with names, codes, dates and today's status", () => {
    const [row] = reportRows(tasks, tags, { ...all, userIds: ["rita"], sectionIds: [10] }, TODAY);
    assert.deepEqual(row, {
      employee: "Rita",
      jobCode: "BDF-0926-SOC-PromoPosts",
      client: "Beirut Duty Free",
      type: "Social media and content",
      task: "Promo posts",
      description: "3 posts",
      added: "2026-09-01",
      due: "2026-10-02",
      done: "",
      status: "Overdue",
    });
  });
});
