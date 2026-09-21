"use client";

import { useState } from "react";
import { api, errorMessage } from "@/components/dashboard/api";
import { useSession } from "@/components/dashboard/Session";
import { BUTTON_SOLID, INPUT, LABEL, PAGE_TITLE } from "@/components/dashboard/ui";
import { COMPANY_DOMAIN, type User } from "@/lib/dues";

export default function LoginPage() {
  const { setUser } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { user } = await api<{ user: User }>(mode === "login" ? "auth/login/" : "auth/signup/", {
        method: "POST",
        body: mode === "login" ? { email, password } : { name, email, password },
      });
      setUser(user);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md border border-hairline bg-paper p-6 sm:p-10">
      <h1 className={PAGE_TITLE}>
        {mode === "login" ? "Sign in" : "Create account"}
        <span className="text-accent">_</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "login"
          ? "Log your daily dues."
          : `Use your @${COMPANY_DOMAIN} email. The first account created becomes the admin.`}
      </p>

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

        {error && <p className="text-sm text-brand-coral">{error}</p>}

        <button type="submit" disabled={busy} className={`${BUTTON_SOLID} w-full`}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
        }}
        className="mt-6 text-sm text-muted underline-offset-4 hover:text-accent hover:underline"
      >
        {mode === "login" ? "No account yet? Create one" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
