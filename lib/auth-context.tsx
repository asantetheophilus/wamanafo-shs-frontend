// ============================================================
// Wamanafo SHS Frontend — Auth Context
// Replaces NextAuth. Stores JWT in localStorage.
// Provides useAuth() hook throughout the app.
// ============================================================

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getToken, setToken, clearToken, getStoredUser, setStoredUser, type AuthUser } from "./api-client";

interface AuthContextValue {
  user:    AuthUser | null;
  token:   string | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<{ error?: string }>;
  logout:  () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = getToken();
    const storedUser  = getStoredUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
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
    // Set cookie for middleware (role only — no sensitive data)
    document.cookie = `ghana_shs_auth=${JSON.stringify({ role: res.data.user.role })}; path=/; SameSite=Strict`;
    return {};
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    document.cookie = "ghana_shs_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Convenience hook for pages that require auth
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
