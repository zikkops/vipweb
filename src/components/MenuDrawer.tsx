"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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

export default function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[115] bg-ink/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-[120] w-full sm:w-[420px] bg-ink text-paper flex flex-col items-center justify-center gap-8 px-10 text-center"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src="/images/logo-mark.svg" alt="" width={64} height={64} className="w-16 h-16" />

            <div className="bg-paper text-ink font-heading text-3xl font-bold uppercase tracking-tight px-4 py-2">
              {site.name}
            </div>

            <p className="text-paper/60 text-sm max-w-xs normal-case">{site.tagline}</p>

            <div className="flex items-center gap-5">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="text-paper hover:text-muted-light transition-colors"
                >
                  <FontAwesomeIcon icon={socialIcons[s.label]} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
