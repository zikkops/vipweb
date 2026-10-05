"use client";

// Turns report rows into a downloaded Excel or PDF file. The libraries load on
// first use, so the calendar doesn't carry them until someone exports.

import type { jsPDF as JsPDF } from "jspdf";
import type { autoTable as AutoTable } from "jspdf-autotable";
import type { SheetData, SheetOptions } from "write-excel-file/browser";
import { REPORT_COLUMNS, type ReportRow } from "@/lib/report";

export type ReportInfo = {
  fileName: string;
  /** e.g. "Due date 1 Oct 2026 – 31 Oct 2026" */
  period: string;
  /** e.g. ["Employees: Rita, Karim", "Clients: all", …] */
  filters: string[];
};

/** The Excel sheet: a bold header row, one row per task, readable column widths. */
export function excelSheet(rows: ReportRow[]): { data: SheetData; options: SheetOptions<Blob> } {
  return {
    data: [
      REPORT_COLUMNS.map((c) => ({ value: c.header, fontWeight: "bold" as const })),
      ...rows.map((row) => REPORT_COLUMNS.map((c) => (row[c.key] ? { value: row[c.key] } : null))),
    ],
    options: { sheet: "Tasks", columns: REPORT_COLUMNS.map((c) => ({ width: c.width })) },
  };
}

/** The PDF: a title, what the report covers, then the tasks as a table across landscape A4 pages. */
export function pdfDocument(rows: ReportRow[], info: ReportInfo, jsPDF: typeof JsPDF, autoTable: typeof AutoTable) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const margin = 32;
  const width = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold").setFontSize(16).text("VIPMINDS task report", margin, margin + 8);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
  const lines = [
    `${info.period} · ${rows.length} ${rows.length === 1 ? "task" : "tasks"}`,
    info.filters.join(" · "),
    `Generated ${new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`,
  ];
  doc.text(doc.splitTextToSize(lines.join("\n"), width - margin * 2), margin, margin + 26);

  // Relative widths: the free-text columns get the room.
  const weight: Partial<Record<keyof ReportRow, number>> = { task: 2, description: 2.3, jobCode: 2.7, client: 1.3, type: 1.4 };
  const total = REPORT_COLUMNS.reduce((sum, c) => sum + (weight[c.key] ?? 1), 0);
  const usable = width - margin * 2;

  autoTable(doc, {
    startY: margin + 62,
    margin: { left: margin, right: margin },
    head: [REPORT_COLUMNS.map((c) => c.header)],
    body: rows.map((row) => REPORT_COLUMNS.map((c) => row[c.key])),
    styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: Object.fromEntries(REPORT_COLUMNS.map((c, i) => [i, { cellWidth: (usable * (weight[c.key] ?? 1)) / total }])),
    didDrawPage: () => {
      const { height } = doc.internal.pageSize;
      doc.setFontSize(8).setTextColor(130);
      doc.text(`Page ${doc.getNumberOfPages()}`, width - margin, height - 16, { align: "right" });
    },
  });
  return doc;
}

export async function downloadExcel(rows: ReportRow[], info: ReportInfo) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const { data, options } = excelSheet(rows);
  await writeXlsxFile(data, options).toFile(`${info.fileName}.xlsx`);
}

export async function downloadPdf(rows: ReportRow[], info: ReportInfo) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  pdfDocument(rows, info, jsPDF, autoTable).save(`${info.fileName}.pdf`);
}
