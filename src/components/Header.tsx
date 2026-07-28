"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/data/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const transparent = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : `bg-paper/95 backdrop-blur border-b ${scrolled ? "border-hairline shadow-sm" : "border-transparent"}`
      }`}
    >
      <div className="container-page flex items-center justify-between h-20">
        <Link
          href="/"
          className={`font-heading text-2xl tracking-wide transition-colors ${transparent ? "text-paper" : "text-ink"}`}
        >
          {site.name}<span className={transparent ? "text-paper/70" : "text-muted"}>_</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-heading text-sm tracking-widest transition-colors ${
                transparent ? "text-paper hover:text-paper/70" : "text-ink hover:text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className={`hidden md:inline-flex items-center border px-5 py-2 font-heading text-sm tracking-widest transition-colors ${
            transparent
              ? "border-paper text-paper hover:bg-paper hover:text-ink"
              : "border-ink text-ink hover:bg-ink hover:text-paper"
          }`}
        >
          Let&apos;s Talk
        </Link>

        <button
          className="md:hidden relative z-10 flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <motion.span
            className={`w-6 h-0.5 block transition-colors ${transparent ? "bg-paper" : "bg-ink"}`}
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.span
            className={`w-6 h-0.5 block transition-colors ${transparent ? "bg-paper" : "bg-ink"}`}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className={`w-6 h-0.5 block transition-colors ${transparent ? "bg-paper" : "bg-ink"}`}
            animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.25 }}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden border-t border-hairline bg-paper overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="container-page flex flex-col py-4">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className="font-heading text-sm tracking-widest py-3 border-b border-hairline last:border-none block"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
