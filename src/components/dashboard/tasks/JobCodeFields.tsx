"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tag } from "@/lib/dues";
import { isParentCode, jobCode } from "@/lib/jobCode";
import { errorMessage, listJobCodes, type JobCodeInUse } from "../db";
import Combobox from "../Combobox";
import { LABEL } from "../ui";
import type { Tags } from "../useTags";
import JobCodePreview from "./JobCodePreview";

/** Every job code in use, for sub-job parents and clash warnings. */
export function useJobCodes() {
  const [codes, setCodes] = useState<JobCodeInUse[]>([]);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setCodes(await listJobCodes());
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    reload();
  }, [reload]);

  return { codes, error, reload };
}

/**
 * The job code generated from the client, type of work and task name, with an
 * optional parent for a sub-job. Choosing a parent hands it back through
 * `onParent` so the form can take its client and type; null clears it.
 */
export default function JobCodeFields({
  tags,
  brandId,
  sectionId,
  title,
  openedAt,
  parentCode,
  codes,
  onParent,
}: {
  tags: Tags;
  brandId: number | null;
  sectionId: number | null;
  title: string;
  openedAt: Date;
  parentCode: string | null;
  codes: JobCodeInUse[];
  onParent: (parent: JobCodeInUse | null) => void;
}) {
  const client = tags.brands.find((t) => t.id === brandId);
  const result = jobCode({
    client,
    type: tags.sections.find((t) => t.id === sectionId),
    name: title,
    openedAt,
    parent: parentCode,
  });
  const taken = !!result.code && codes.some((c) => c.code.toLowerCase() === result.code!.toLowerCase());

  // Parents offered as combobox options, narrowed to the chosen client.
  const parents = codes.filter((c) => isParentCode(c.code) && (!client?.code || c.code.startsWith(`${client.code}-`)));
  const parentOptions: Tag[] = parents.map((c, i) => ({ id: i + 1, name: c.code, code: null, active: true }));
  const parentIndex = parents.findIndex((c) => c.code === parentCode);

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
      <div className="text-sm">
        <span className={LABEL}>
          Job code <span className="normal-case tracking-normal text-muted-light">(made from client, month, type and task)</span>
        </span>
        <div className="py-2">
          <JobCodePreview result={result} taken={taken} />
        </div>
      </div>
      <div>
        <span className={LABEL}>
          Sub-job of <span className="normal-case tracking-normal text-muted-light">(optional)</span>
        </span>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Combobox
              label="Parent job"
              tags={parentOptions}
              value={parentIndex >= 0 ? parentIndex + 1 : null}
              onChange={(id) => onParent(parents[id - 1])}
              placeholder={parents.length ? "Search job codes…" : "No jobs to add to yet"}
            />
          </div>
          {parentCode && (
            <button
              type="button"
              className="px-2 text-sm text-muted underline-offset-2 hover:underline"
              onClick={() => onParent(null)}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
