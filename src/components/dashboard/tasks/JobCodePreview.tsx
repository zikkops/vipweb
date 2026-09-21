"use client";

import { useEffect, useRef, useState } from "react";
import type { Tag } from "@/lib/dues";
import { jobCode } from "@/lib/jobCode";

/**
 * The job code, recalculated on every change to brand or section. When it
 * changes, it flashes and shows what it was, so people see the new code land.
 */
export default function JobCodePreview({
  brand,
  section,
  openedOn,
  compact = false,
}: {
  brand: Tag | undefined;
  section: Tag | undefined;
  openedOn: string;
  compact?: boolean;
}) {
  const { code, missing } = jobCode(brand, section, openedOn);
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
    return (
      <span className="text-sm text-muted-light" title={missing.length ? `Needs ${missing.join(" and ")}` : undefined}>
        {compact ? "—" : missing.length ? `Needs ${missing.join(" and ")}` : "—"}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2" aria-live="polite">
      <span
        key={code}
        className="animate-[job-code-flash_1.6s_ease-out] rounded-sm px-1 -mx-1 font-heading text-sm tracking-wider text-ink"
      >
        {code}
      </span>
      {previous && !compact && (
        <span className="text-xs text-muted">
          was <span className="line-through">{previous}</span>
        </span>
      )}
    </span>
  );
}
