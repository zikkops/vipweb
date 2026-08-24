"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { nav, site } from "@/data/site";

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
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute top-6 right-6 md:right-10 text-paper hover:text-muted-light transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <Image
              src="/images/logo-light.webp"
              alt={site.name}
              width={797}
              height={214}
              sizes="260px"
              className="h-12 w-auto"
            />

            <nav className="flex flex-col items-center gap-5">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="font-heading font-semibold uppercase text-[28px] tracking-widest text-paper hover:text-muted-light transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="text-paper/60 text-sm max-w-xs normal-case">{site.tagline}</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
