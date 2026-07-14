"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_STAFF,
  SESSION_STORAGE_KEY,
  type StaffMember,
  type StaffRole,
} from "@/lib/constants";

interface AuthState {
  user: StaffMember | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (pin: string) => StaffMember | null;
  signOut: () => void;
  switchRole: (role: StaffRole) => void;
  isCM: boolean;
  isDirector: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const { pin } = JSON.parse(saved);
        const found = DEMO_STAFF.find((s) => s.pin === pin);
        if (found) {
          setState({ user: found, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    } catch {
      // ignore
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const signIn = useCallback((pin: string): StaffMember | null => {
    const user =
      DEMO_STAFF.find((s) => s.pin === pin.slice(0, 4)) ?? null;
    if (user) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ pin: user.pin }));
      } catch {
        // ignore
      }
      setState({ user, isAuthenticated: true, isLoading: false });
    }
    return user;
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const switchRole = useCallback((role: StaffRole) => {
    const staff = DEMO_STAFF.find((s) => s.role === role);
    if (staff) {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ pin: staff.pin }));
      } catch {
        // ignore
      }
      setState({ user: staff, isAuthenticated: true, isLoading: false });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    switchRole,
    isCM: state.user?.role === "case_manager" || state.user?.role === "director",
    isDirector: state.user?.role === "director",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
