"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return <main className={isHome ? "" : "pt-20"}>{children}</main>;
}
