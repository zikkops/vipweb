"use client";

import { useState } from "react";
import Link from "next/link";
import { nav, site } from "@/data/site";
import MenuTrigger from "./MenuTrigger";
import MenuDrawer from "./MenuDrawer";

export default function HeroNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute inset-x-0 top-0 z-20">
      <div className="container-page flex items-center justify-between h-20">
        <Link
          href="/"
          className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-paper"
        >
          {site.name}<span className="text-paper/70">_</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-heading text-sm tracking-widest text-paper hover:text-paper/70 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <MenuTrigger open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
