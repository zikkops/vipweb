"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import MenuTrigger from "./MenuTrigger";
import MenuDrawer from "./MenuDrawer";

const NAV_IDS = nav.map((n) => n.id);

export default function HeroNav() {
  const [open, setOpen] = useState(false);
  const activeSection = useActiveSection(NAV_IDS);

  return (
    <div className="absolute inset-x-0 top-0 z-20">
      <div className="w-full px-10 flex items-center justify-between h-20">
        <Link href="/#home" className="block">
          <Image
            src="/images/logo-light.webp"
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
              className="group relative font-heading font-semibold uppercase text-[19px] tracking-widest pb-1 text-paper"
            >
              {item.label}
              <span
                className={`absolute left-0 bottom-0 h-[4px] w-full bg-paper origin-left transition-transform duration-300 ease-out ${
                  activeSection === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
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
