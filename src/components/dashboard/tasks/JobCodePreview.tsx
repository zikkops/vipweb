"use client";

import { useEffect, useRef, useState } from "react";
import type { JobCode } from "@/lib/jobCode";

/**
 * The job code as it will be saved. When it changes, it flashes and shows what
 * it was, so people see the new code land. A code already in use is flagged
 * before saving; the database blocks it anyway.
 */
export default function JobCodePreview({ result: { code, missing }, taken = false }: { result: JobCode; taken?: boolean }) {
  const [previous, setPrevious] = useState<string | null>(null);
  const last = useRef(code);

  useEffect(() => {
    if (code === last.current) return;
    const was = last.current;
    last.current = code;
    if (!was || !code) return;
    setPrevious(was);
    const t = setTimeout(() => setPrevious(null), 4000);
    return () => clearTimeout(t);
  }, [code]);

  if (!code) {
    return <span className="text-sm text-muted-light">{missing.length ? `Needs ${missing.join(" and ")}` : "—"}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2" aria-live="polite">
      <span
        key={code}
        className={`animate-[job-code-flash_1.6s_ease-out] rounded-sm px-1 -mx-1 font-heading text-sm tracking-wider ${
          taken ? "text-brand-coral line-through" : "text-ink"
        }`}
      >
        {code}
      </span>
      {taken ? (
        <span className="text-xs text-brand-coral">already in use — rename the task</span>
      ) : (
        previous && (
          <span className="text-xs text-muted">
            was <span className="line-through">{previous}</span>
          </span>
        )
      )}
    </span>
  );
}
