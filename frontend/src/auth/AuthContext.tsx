import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthSession } from "../types";

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession, remember?: boolean) => void;
  clearSession: () => void;
};

const PERSISTENT_STORAGE_KEY = "dealzone_session";
const SESSION_STORAGE_KEY = "dealzone_session_temp";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSessionState] = useState<AuthSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(PERSISTENT_STORAGE_KEY) ?? sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AuthSession;
      setSessionState(parsed);
    } catch {
      localStorage.removeItem(PERSISTENT_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  function setSession(nextSession: AuthSession, remember = true): void {
    setSessionState(nextSession);

    const serialized = JSON.stringify(nextSession);
    if (remember) {
      localStorage.setItem(PERSISTENT_STORAGE_KEY, serialized);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    localStorage.removeItem(PERSISTENT_STORAGE_KEY);
  }

  function clearSession(): void {
    setSessionState(null);
    localStorage.removeItem(PERSISTENT_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      setSession,
      clearSession
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
