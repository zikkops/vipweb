"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/lib/dues";
import { api } from "./api";

type SessionValue = {
  user: User | null;
  setUser: (user: User | null) => void;
  /** Re-reads the signed-in user, e.g. after an admin changed your role. */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>.");
  return value;
}

/** The signed-in user. Only valid on pages the guard below lets through. */
export function useUser(): User {
  const { user } = useSession();
  if (!user) throw new Error("No signed-in user.");
  return user;
}

export const LOGIN_PATH = "/dashboard/login/";

/** How often an open tab re-checks the session (role changes, deactivation). */
const REVALIDATE_MS = 60_000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname.replace(/\/?$/, "/") === LOGIN_PATH;

  const refresh = useCallback(async () => {
    const { user } = await api<{ user: User | null }>("auth/me/").catch(() => ({ user: null }));
    setUser(user);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session check
    refresh();
    // Pick up role changes or a deactivated account without a reload.
    const onFocus = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = setInterval(refresh, REVALIDATE_MS);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      clearInterval(timer);
    };
  }, [refresh]);

  useEffect(() => {
    if (!loaded) return;
    if (!user && !onLogin) router.replace(LOGIN_PATH);
    if (user && onLogin) router.replace("/dashboard/");
  }, [loaded, user, onLogin, router]);

  const logout = useCallback(async () => {
    await api("auth/logout/", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  const ready = loaded && (onLogin ? !user : !!user);

  return (
    <SessionContext.Provider value={{ user, setUser, refresh, logout }}>
      {ready ? children : <p className="py-24 text-center text-sm text-muted">Loading…</p>}
    </SessionContext.Provider>
  );
}
