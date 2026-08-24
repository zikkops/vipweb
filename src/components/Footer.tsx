"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-page py-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <h4 className="text-[26px] mb-6">About Us</h4>
          <p className="text-paper normal-case mb-8 max-w-md">{site.description}</p>

          <form onSubmit={(e) => e.preventDefault()} className="flex max-w-xs">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full bg-white/10 text-paper placeholder-muted-light px-4 py-3 outline-none focus:bg-white/15 transition-colors"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="shrink-0 w-12 flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>
        </div>

        <div>
          <h4 className="text-[26px] mb-6">Get In Touch</h4>
          <div className="space-y-6 text-muted-light normal-case">
            {site.addresses.map((a) => (
              <div key={a.label} className="space-y-2">
                <div className="font-heading uppercase text-paper text-[15px] tracking-[0.18em]">
                  {a.label}
                </div>
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 shrink-0 mt-1" />
                  <span>{a.line}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4 shrink-0" />
                  <a
                    href={`tel:${a.phone.replace(/[\s-]/g, "")}`}
                    className="hover:text-paper transition-colors"
                  >
                    {a.phone}
                  </a>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 shrink-0" />
              <a href={`mailto:${site.email}`} className="hover:text-paper transition-colors">
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a]">
        <div className="container-page py-6 flex items-center justify-between gap-6">
          <Image
            src="/images/logo-light.webp"
            alt={site.name}
            width={797}
            height={214}
            sizes="180px"
            className="h-8 w-auto"
          />
          <p className="text-muted-light text-sm normal-case">
            &copy; {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
