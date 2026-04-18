// ============================================================
// Wamanafo SHS — Admin Layout Shell (Liquid UI)
// ============================================================
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardList, FileText, BarChart2, Bell, LogOut,
  School, Settings, TrendingUp, Upload,
  KeyRound, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label:   string;
  href:    string;
  icon:    React.ElementType;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/admin/dashboard",       icon: LayoutDashboard, section: "Main"     },
  { label: "Students",      href: "/admin/students",        icon: GraduationCap,   section: "People"   },
  { label: "Teachers",      href: "/admin/teachers",        icon: Users,           section: "People"   },
  { label: "Import Students",href:"/admin/students/import", icon: Upload,          section: "People"   },
  { label: "Classes",       href: "/admin/classes",         icon: School,          section: "Academic" },
  { label: "Subjects",      href: "/admin/subjects",        icon: BookOpen,        section: "Academic" },
  { label: "Terms",         href: "/admin/terms",           icon: Settings,        section: "Academic" },
  { label: "Attendance",    href: "/admin/attendance",      icon: ClipboardList,   section: "Records"  },
  { label: "Scores",        href: "/admin/scores",          icon: ClipboardList,   section: "Records"  },
  { label: "Report Cards",  href: "/admin/report-cards",   icon: FileText,        section: "Records"  },
  { label: "Analytics",     href: "/admin/analytics",       icon: BarChart2,       section: "Insights" },
  { label: "Promotion",     href: "/admin/promotion",       icon: TrendingUp,      section: "Insights" },
  { label: "Notifications", href: "/admin/notifications",   icon: Bell,            section: "System"   },
  { label: "School Settings",href:"/admin/settings",        icon: Settings,        section: "System"   },
  { label: "Change Password",href:"/admin/change-password", icon: KeyRound,        section: "System"   },
];

const SECTIONS = ["Main", "People", "Academic", "Records", "Insights", "System"];

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  schoolName?: string;
  schoolLogo?: string;
}

export function AdminLayout({ children, userName, schoolName, schoolLogo }: AdminLayoutProps) {
  const { logout } = useAuth();
  const pathname   = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "rgb(248,250,252)" }}>
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className="sidebar w-64 shrink-0 flex flex-col">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/90 shrink-0 shadow-inner">
            {schoolLogo
              ? <Image src={schoolLogo} alt="Logo" width={36} height={36} className="rounded-xl object-cover" />
              : <GraduationCap className="w-5 h-5 text-white" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.15em] truncate">Wamanafo SHS</p>
            {schoolName
              ? <p className="text-xs text-white/40 truncate mt-0.5">{schoolName}</p>
              : <p className="text-xs text-white/40 mt-0.5">Admin Portal</p>
            }
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-5">
          {SECTIONS.map((section) => {
            const items = NAV_ITEMS.filter((n) => n.section === section);
            if (!items.length) return null;
            return (
              <div key={section}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 px-3 mb-1.5">
                  {section}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive =
                      item.href === "/admin/dashboard"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn("sidebar-nav-item", isActive && "active")}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-50" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {userName && (
            <p className="text-[11px] text-white/35 truncate mb-2.5 px-1">
              Signed in as <span className="text-white/60 font-medium">{userName}</span>
            </p>
          )}
          <button
            onClick={logout}
            className="sidebar-nav-item w-full text-red-300/70 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
