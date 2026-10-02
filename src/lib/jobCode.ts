// Job codes, per "VIPMINDS Job Code Spec for IT" (Sep 2026):
//
//   CLIENT-MMYY-TYPE-Description       e.g. BDF-0926-SOC-SeptemberPromotions
//   CLIENT-MMYY-TYPE-Description-Sub   a sub-job, one segment under its parent
//
// CLIENT is the client's 2–3 letter code and TYPE the type of work's 3 letter
// code, both from admin-edited tables and both picked by the person opening
// the job (the type is never guessed). MMYY is the month the job was opened in
// Beirut time, and Description the task name in CamelCase. People never type a
// code: it is generated from those. No running number: a clash is blocked and
// the person renames the task. Once set, a code never changes. The database
// enforces the same rules (supabase/migrations/20260923000000_job_codes.sql);
// keep the two in step.

type Named = { name: string; code: string | null };

export const CLIENT_CODE_RE = /^[A-Z]{2,3}$/;
export const TYPE_CODE_RE = /^[A-Z]{3}$/;

const DESCRIPTION = "[A-Z][A-Za-z0-9]{1,39}";
const SUB_JOB = "[A-Z][A-Za-z0-9]{1,29}";

/**
 * The spec's validation regex, with the client and type lists left open
 * because both live in editable tables (the database checks the codes are the
 * task's client's and type's).
 */
export const JOB_CODE_RE = new RegExp(`^[A-Z]{2,3}-(0[1-9]|1[0-2])[0-9]{2}-[A-Z]{3}-${DESCRIPTION}(-${SUB_JOB})?$`);

export const isJobCode = (code: string) => JOB_CODE_RE.test(code);

/** A code with no sub-job segment, i.e. one that can have sub-jobs. */
export const isParentCode = (code: string) => isJobCode(code) && code.split("-").length === 4;

/** Month and year a job was opened, as MMYY in Beirut time. */
export function beirutMonth(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Beirut", month: "2-digit", year: "2-digit" }).formatToParts(at);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("month")}${part("year")}`;
}

/** Version and status words that say nothing about the job (rule 3). */
const FILLER = /^(final|new|draft|copy|updated|revised|latest|v\d+)$/i;

/**
 * A task name as a code description: spaces and punctuation removed, each word
 * capitalised, filler words dropped, cut at a word boundary to `max`.
 * "summer campaign v2 final" → "SummerCampaign". A description must start with
 * a letter, so leading numbers move to the end: "2026 calendar" → "Calendar2026".
 */
export function describeJob(name: string, max = 40): string {
  const words = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w && !FILLER.test(w))
    .map((w) => w[0].toUpperCase() + w.slice(1));
  const lead = words.findIndex((w) => /^[A-Z]/.test(w));
  if (lead > 0) words.push(...words.splice(0, lead));

  let out = "";
  for (const word of words) {
    if ((out + word).length > max) break;
    out += word;
  }
  return out || (words[0] ?? "").slice(0, max);
}

/** Titles and joining words that make poor initials. */
const SKIP_WORDS = /^(THE|OF|AND|FOR|DR|MR|MRS|MS)$/;

/**
 * A code for a new client (2–3 letters) or type of work (3 letters), made from
 * its name and never one already in `taken`. Clients: initials when the name
 * has several words (Wooden Bakery → WB), else its first letters (Candia →
 * CAN). Types: first letter and the consonants after it (Training → TRN).
 * Later choices step through other letters of the name until one is free.
 */
export function generateTagCode(name: string, kind: "client" | "type", taken: Iterable<string>): string | null {
  const used = new Set(taken);
  const all = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter(Boolean);
  const words = all.some((w) => !SKIP_WORDS.test(w)) ? all.filter((w) => !SKIP_WORDS.test(w)) : all;
  if (!words.length) return null;

  const letters = words.join("");
  const initials = words.map((w) => w[0]).join("");
  const consonants = letters[0] + letters.slice(1).replace(/[AEIOU]/g, "");
  const valid = kind === "client" ? CLIENT_CODE_RE : TYPE_CODE_RE;

  const candidates =
    kind === "client"
      ? [words.length > 1 ? initials.slice(0, 3) : "", letters.slice(0, 3), consonants.slice(0, 3)]
      : [consonants.slice(0, 3), initials.slice(0, 3), letters.slice(0, 3)];
  // Then the first letter with any two later letters of the name, in order, then with any letters at all.
  for (let i = 1; i < letters.length; i++) {
    for (let j = i + 1; j < letters.length; j++) candidates.push(letters[0] + letters[i] + letters[j]);
  }
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const a of ALPHABET) for (const b of ALPHABET) candidates.push(letters[0] + a + b);

  return candidates.find((c) => valid.test(c) && !used.has(c)) ?? null;
}

const COMMERCIAL =
  /[$€£]|\b(usd|lbp|eur|aed|sar|gbp|dollars?)\b|\b(price|prices|pricing|cost|costs|budget|budgets|fee|fees|discount|retainer)\b/i;

/** The first figure, price or commercial term in `text`, which never belongs in a task name or code (rule 6). */
export function commercialTerm(text: string): string | null {
  return text.match(COMMERCIAL)?.[0] ?? null;
}

export type JobCodeInput = {
  client: Named | undefined;
  type: Named | undefined;
  /** The task name; the description (or a sub-job's segment) is made from it. */
  name: string;
  /** When the job was opened; only its Beirut month is used. */
  openedAt: Date;
  /** The parent job's code, for a sub-job. Its client, month and type carry over. */
  parent?: string | null;
};

export type JobCode = {
  code: string | null;
  /** What has to be filled in or fixed before a code can be made, for the UI to show. */
  missing: string[];
};

export function jobCode({ client, type, name, openedAt, parent }: JobCodeInput): JobCode {
  const missing: string[] = [];
  const description = describeJob(name, parent ? 30 : 40);
  const pattern = new RegExp(`^(${parent ? SUB_JOB : DESCRIPTION})$`);

  if (parent) {
    if (!isParentCode(parent)) missing.push("a parent job that isn’t itself a sub-job");
  } else {
    if (!client) missing.push("a client");
    else if (!client.code) missing.push(`a code for ${client.name}`);
    if (!type) missing.push("a type of work");
    else if (!type.code) missing.push(`a code for ${type.name}`);
  }

  if (!description) missing.push("a task name");
  else if (!/^[A-Z]/.test(description)) missing.push("a task name with a word in it, not only numbers");
  else if (!pattern.test(description)) missing.push("a longer task name");

  if (missing.length) return { code: null, missing };
  const code = parent ? `${parent}-${description}` : `${client!.code}-${beirutMonth(openedAt)}-${type!.code}-${description}`;
  return { code, missing };
}
