"use client";

import { useState } from "react";
import { useUser } from "@/components/dashboard/Session";
import CheckinCard from "@/components/dashboard/tasks/CheckinCard";
import QuickAdd from "@/components/dashboard/tasks/QuickAdd";
import TaskGroups from "@/components/dashboard/tasks/TaskGroups";
import TaskPanel from "@/components/dashboard/tasks/TaskPanel";
import { useTasks } from "@/components/dashboard/tasks/useTasks";
import { PAGE_TITLE } from "@/components/dashboard/ui";
import { useTags } from "@/components/dashboard/useTags";
import { localToday } from "@/lib/dues";

export default function MyTasksPage() {
  const user = useUser();
  const { tags, error: tagsError } = useTags();
  const { tasks, error, replace } = useTasks();
  const [openId, setOpenId] = useState<number | null>(null);
  const today = localToday();

  return (
    <div>
      <h1 className={PAGE_TITLE}>
        My tasks<span className="text-accent">_</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        Add a task once — it moves itself to Overdue, Due today or Coming up by its date. Click a task to mark it done or
        blocked.
      </p>

      {(tagsError || error) && <p className="mt-6 text-sm text-brand-coral">{tagsError || error}</p>}

      {!tags || !tasks ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : (
        <div className="mt-8 space-y-6">
          <CheckinCard />
          <QuickAdd tags={tags} onAdded={replace} />
          <TaskGroups tasks={tasks} tags={tags} today={today} onOpen={(t) => setOpenId(t.id)} />
        </div>
      )}

      {openId !== null && tags && (
        <TaskPanel
          taskId={openId}
          tags={tags}
          canEdit={(t) => t.userId === user.id}
          onClose={() => setOpenId(null)}
          onChanged={replace}
        />
      )}
    </div>
  );
}
