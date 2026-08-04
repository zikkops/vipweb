"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/data/site";
import MenuTrigger from "./MenuTrigger";
import MenuDrawer from "./MenuDrawer";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const visible = !isHome || pastHero;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setPastHero(window.scrollY > window.innerHeight - 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.header
            className={`fixed top-0 left-0 right-0 z-[110] bg-paper/95 backdrop-blur border-b ${
              scrolled || !isHome ? "border-hairline shadow-sm" : "border-transparent"
            }`}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-page flex items-center justify-between h-20">
              <Link
                href="/"
                className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink"
              >
                {site.name}<span className="text-muted">_</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-heading text-sm tracking-widest text-ink hover:text-muted transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <MenuTrigger open={open} onClick={() => setOpen((v) => !v)} dark />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
