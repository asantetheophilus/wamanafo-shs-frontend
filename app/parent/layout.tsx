"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, FileText, LogOut } from "lucide-react";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "PARENT")) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-950 text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Wamanafo SHS · Parent Portal</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/parent/portal" className="text-teal-200 hover:text-white transition-colors">Overview</Link>
          <Link href="/parent/report-cards" className="text-teal-200 hover:text-white transition-colors flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />Report Cards
          </Link>
          <span className="text-teal-400">{user.name}</span>
          <button onClick={logout} className="text-teal-300 hover:text-white transition-colors flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />Sign out
          </button>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
