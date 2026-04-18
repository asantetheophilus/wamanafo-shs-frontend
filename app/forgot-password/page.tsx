// ============================================================
// Wamanafo SHS — Forgot Password Page
// ============================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { GraduationCap, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await api.post("/api/v1/auth/forgot-password", { email }, { skipAuth: true });
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#e0f2f1 50%,#f0fafa 100%)" }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-700 mb-4 shadow-lg">
              <GraduationCap className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
              Reset Your Password
            </h1>
            <p className="text-sm text-slate-500 mt-1">Wamanafo Senior High Technical School</p>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                If <strong>{email}</strong> is registered, you will receive a password reset link shortly.
                Please check your inbox and spam folder.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 mb-6">
                The reset link expires in <strong>1 hour</strong>.
              </div>
              <Link href="/login" className="btn-primary w-full">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Enter your registered email address and we&apos;ll send you a secure link to reset your password.
              </p>

              {error && (
                <div className="alert-error mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu.gh"
                      className="input pl-10"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                    : "Send Reset Link"
                  }
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign in
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
