"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { HONEYPOT, submitForm, type FormResult } from "@/lib/forms";

const FIELD =
  "w-full bg-surface px-[15px] py-[5px] text-[16px] outline-none focus:bg-hairline transition-colors";

export default function HomeContact() {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | FormResult>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    setStatus("sending");
    try {
      setStatus(
        await submitForm(
          `Website enquiry from ${value("name")}`,
          { Name: value("name"), Email: value("email"), Message: value("message") },
          value(HONEYPOT)
        )
      );
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="max-w-[1100px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 md:gap-16 scroll-mt-20">
      <div>
        <h2 className="text-[34px] sm:text-[44px] md:text-[55px] leading-tight mb-8">
          Don&apos;t Be Shy, Say Hello!
        </h2>

        {status === "sent" || status === "mail-app" ? (
          <div className="border border-hairline p-8 max-w-xl">
            <h3 className="font-heading text-xl mb-2">
              {status === "sent" ? "Message Sent_" : "Almost There_"}
            </h3>
            <p className="text-muted normal-case">
              {status === "sent" ? (
                <>Thanks for reaching out — we&apos;ll get back to you within one business day.</>
              ) : (
                <>
                  Your email app should have opened with your message — just press send. If it
                  didn&apos;t, write to us at{" "}
                  <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-4">
                    {site.email}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required name="name" type="text" placeholder="Name" aria-label="Name" className={FIELD} />
              <input required name="email" type="email" placeholder="Email" aria-label="Email" className={FIELD} />
            </div>
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Message"
              aria-label="Message"
              className={`${FIELD} resize-none`}
            />
            {/* Hidden from people; bots that fill it in are ignored. */}
            <input
              type="text"
              name={HONEYPOT}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            {status === "error" && (
              <p className="text-[15px] normal-case text-red-600" role="alert">
                Sorry, your message couldn&apos;t be sent. Please try again, or email us at{" "}
                <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                  {site.email}
                </a>
                .
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="group/send inline-flex items-center border border-ink px-8 py-3 font-heading font-semibold text-[18px] uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Sending" : "Send"}
              <span className="group-hover/send:animate-[color-blink_3s_steps(1)_infinite]">_</span>
            </button>
          </form>
        )}
      </div>

      {/* three offices plus the shared inbox, two per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
        {site.addresses.map((a) => (
          <div key={a.label}>
            <h4 className="font-heading text-[26px] mb-2">{a.label}</h4>
            <p className="text-muted text-[16px] normal-case">
              <a
                href={`tel:${a.phone.replace(/[\s-]/g, "")}`}
                className="hover:text-ink transition-colors"
              >
                {a.phone}
              </a>
            </p>
          </div>
        ))}

        <div>
          <h4 className="font-heading text-[26px] mb-2">Email Us</h4>
          <p className="text-muted text-[16px] normal-case">
            <a href={`mailto:${site.email}`} className="hover:text-ink transition-colors">
              {site.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
