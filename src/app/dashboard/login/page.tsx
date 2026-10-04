"use client";

import { useState } from "react";
import { errorMessage, sendPasswordReset, signIn, signUp } from "@/components/dashboard/db";
import { useSession } from "@/components/dashboard/Session";
import { BUTTON_SOLID, INPUT, LABEL, PAGE_TITLE } from "@/components/dashboard/ui";
import { COMPANY_DOMAIN } from "@/lib/dues";

type Mode = "login" | "signup" | "forgot";

const TITLES: Record<Mode, string> = { login: "Sign in", signup: "Create account", forgot: "Reset password" };

export default function LoginPage() {
  const { refresh } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchTo(next: Mode) {
    setMode(next);
    setError("");
    setSent(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        await refresh();
      } else if (mode === "signup") {
        const needsConfirmation = await signUp(name, email, password);
        if (needsConfirmation) setSent(`We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.`);
        else await refresh();
      } else {
        await sendPasswordReset(email.trim().toLowerCase());
        setSent(`If ${email.trim()} has an account, a reset link is on its way.`);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md border border-hairline bg-paper p-6 sm:p-10">
      <h1 className={PAGE_TITLE}>
        {TITLES[mode]}
        <span className="text-accent">_</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "login" && "Your daily tasks."}
        {mode === "signup" && `Use your @${COMPANY_DOMAIN} email. The first account created becomes the admin.`}
        {mode === "forgot" && "We’ll email you a link to choose a new password."}
      </p>

      {sent ? (
        <p className="mt-8 border border-accent/30 bg-accent/5 p-4 text-sm">{sent}</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5">
          {mode === "signup" && (
            <div>
              <label className={LABEL} htmlFor="name">
                Full name
              </label>
              <input id="name" className={INPUT} required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className={LABEL} htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={INPUT}
              placeholder={`name@${COMPANY_DOMAIN}`}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className={LABEL} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : undefined}
                className={INPUT}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-sm text-brand-coral">{error}</p>}

          <button type="submit" disabled={busy} className={`${BUTTON_SOLID} w-full`}>
            {busy ? "Please wait…" : mode === "forgot" ? "Send reset link" : TITLES[mode]}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col items-start gap-2 text-sm text-muted">
        {mode !== "login" && (
          <button type="button" onClick={() => switchTo("login")} className="hover:text-accent hover:underline">
            Back to sign in
          </button>
        )}
        {mode === "login" && (
          <>
            <button type="button" onClick={() => switchTo("signup")} className="hover:text-accent hover:underline">
              No account yet? Create one
            </button>
            <button type="button" onClick={() => switchTo("forgot")} className="hover:text-accent hover:underline">
              Forgot your password?
            </button>
          </>
        )}
      </div>
    </div>
  );
}
