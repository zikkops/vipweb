import type { Tag } from "@/lib/dues";

/**
 * Builds the job code for a report row.
 *
 * The rules have not been supplied yet, so this returns null and the UI shows
 * "Auto". Existing codes such as `BDF-0926-EVENT-Event Kit` suggest
 * brand code, month/year, section code and section name — which is why brands
 * and sections already carry a `code` — but nothing is assumed until the rules
 * are confirmed.
 */
export function generateJobCode(
  _brand: Tag | undefined,
  _section: Tag | undefined,
  _reportDate: string
): string | null {
  return null;
}
