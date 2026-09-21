"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "./Session";

const NAV = [
  { href: "/dashboard/", label: "Report" },
  { href: "/dashboard/history/", label: "History" },
  { href: "/dashboard/admin/", label: "Admin", admin: true },
];

export default function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { user, logout } = useSession();
  const pathname = usePathname().replace(/\/?$/, "/");

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-hairline bg-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
          <Link href="/dashboard/" className="flex items-center gap-3">
            <Image src="/images/logo.webp" alt="VIPMINDS" width={112} height={30} className="h-6 w-auto" />
            <span className="font-heading text-sm uppercase tracking-widest text-muted">Daily dues</span>
          </Link>

          {user && (
            <>
              <nav className="flex gap-6">
                {NAV.filter((n) => !n.admin || user.role === "admin").map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`font-heading text-sm uppercase tracking-widest transition-colors ${
                      pathname === n.href ? "text-accent" : "text-ink hover:text-accent"
                    }`}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-4 text-sm">
                <span className="hidden text-muted sm:inline">
                  {user.name}
                  {user.role === "admin" && <span className="ml-2 text-accent">admin</span>}
                </span>
                <button
                  onClick={logout}
                  className="font-heading text-sm uppercase tracking-widest text-ink hover:text-accent"
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
