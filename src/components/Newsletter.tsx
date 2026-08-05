"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faXTwitter, faBehance, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { site } from "@/data/site";

const socialIcons: Record<string, IconDefinition> = {
  Instagram: faInstagram,
  Twitter: faXTwitter,
  Behance: faBehance,
  Facebook: faFacebookF,
};

export default function Newsletter() {
  return (
    <section className="bg-ink text-paper py-20 md:py-28">
      <div className="container-page">
        <h2 className="text-[70px] leading-none mb-8">
          Newsletter<span className="animate-[color-blink_6s_steps(1)_infinite]">_</span>
        </h2>

        <form className="max-w-md" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full bg-white/10 text-paper placeholder-muted-light text-[16px] px-4 py-4 outline-none focus:bg-white/15 transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center bg-paper text-ink px-6 py-3 font-heading text-[16px] uppercase tracking-widest hover:bg-white/80 transition-colors"
          >
            Subscribe
            <span className="animate-[color-blink_3s_steps(1)_infinite]">_</span>
          </button>
        </form>

        <div className="flex gap-3 mt-8">
          {site.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-9 h-9 flex items-center justify-center bg-paper text-ink hover:bg-muted-light transition-colors"
            >
              <FontAwesomeIcon icon={socialIcons[s.label]} className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
