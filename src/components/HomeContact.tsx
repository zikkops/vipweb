"use client";

import { useState } from "react";
import { site } from "@/data/site";

export default function HomeContact() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sent");
  }

  return (
    <section id="contact" className="max-w-[1100px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 md:gap-16 scroll-mt-20">
      <div>
        <h2 className="text-[34px] sm:text-[44px] md:text-[55px] leading-tight mb-8">
          Don&apos;t Be Shy, Say Hello!
        </h2>

        {status === "sent" ? (
          <div className="border border-hairline p-8 max-w-xl">
            <h3 className="font-heading text-xl mb-2">Message Sent_</h3>
            <p className="text-muted normal-case">
              Thanks for reaching out — we&apos;ll get back to you within one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Name"
                className="w-full bg-surface px-[15px] py-[5px] text-[16px] outline-none focus:bg-hairline transition-colors"
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full bg-surface px-[15px] py-[5px] text-[16px] outline-none focus:bg-hairline transition-colors"
              />
            </div>
            <textarea
              required
              rows={5}
              placeholder="Message"
              className="w-full bg-surface px-[15px] py-[5px] text-[16px] outline-none focus:bg-hairline transition-colors resize-none"
            />
            <button
              type="submit"
              className="group/send inline-flex items-center border border-ink px-8 py-3 font-heading font-semibold text-[18px] uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
            >
              Send
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
