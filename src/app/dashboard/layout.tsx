import type { Metadata } from "next";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { SessionProvider } from "@/components/dashboard/Session";

export const metadata: Metadata = {
  title: "Daily Dues — VIPMINDS",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </SessionProvider>
  );
}
