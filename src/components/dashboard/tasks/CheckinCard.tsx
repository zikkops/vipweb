"use client";

import { useEffect, useState } from "react";
import { localToday } from "@/lib/dues";
import type { Checkin } from "@/lib/tasks";
import { api, errorMessage } from "../api";
import { BUTTON, BUTTON_SOLID, INPUT, LABEL } from "../ui";

/** Once a day: does the Asana board match my tasks? If not, what did I fix? */
export default function CheckinCard() {
  const today = localToday();
  const [checkin, setCheckin] = useState<Checkin | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [matches, setMatches] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ checkin: Checkin | null }>(`checkins/?date=${today}`)
      .then(({ checkin }) => setCheckin(checkin))
      .catch((err) => setError(errorMessage(err)));
  }, [today]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { checkin: saved } = await api<{ checkin: Checkin }>("checkins/", {
        method: "PUT",
        body: { date: today, asanaMatches: matches, asanaFixNote: note },
      });
      setCheckin(saved);
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (checkin === undefined) return null;

  if (checkin && !editing) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-hairline bg-paper px-5 py-4 text-sm sm:px-6">
        <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden />
        <span>
          Checked in today — Asana board {checkin.asanaMatches ? "matches" : "didn’t match"}
          {!checkin.asanaMatches && checkin.asanaFixNote && <span className="text-muted"> · fixed: {checkin.asanaFixNote}</span>}
        </span>
        <button
          className="ml-auto text-accent hover:underline"
          onClick={() => {
            setMatches(checkin.asanaMatches);
            setNote(checkin.asanaFixNote);
            setEditing(true);
          }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="border border-accent/30 bg-accent/5 p-5 sm:p-6">
      <p className="font-heading text-2xl">Daily check-in</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span>Does your Asana board match your tasks?</span>
        {[
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={matches === o.value}
            onClick={() => setMatches(o.value)}
            className={matches === o.value ? BUTTON_SOLID : BUTTON}
          >
            {o.label}
          </button>
        ))}
      </div>
      {matches === false && (
        <div className="mt-4">
          <label className={LABEL} htmlFor="checkin-fix">
            What you fixed this morning
          </label>
          <textarea id="checkin-fix" required rows={2} className={INPUT} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
      <button type="submit" className={`${BUTTON_SOLID} mt-4`} disabled={busy || matches === null}>
        {busy ? "Saving…" : "Check in"}
      </button>
    </form>
  );
}
