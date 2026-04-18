// ============================================================
// Wamanafo SHS — Parent Portal Layout (Liquid UI)
// ============================================================
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  GraduationCap, FileText, LogOut, LayoutDashboard, KeyRound, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview",        href: "/parent/portal",          icon: LayoutDashboard },
  { label: "Report Cards",    href: "/parent/report-cards",    icon: FileText        },
  { label: "Change Password", href: "/parent/change-password", icon: KeyRound        },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "PARENT")) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "rgb(248,250,252)" }}>
      <aside className="sidebar w-56 flex flex-col">
        <div className="sidebar-brand">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/90 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.15em]">Wamanafo SHS</p>
            <p className="text-xs text-white/40 mt-0.5">Parent Portal</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = item.href === "/parent/portal"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={cn("sidebar-nav-item", isActive && "active")}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-50" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[11px] text-white/35 truncate mb-2.5 px-1">
            Signed in as <span className="text-white/60 font-medium">{user.name}</span>
          </p>
          <button onClick={logout} className="sidebar-nav-item w-full text-red-300/70 hover:text-red-300">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
