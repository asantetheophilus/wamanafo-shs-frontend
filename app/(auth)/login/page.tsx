"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

const DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin/dashboard", TEACHER: "/teacher/dashboard",
  STUDENT: "/student/portal", PARENT: "/parent/portal",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    const stored = localStorage.getItem("ghana_shs_user");
    if (stored) {
      const user = JSON.parse(stored) as { role: string };
      router.replace(DASHBOARDS[user.role] ?? "/");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Branded Image Panel ───────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-end overflow-hidden"
        style={{ background: "#0D5E6E" }}
      >
        {/* School entrance image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/school-entrance.jpg')" }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071F27]/90 via-[#071F27]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071F27]/30 to-transparent" />

        {/* Branding text over image */}
        <div className="relative z-10 px-12 pb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/90 backdrop-blur flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">Wamanafo SHS</p>
              <p className="text-white/60 text-xs">Academic Management System</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Wamanafo Senior High<br />
            <span className="text-yellow-400">Technical School</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-md">
            Empowering students with quality technical education.<br />
            PO Box 423, Sunyan · Brong-Ahafo Region, Ghana
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["Attendance Tracking","Report Cards","Score Management","Multi-Role Access"].map((f) => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login Form Panel ──────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-8 sm:px-12 xl:px-16 bg-white relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Wamanafo SHS</p>
            <p className="text-slate-500 text-xs">Academic Management System</p>
          </div>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your school account</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.gh"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 focus:bg-white transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-sm hover:shadow-md mt-1"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in"}
            </button>
          </form>

          {/* Role guide */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Role Access</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { role: "Admin",   color: "text-purple-700 bg-purple-50 border-purple-100" },
                { role: "Teacher", color: "text-blue-700 bg-blue-50 border-blue-100" },
                { role: "Student", color: "text-green-700 bg-green-50 border-green-100" },
                { role: "Parent",  color: "text-amber-700 bg-amber-50 border-amber-100" },
              ].map(({ role, color }) => (
                <span key={role} className={`text-xs font-medium px-2.5 py-1 rounded-lg border text-center ${color}`}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Wamanafo Senior High Technical School
        </p>
      </div>
    </div>
  );
}
