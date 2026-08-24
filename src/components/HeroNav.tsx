"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/data/site";
import MenuTrigger from "./MenuTrigger";
import MenuDrawer from "./MenuDrawer";

export default function HeroNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="absolute inset-x-0 top-0 z-20">
      <div className="w-full px-10 flex items-center justify-between h-20">
        <Link
          href="/"
          className="font-heading text-3xl md:text-4xl font-semibold uppercase tracking-tight text-paper"
        >
          {site.name}<span className="text-paper/70">_</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative font-heading font-semibold uppercase text-[19px] tracking-widest pb-1 text-paper"
            >
              {item.label}
              <span
                className={`absolute left-0 bottom-0 h-[4px] w-full bg-paper origin-left transition-transform duration-300 ease-out ${
                  pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </nav>

        <MenuTrigger open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
