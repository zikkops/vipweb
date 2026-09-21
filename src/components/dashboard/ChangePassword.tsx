"use client";

import { useState } from "react";
import type { User } from "@/lib/dues";
import { api, errorMessage } from "./api";
import { useSession } from "./Session";
import { BUTTON_SOLID, INPUT, LABEL } from "./ui";

/** Change your own password. `forced` after an admin reset it. */
export default function ChangePassword({ forced = false }: { forced?: boolean }) {
  const { setUser } = useSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMessage({ kind: "error", text: "The new passwords don’t match." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { user } = await api<{ user: User }>("auth/password/", {
        method: "POST",
        body: { currentPassword: current, newPassword: next },
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ kind: "ok", text: "Password changed. Your other devices were signed out." });
      setUser(user);
    } catch (err) {
      setMessage({ kind: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-5 border border-hairline bg-paper p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-3xl">{forced ? "Choose a new password" : "Change password"}</h2>
        {forced && (
          <p className="mt-2 text-sm text-muted">
            An admin reset your password. Enter the temporary one they gave you, then pick your own.
          </p>
        )}
      </div>
      <div>
        <label className={LABEL} htmlFor="pw-current">
          {forced ? "Temporary password" : "Current password"}
        </label>
        <input
          id="pw-current"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div>
        <label className={LABEL} htmlFor="pw-new">
          New password
        </label>
        <input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          minLength={8}
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
