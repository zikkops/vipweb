"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/lib/dues";
import { currentProfile, signOut, supabase } from "./db";

type SessionValue = {
  user: User | null;
  /** True after arriving from a password-reset email, until a new password is saved. */
  recovering: boolean;
  setRecovering: (value: boolean) => void;
  /** Re-reads the signed-in person, e.g. after an admin changed your role. */
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

/** How often an open tab re-checks the profile (role changes, deactivation). */
const REVALIDATE_MS = 60_000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [notice, setNotice] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname.replace(/\/?$/, "/") === LOGIN_PATH;

  const refresh = useCallback(async () => {
    const profile = await currentProfile().catch(() => null);
    if (profile && (!profile.active || !profile.approved)) {
      // Deactivated or not yet approved: the database already refuses everything, so sign out cleanly.
      await signOut();
      setNotice(
        profile.active
          ? "Your account is waiting for an admin to approve it. Try again once they have."
          : "This account has been deactivated. Ask an admin to turn it back on."
      );
      setUser(null);
    } else {
      setUser(profile);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session check
    refresh();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    // Pick up role changes or a deactivated account without a reload.
    const onFocus = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = setInterval(refresh, REVALIDATE_MS);
    return () => {
      data.subscription.unsubscribe();
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
    await signOut();
    setUser(null);
  }, []);

  const ready = loaded && (onLogin ? !user : !!user);

  return (
    <SessionContext.Provider value={{ user, recovering, setRecovering, refresh, logout }}>
      {notice && onLogin && <p className="mx-auto mb-6 max-w-md text-sm text-brand-coral">{notice}</p>}
      {ready ? children : <p className="py-24 text-center text-sm text-muted">Loading…</p>}
    </SessionContext.Provider>
  );
}
