// ============================================================
// Wamanafo SHS — Change Password Form (shared across roles)
// ============================================================
"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RULES = [
  { key: "length",  label: "At least 6 characters",           test: (p: string) => p.length >= 6         },
  { key: "upper",   label: "At least one uppercase letter",   test: (p: string) => /[A-Z]/.test(p)       },
  { key: "lower",   label: "At least one lowercase letter",   test: (p: string) => /[a-z]/.test(p)       },
  { key: "special", label: "At least one special character",  test: (p: string) => /[^A-Za-z0-9]/.test(p)},
];

interface ShowState { current: boolean; newPw: boolean; confirm: boolean; }

export function ChangePasswordForm() {
  const [form, setForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow]     = useState<ShowState>({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggle = (field: keyof ShowState) => setShow((s) => ({ ...s, [field]: !s[field] }));
  const set    = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match."); return;
    }
    const failedRule = RULES.find((r) => !r.test(form.newPassword));
    if (failedRule) { setError(failedRule.label + "."); return; }

    setLoading(true);
    const res = await api.post("/api/v1/auth/change-password", {
      currentPassword: form.currentPassword,
      newPassword:     form.newPassword,
      confirmPassword: form.confirmPassword,
    });
    setLoading(false);

    if (!res.success) { setError(res.error); return; }
    setSuccess(true);
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <div className="card max-w-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-teal-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500">Update your account password securely</p>
        </div>
      </div>

      {success && (
        <div className="alert-success mb-5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Password changed successfully!</span>
        </div>
      )}
      {error && (
        <div className="alert-error mb-5 rounded-xl">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current password */}
        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              value={form.currentPassword}
              onChange={set("currentPassword")}
              required
              placeholder="Enter current password"
              className="input pr-11"
            />
            <button type="button" onClick={() => toggle("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <input
              type={show.newPw ? "text" : "password"}
              value={form.newPassword}
              onChange={set("newPassword")}
              required
              placeholder="Create a strong password"
              className="input pr-11"
            />
            <button type="button" onClick={() => toggle("newPw")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength rules */}
          {form.newPassword && (
            <div className="mt-2.5 space-y-1.5 pl-1">
              {RULES.map((r) => {
                const met = r.test(form.newPassword);
                return (
                  <p key={r.key} className={cn("pw-rule", met ? "met" : "unmet")}>
                    {met
                      ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      : <XCircle     className="w-3.5 h-3.5 shrink-0" />
                    }
                    {r.label}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              required
              placeholder="Repeat new password"
              className={cn("input pr-11",
                form.confirmPassword && form.confirmPassword !== form.newPassword && "input-error"
              )}
            />
            <button type="button" onClick={() => toggle("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.confirmPassword && form.confirmPassword !== form.newPassword && (
            <p className="field-error"><XCircle className="w-3 h-3" />Passwords do not match</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating…</> : "Update Password"}
        </button>
      </form>
    </div>
  );
}
