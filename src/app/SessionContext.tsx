import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Session, Role } from "@/types/governance";
import { readSession, writeSession, clearSession } from "@/lib/session";

interface SessionState {
  session: Session | null;
  login: (s: Session) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const navigate = useNavigate();

  const login = useCallback((s: Session) => {
    writeSession(s);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    navigate("/login");
  }, [navigate]);

  const switchRole = useCallback((role: Role) => {
    if (!session) return;
    const updated = { ...session, role };
    writeSession(updated);
    setSession(updated);
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, login, logout, switchRole }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

export function useRole(): Role | null {
  return useSession().session?.role ?? null;
}
