"use client";

import { useState } from "react";
import { changePassword, errorMessage } from "./db";
import { useSession } from "./Session";
import { BUTTON_SOLID, INPUT, LABEL } from "./ui";

const MIN_PASSWORD = 8;

/** Set a new password. `recovering` after following a reset email. */
export default function ChangePassword({ recovering = false }: { recovering?: boolean }) {
  const { setRecovering } = useSession();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < MIN_PASSWORD) {
      setMessage({ kind: "error", text: `Use at least ${MIN_PASSWORD} characters.` });
      return;
    }
    if (next !== confirm) {
      setMessage({ kind: "error", text: "The passwords don’t match." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await changePassword(next);
      setNext("");
      setConfirm("");
      setMessage({ kind: "ok", text: "Password saved." });
      setRecovering(false);
    } catch (err) {
      setMessage({ kind: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-5 border border-hairline bg-paper p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-3xl">{recovering ? "Choose a new password" : "Change password"}</h2>
        {recovering && <p className="mt-2 text-sm text-muted">You followed a password-reset link. Pick a new password to continue.</p>}
      </div>
      <div>
        <label className={LABEL} htmlFor="pw-new">
          New password
        </label>
        <input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
          className={INPUT}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div>
        <label className={LABEL} htmlFor="pw-confirm">
          New password again
        </label>
        <input
          id="pw-confirm"
          type="password"
          autoComplete="new-password"
          required
          className={INPUT}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {message && (
        <p className={`text-sm ${message.kind === "ok" ? "text-accent" : "text-brand-coral"}`}>{message.text}</p>
      )}
      <button type="submit" className={BUTTON_SOLID} disabled={busy}>
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
