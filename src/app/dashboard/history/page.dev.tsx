"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/components/dashboard/api";
import { PAGE_TITLE } from "@/components/dashboard/ui";
import { BUCKETS, type ReportSummary } from "@/lib/dues";

export default function HistoryPage() {
  const [reports, setReports] = useState<ReportSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ reports: ReportSummary[] }>("reports/history/")
      .then(({ reports }) => setReports(reports))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className={PAGE_TITLE}>
        My reports<span className="text-accent">_</span>
      </h1>

      {error && <p className="mt-6 text-sm text-brand-coral">{error}</p>}

      {!reports ? (
        !error && <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          No reports yet.{" "}
          <Link href="/dashboard/" className="text-accent hover:underline">
            Write today’s
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-hairline bg-paper">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-hairline font-heading text-xs uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-normal">Date</th>
                {BUCKETS.map((b) => (
                  <th key={b.key} className="px-4 py-3 font-normal">
                    {b.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-normal">Asana</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.date} className="border-b border-hairline last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/?date=${r.date}`} className="text-accent hover:underline">
                      {new Date(`${r.date}T12:00:00`).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Link>
                  </td>
                  {BUCKETS.map((b) => (
                    <td key={b.key} className={`px-4 py-3 ${r.counts[b.key] ? "" : "text-muted-light"}`}>
                      {r.counts[b.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">{r.asanaMatches === null ? "—" : r.asanaMatches ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
