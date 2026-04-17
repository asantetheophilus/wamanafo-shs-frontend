// ============================================================
// Wamanafo SHS — Student Portal Layout
// Simple, clean layout — no operational controls visible.
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, FileText, BookOpen, ClipboardList, LogOut, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",    href: "/student/portal",       icon: LayoutDashboard },
  { label: "Report Cards", href: "/student/report-cards", icon: FileText        },
  { label: "Scores",       href: "/student/scores",       icon: BookOpen        },
  { label: "Attendance",   href: "/student/attendance",   icon: ClipboardList   },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "STUDENT")) router.replace("/login");
  }, [user, loading, router]);

  const pathname = usePathname();

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex w-56 flex-col bg-teal-950 text-white shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-teal-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-600 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">Wamanafo SHS</p>
            <p className="text-xs text-teal-300 mt-0.5">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = item.href === "/student/portal"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-teal-700 text-white" : "text-teal-200 hover:bg-teal-800 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-teal-800 px-4 py-4">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm
              text-teal-300 hover:bg-teal-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
