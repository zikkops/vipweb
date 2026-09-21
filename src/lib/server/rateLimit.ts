import { HttpError } from "@/lib/server/http";

// Counts failed attempts per key (an email or an IP) in a sliding window. Kept
// in memory on globalThis: the local test server is a single process, and
// the online version will use its host's rate limiting instead.

type Window = { max: number; ms: number };

const globalForLimits = globalThis as unknown as { __duesLimits?: Map<string, number[]> };
const hits: Map<string, number[]> = (globalForLimits.__duesLimits ??= new Map<string, number[]>());

function recent(key: string, windowMs: number, now: number): number[] {
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length) hits.set(key, list);
  else hits.delete(key);
  return list;
}

/** Throws 429 if any key has used up its window. */
export function assertAllowed(keys: string[], { max, ms }: Window) {
  const now = Date.now();
  for (const key of keys) {
    const list = recent(key, ms, now);
    if (list.length >= max) {
      const wait = Math.ceil((ms - (now - list[0])) / 60_000);
      throw new HttpError(429, `Too many attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.`);
    }
  }
}

export function recordFailure(keys: string[]) {
  const now = Date.now();
  for (const key of keys) hits.set(key, [...(hits.get(key) ?? []), now]);
}

export function clear(key: string) {
  hits.delete(key);
}

/** The caller's IP as seen through a proxy, or "local" for direct requests. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

export const LOGIN_WINDOW: Window = { max: 5, ms: 15 * 60_000 };
export const SIGNUP_WINDOW: Window = { max: 5, ms: 60 * 60_000 };
