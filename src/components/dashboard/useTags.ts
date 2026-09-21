"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage, listTags, type Tags } from "./db";

export type { Tags };

export function useTags() {
  const [tags, setTags] = useState<Tags | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setTags(await listTags());
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    reload();
  }, [reload]);

  return { tags, error, reload };
}
