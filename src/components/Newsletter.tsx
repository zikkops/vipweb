"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { HONEYPOT, submitForm, type FormResult } from "@/lib/forms";

export default function Newsletter() {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | FormResult>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      setStatus(
        await submitForm(
          "Newsletter sign-up",
          { Email: String(data.get("email") ?? "").trim() },
          String(data.get(HONEYPOT) ?? "")
        )
      );
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-ink text-paper py-20 md:py-28">
      <div className="container-page">
        <h2 className="text-[44px] sm:text-[56px] lg:text-[70px] leading-none mb-8">
          Newsletter<span className="animate-[color-blink_6s_steps(1)_infinite]">_</span>
        </h2>

        {status === "sent" || status === "mail-app" ? (
          <p className="max-w-md text-[16px] normal-case text-muted-light">
            {status === "sent"
              ? "Thanks — you're on the list."
              : "Your email app should have opened with the sign-up request — just press send."}
          </p>
        ) : (
          <form className="relative max-w-md" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              aria-label="Email"
              className="w-full bg-white/10 text-paper placeholder-muted-light text-[16px] px-4 py-4 outline-none focus:bg-white/15 transition-colors"
            />
            <input
              type="text"
              name={HONEYPOT}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            {status === "error" && (
              <p className="mt-3 text-[15px] normal-case text-red-300" role="alert">
                Sorry, that didn&apos;t go through. Please try again, or email {site.email}.
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center bg-paper text-ink px-6 py-3 font-heading text-[16px] uppercase tracking-widest hover:bg-white/80 transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Sending" : "Subscribe"}
              <span className="animate-[color-blink_3s_steps(1)_infinite]">_</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
