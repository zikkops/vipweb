// Job codes, e.g. `BDF-0926-EVENT-Event Kit`.
//
// Rule (inferred from the existing codes EVC-0326-WEB-Website,
// BDF-0926-EVENT-Event Kit and NTR-0426-CRV-Branding — confirm or correct):
//   <brand code>-<MMYY the task was opened>-<section code>-<section name>
// Change it here; the pages, the API and the tests all use this function.

type Named = { name: string; code: string | null };

export type JobCode = {
  code: string | null;
  /** What has to be filled in before a code can be made, for the UI to show. */
  missing: string[];
};

export function jobCode(brand: Named | undefined, section: Named | undefined, openedOn: string): JobCode {
  const missing: string[] = [];
  if (!brand) missing.push("a brand");
  else if (!brand.code) missing.push(`a code for ${brand.name}`);
  if (!section) missing.push("a work section");
  else if (!section.code) missing.push(`a code for ${section.name}`);
  if (missing.length || !brand?.code || !section?.code) return { code: null, missing };

  const [year, month] = openedOn.split("-");
  return { code: `${brand.code}-${month}${year.slice(2)}-${section.code}-${section.name}`, missing };
}
