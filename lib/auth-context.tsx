// ============================================================
// Wamanafo SHS Frontend - Auth Context
// Stores JWT in localStorage and validates user role from /auth/me.
// ============================================================

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  api,
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  type AuthUser,
} from "./api-client";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setAuthSignalCookie(role: string): void {
  const value = encodeURIComponent(JSON.stringify({ role }));
  document.cookie = `ghana_shs_auth=${value}; path=/; SameSite=Strict; Max-Age=28800`;
}

function clearAuthSignalCookie(): void {
  document.cookie = "ghana_shs_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = getToken();
      const storedUser = getStoredUser();

      if (!storedToken || !storedUser) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) {
        setTokenState(storedToken);
        setUser(storedUser);
        setAuthSignalCookie(storedUser.role);
      }

      const me = await api.get<AuthUser>("/api/v1/auth/me");
      if (!me.success) {
        clearToken();
        clearAuthSignalCookie();
        if (!cancelled) {
          setUser(null);
          setTokenState(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setStoredUser(me.data);
        setUser(me.data);
        setAuthSignalCookie(me.data.role);
        setLoading(false);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>(
      "/api/v1/auth/login",
      { email, password },
      { skipAuth: true }
    );

    if (!res.success) return { error: res.error };

    setToken(res.data.token);
    setStoredUser(res.data.user);
    setTokenState(res.data.token);
    setUser(res.data.user);
    setAuthSignalCookie(res.data.user.role);
    return {};
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearAuthSignalCookie();
    setTokenState(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(requiredRole?: string) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      window.location.href = "/login";
    }
    if (!auth.loading && requiredRole && auth.user?.role !== requiredRole) {
      window.location.href = "/";
    }
  }, [auth.loading, auth.user, requiredRole]);

  return auth;
}
