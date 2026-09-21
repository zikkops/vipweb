import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { jobCode } from "./jobCode.ts";
import { activeBlock, addDays, daysBetween, localDate, needsSlipReason, taskStatus, type TaskBlock } from "./tasks.ts";

const TODAY = "2026-09-21";
const task = (over: Partial<{ dueDate: string | null; doneOn: string | null; blocks: TaskBlock[] }> = {}) => ({
  dueDate: null,
  doneOn: null,
  blocks: [],
  ...over,
});
const block = (blockedOn: string, receivedOn: string | null = null): TaskBlock => ({
  id: 1,
  reason: "Waiting",
  waitingOn: "Designer",
  blockedOn,
  receivedOn,
});

describe("taskStatus", () => {
  it("files a task by its due date", () => {
    assert.equal(taskStatus(task({ dueDate: "2026-09-20" }), TODAY), "overdue");
    assert.equal(taskStatus(task({ dueDate: TODAY }), TODAY), "due_today");
    assert.equal(taskStatus(task({ dueDate: "2026-09-22" }), TODAY), "coming_up");
  });

  it("treats a task with no due date as coming up", () => {
    assert.equal(taskStatus(task(), TODAY), "coming_up");
  });

  it("puts done before everything else", () => {
    assert.equal(taskStatus(task({ dueDate: "2026-09-01", doneOn: "2026-09-19", blocks: [block("2026-09-10")] }), TODAY), "done");
  });

  it("is not done yet on days before it was finished", () => {
    assert.equal(taskStatus(task({ dueDate: "2026-09-25", doneOn: "2026-09-22" }), TODAY), "coming_up");
  });

  it("shows blocked even when the task is also past due", () => {
    assert.equal(taskStatus(task({ dueDate: "2026-09-18", blocks: [block("2026-09-17")] }), TODAY), "blocked");
  });

  it("unblocks once received, falling back to its date", () => {
    const t = task({ dueDate: "2026-09-18", blocks: [block("2026-09-17", "2026-09-20")] });
    assert.equal(taskStatus(t, TODAY), "overdue");
    assert.equal(taskStatus(t, "2026-09-19"), "blocked");
  });

  it("ignores a block that starts later", () => {
    assert.equal(taskStatus(task({ dueDate: "2026-09-25", blocks: [block("2026-09-23")] }), TODAY), "coming_up");
  });

  it("moves from due today to overdue at local midnight", () => {
    const before = localDate(new Date(2026, 8, 21, 23, 59, 59));
    const after = localDate(new Date(2026, 8, 22, 0, 0, 0));
    assert.equal(before, "2026-09-21");
    assert.equal(after, "2026-09-22");
    const t = task({ dueDate: "2026-09-21" });
    assert.equal(taskStatus(t, before), "due_today");
    assert.equal(taskStatus(t, after), "overdue");
  });
});

describe("activeBlock", () => {
  it("returns the block in force on a day", () => {
    const open = block("2026-09-20");
    assert.equal(activeBlock(task({ blocks: [block("2026-09-01", "2026-09-05"), open] }), TODAY), open);
    assert.equal(activeBlock(task({ blocks: [block("2026-09-01", "2026-09-05")] }), TODAY), null);
  });
});

describe("needsSlipReason", () => {
  it("asks why when a late task moves later", () => {
    assert.equal(needsSlipReason(task({ dueDate: "2026-09-18" }), "2026-09-25", TODAY), true);
    assert.equal(needsSlipReason(task({ dueDate: "2026-09-18" }), null, TODAY), true);
  });
  it("does not ask for on-time or finished tasks, or when pulling a date earlier", () => {
    assert.equal(needsSlipReason(task({ dueDate: "2026-09-24" }), "2026-09-30", TODAY), false);
    assert.equal(needsSlipReason(task({ dueDate: "2026-09-18", doneOn: "2026-09-19" }), "2026-09-30", TODAY), false);
    assert.equal(needsSlipReason(task({ dueDate: "2026-09-18" }), "2026-09-15", TODAY), false);
    assert.equal(needsSlipReason(task(), "2026-09-30", TODAY), false);
  });
});

describe("dates", () => {
  it("counts and shifts days across month ends", () => {
    assert.equal(daysBetween("2026-09-28", "2026-10-02"), 4);
    assert.equal(daysBetween("2026-10-02", "2026-09-28"), -4);
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  });
});

describe("jobCode", () => {
  const bdf = { name: "Beirut Duty Free", code: "BDF" };
  const eventKit = { name: "Event Kit", code: "EVENT" };

  it("builds brand-MMYY-section-name from the day the task was opened", () => {
    assert.deepEqual(jobCode(bdf, eventKit, "2026-09-21"), { code: "BDF-0926-EVENT-Event Kit", missing: [] });
    assert.equal(jobCode({ name: "Eventcom", code: "EVC" }, { name: "Website", code: "WEB" }, "2026-03-02").code, "EVC-0326-WEB-Website");
  });

  it("says what is missing instead of guessing", () => {
    assert.deepEqual(jobCode(undefined, undefined, "2026-09-21"), { code: null, missing: ["a brand", "a work section"] });
    assert.deepEqual(jobCode({ name: "Naturea", code: null }, { name: "Design", code: null }, "2026-09-21").missing, [
      "a code for Naturea",
      "a code for Design",
    ]);
  });
});
