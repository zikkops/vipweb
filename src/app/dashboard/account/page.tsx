"use client";

import ChangePassword from "@/components/dashboard/ChangePassword";
import { useUser } from "@/components/dashboard/Session";
import { PAGE_TITLE } from "@/components/dashboard/ui";

export default function AccountPage() {
  const user = useUser();

  return (
    <div>
      <h1 className={PAGE_TITLE}>
        Account<span className="text-accent">_</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        {user.name} · {user.email} · {user.role === "admin" ? "Admin" : "Employee"}
      </p>
      <div className="mt-8">
        <ChangePassword />
      </div>
    </div>
  );
}
