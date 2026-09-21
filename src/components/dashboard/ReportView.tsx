import { BUCKETS, type Report } from "@/lib/dues";
import type { Tags } from "./useTags";

/** Read-only rendering of a submitted report, laid out like the dues sheet. */
export default function ReportView({ report, tags }: { report: Report; tags: Tags }) {
  const brand = (id: number) => tags.brands.find((t) => t.id === id)?.name ?? "—";
  const section = (id: number) => tags.sections.find((t) => t.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      {BUCKETS.map((b) => {
        const items = report.items.filter((i) => i.bucket === b.key);
        return (
          <div key={b.key}>
            <h3 className="mb-2 font-heading text-lg">
              {b.label} <span className="text-muted">({items.length})</span>
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted">Nothing.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline font-heading text-xs uppercase tracking-widest text-muted">
                      <th className="py-2 pr-4 font-normal">Job code</th>
                      <th className="py-2 pr-4 font-normal">Brand / section</th>
                      <th className="py-2 pr-4 font-normal">Task</th>
                      <th className="py-2 pr-4 font-normal">Due date</th>
                      <th className="py-2 font-normal">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-hairline align-top last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {item.jobCode ?? <span className="text-muted-light">Auto</span>}
                        </td>
                        <td className="py-2 pr-4">
                          {brand(item.brandId)}
                          <span className="block text-muted">{section(item.sectionId)}</span>
                        </td>
                        <td className="py-2 pr-4">
                          {item.task}
                          {item.done && (
                            <span className="ml-2 font-heading text-xs uppercase tracking-widest text-emerald-600">
                              Done
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">{item.dueDate ?? "—"}</td>
                        <td className="py-2 whitespace-pre-line">{item.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <div className="border-t border-hairline pt-4 text-sm">
        <span className="font-heading uppercase tracking-widest text-muted">Asana board matches: </span>
        {report.asanaMatches === null ? "not answered" : report.asanaMatches ? "Yes" : "No"}
        {report.asanaMatches === false && report.asanaFixNote && (
          <p className="mt-1 whitespace-pre-line">Fixed this morning: {report.asanaFixNote}</p>
        )}
      </div>
    </div>
  );
}
