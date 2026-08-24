"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import MenuTrigger from "./MenuTrigger";
import MenuDrawer from "./MenuDrawer";

const NAV_IDS = nav.map((n) => n.id);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const activeSection = useActiveSection(NAV_IDS);
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
            <div className="w-full px-10 flex items-center justify-between h-20">
              <Link href="/" className="block">
                <Image
                  src="/images/logo.webp"
                  alt={site.name}
                  width={797}
                  height={214}
                  priority
                  sizes="200px"
                  className="h-9 md:h-10 w-auto"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative font-heading font-semibold uppercase text-[19px] tracking-widest pb-1 text-ink"
                  >
                    {item.label}
                    <span
                      className={`absolute left-0 bottom-0 h-[4px] w-full bg-ink origin-left transition-transform duration-300 ease-out ${
                        activeSection === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
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
