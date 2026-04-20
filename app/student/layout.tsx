// ============================================================
// Wamanafo SHS — Student Portal Layout (Liquid UI)
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, FileText, BookOpen, ClipboardList,
  LogOut, GraduationCap, KeyRound, ChevronRight, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",      href: "/student/portal",         icon: LayoutDashboard },
  { label: "Report Cards",   href: "/student/report-cards",   icon: FileText        },
  { label: "Scores",         href: "/student/scores",         icon: BookOpen        },
  { label: "Attendance",     href: "/student/attendance",     icon: ClipboardList   },
  { label: "Change Password",href: "/student/change-password",icon: KeyRound        },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "STUDENT")) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen md:h-screen overflow-hidden" style={{ background: "rgb(248,250,252)" }}>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-teal-700 uppercase tracking-[0.12em] truncate">Wamanafo SHS</p>
          <p className="text-xs text-slate-500 truncate">Student Portal</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="btn-icon btn-secondary"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        className={cn(
          "sidebar w-56 flex flex-col fixed md:static inset-y-0 left-0 z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="sidebar-brand">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/90 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.15em]">Wamanafo SHS</p>
            <p className="text-xs text-white/40 mt-0.5">Student Portal</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = item.href === "/student/portal"
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
      <main className="flex-1 overflow-y-auto pt-[60px] md:pt-0">{children}</main>
    </div>
  );
}
