"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tag } from "@/lib/dues";
import { api, errorMessage } from "./api";

export type Tags = { brands: Tag[]; sections: Tag[] };

export function useTags() {
  const [tags, setTags] = useState<Tags | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setTags(await api<Tags>("tags/"));
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
