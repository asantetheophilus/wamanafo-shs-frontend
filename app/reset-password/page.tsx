// ============================================================
// Wamanafo SHS — Reset Password Page
// ============================================================
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  GraduationCap, Eye, EyeOff, Loader2,
  CheckCircle2, XCircle, AlertCircle, ArrowLeft,
} from "lucide-react";

const RULES = [
  { key: "length",  label: "At least 6 characters",          test: (p: string) => p.length >= 6          },
  { key: "upper",   label: "At least one uppercase letter",  test: (p: string) => /[A-Z]/.test(p)        },
  { key: "lower",   label: "At least one lowercase letter",  test: (p: string) => /[a-z]/.test(p)        },
  { key: "special", label: "At least one special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token. Please request a new link.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const failedRule = RULES.find((r) => !r.test(password));
    if (failedRule) { setError(failedRule.label + "."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const res = await api.post("/api/v1/auth/reset-password",
      { token, newPassword: password, confirmPassword: confirm },
      { skipAuth: true }
    );
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#e0f2f1 50%,#f0fafa 100%)" }}>
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-700 mb-4 shadow-lg">
              <GraduationCap className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
              Create New Password
            </h1>
            <p className="text-sm text-slate-500 mt-1">Wamanafo Senior High Technical School</p>
          </div>

          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-900 mb-2">Password Reset Successfully</h2>
              <p className="text-sm text-slate-500 mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link href="/login" className="btn-primary w-full">
                <ArrowLeft className="w-4 h-4" />
                Sign in now
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert-error mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="input pr-11"
                      disabled={!token}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2.5 space-y-1.5 pl-1">
                      {RULES.map((r) => {
                        const met = r.test(password);
                        return (
                          <p key={r.key} className={cn("pw-rule", met ? "met" : "unmet")}>
                            {met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {r.label}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showCf ? "text" : "password"}
                      required value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      disabled={!token}
                      className={cn("input pr-11",
                        confirm && confirm !== password && "input-error"
                      )}
                    />
                    <button type="button" onClick={() => setShowCf(!showCf)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="field-error"><XCircle className="w-3 h-3" />Passwords do not match</p>
                  )}
                </div>

                <button type="submit" disabled={loading || !token} className="btn-primary w-full">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting…</>
                    : "Set New Password"
                  }
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/forgot-password"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Request a new reset link
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} Wamanafo Senior High Technical School
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  );
}
