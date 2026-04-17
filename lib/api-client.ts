// ============================================================
// Wamanafo SHS Frontend — API Client
// All requests go to the Render backend at NEXT_PUBLIC_API_URL.
// Token is read from localStorage (set on login).
// ============================================================

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ghana_shs_token");
}

export function setToken(token: string): void {
  localStorage.setItem("ghana_shs_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("ghana_shs_token");
  localStorage.removeItem("ghana_shs_user");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ghana_shs_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem("ghana_shs_user", JSON.stringify(user));
}

export interface AuthUser {
  id:       string;
  email:    string;
  name:     string;
  role:     string;
  schoolId: string;
}

// ── Core fetch wrapper ────────────────────────────────────────

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: string; code?: string }> {
  const { skipAuth = false, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    // Token expired — clear and reload to login page
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    return { success: false, error: "Session expired. Please log in again.", code: "UNAUTHORIZED" };
  }

  const json = await res.json().catch(() => ({ success: false, error: "Invalid response." }));
  return json as { success: true; data: T } | { success: false; error: string; code?: string };
}

// ── Convenience helpers ───────────────────────────────────────

export const api = {
  get:    <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post:   <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "POST",   body: JSON.stringify(body), ...opts }),

  patch:  <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "PATCH",  body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};
