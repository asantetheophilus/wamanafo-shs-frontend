// ============================================================
// Wamanafo SHS — Admin Layout Shell
// Wraps all /admin/* pages with sidebar navigation.
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  BarChart2,
  Bell,
  LogOut,
  School,
  ChevronRight,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Students",    href: "/admin/students",   icon: GraduationCap   },
  { label: "Teachers",    href: "/admin/teachers",   icon: Users           },
  { label: "Classes",     href: "/admin/classes",    icon: School          },
  { label: "Terms",       href: "/admin/terms",      icon: Settings        },
  { label: "Subjects",    href: "/admin/subjects",   icon: BookOpen        },
  { label: "Attendance",  href: "/admin/attendance", icon: ClipboardList   },
  { label: "Scores",      href: "/admin/scores",     icon: ClipboardList   },
  { label: "Report Cards",href: "/admin/report-cards", icon: FileText      },
  { label: "Analytics",   href: "/admin/analytics",  icon: BarChart2       },
  { label: "Promotion",   href: "/admin/promotion",  icon: TrendingUp      },
  { label: "Notifications",href:"/admin/notifications",icon: Bell          },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  schoolName?: string;
}

export function AdminLayout({ children, userName, schoolName }: AdminLayoutProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="flex w-64 flex-col bg-teal-950 text-white shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-teal-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-600 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest truncate">
              Wamanafo SHS
            </p>
            {schoolName && (
              <p className="text-xs text-teal-300 truncate mt-0.5">{schoolName}</p>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-teal-200 hover:bg-teal-800 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User */}
        <div className="border-t border-teal-800 px-4 py-4">
          {userName && (
            <p className="text-xs text-teal-400 truncate mb-3">
              Signed in as <span className="font-medium text-teal-200">{userName}</span>
            </p>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-teal-300
              hover:bg-teal-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
