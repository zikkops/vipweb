"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/lib/tasks";
import { api, errorMessage } from "../api";

/** My tasks, or everyone's (`all`, admins only). */
export function useTasks(all = false) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setTasks((await api<{ tasks: Task[] }>(all ? "tasks/?all=1" : "tasks/")).tasks);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [all]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    reload();
  }, [reload]);

  /** Swap in a task the API just returned, without refetching everything. */
  const replace = useCallback((task: Task) => {
    setTasks((list) => {
      if (!list) return [task];
      return list.some((t) => t.id === task.id) ? list.map((t) => (t.id === task.id ? task : t)) : [...list, task];
    });
  }, []);

  return { tasks, error, reload, replace };
}
