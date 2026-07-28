"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Wire this up to your form backend or API route of choice
    // (e.g. Resend, Formspree, or a custom /api/contact route).
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="border border-hairline p-8 text-center">
        <h3 className="font-heading text-2xl mb-2">Message Sent_</h3>
        <p className="text-muted normal-case">
          Thanks for reaching out — we&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm tracking-widest text-muted block mb-2">Name</label>
          <input
            required
            type="text"
            className="w-full border-b border-hairline bg-transparent py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label className="text-sm tracking-widest text-muted block mb-2">Email</label>
          <input
            required
            type="email"
            className="w-full border-b border-hairline bg-transparent py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="text-sm tracking-widest text-muted block mb-2">Subject</label>
        <input
          type="text"
          className="w-full border-b border-hairline bg-transparent py-3 outline-none focus:border-ink transition-colors"
        />
      </div>
      <div>
        <label className="text-sm tracking-widest text-muted block mb-2">Message</label>
        <textarea
          required
          rows={5}
          className="w-full border-b border-hairline bg-transparent py-3 outline-none focus:border-ink transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        className="border border-ink px-8 py-3 font-heading text-sm tracking-widest hover:bg-ink hover:text-paper transition-colors"
      >
        Send Message _
      </button>
    </form>
  );
}
