// ============================================================
// Wamanafo SHS — Admin Dashboard (Liquid UI)
// ============================================================
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  GraduationCap, Users, School, ClipboardList, AlertTriangle,
  BookOpen, Upload, Settings, FileText, ArrowRight,
} from "lucide-react";
import { StatCard }              from "@/components/dashboard/StatCard";
import { PendingActionsPanel }   from "@/components/dashboard/PendingActionsPanel";
import { GradeDistributionChart }from "@/components/dashboard/GradeDistributionChart";
import { ClassPerformanceChart } from "@/components/dashboard/ClassPerformanceChart";
import { apiFetch }              from "@/lib/api-client";

interface DashboardStats {
  currentTermName:          string | null;
  currentYearName:          string | null;
  activeStudents:           number;
  totalStudents:            number;
  totalTeachers:            number;
  totalClasses:             number;
  pendingScores:            number;
  unpublishedReportCards:   number;
  averageAttendancePercent: number | null;
  belowThresholdCount:      number;
  gradeDistribution:        Array<{ grade: string; count: number }>;
  classPerformance:         Array<{ className: string; averageScore: number; studentCount: number }>;
  attendanceAlerts:         Array<{ studentName: string; indexNumber: string; percentage: number }>;
}

function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn:  async () => {
      const res = await apiFetch<DashboardStats>("/api/v1/analytics");
      if (!res.success) throw new Error(res.error ?? "Failed to load dashboard stats");
      return res.data;
    },
    refetchInterval: 60_000,
  });
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  return (
    <div className="page-shell">
      {/* ── Welcome banner ──────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden relative h-36 flex items-end"
        style={{ background: "linear-gradient(135deg,#0D5E6E 0%,#0a4a56 60%,#071e25 100%)" }}
      >
        {/* Subtle school image overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/school-entrance.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 to-transparent" />
        <div className="relative z-10 px-7 pb-6">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.18em] mb-1">Admin Dashboard</p>
          <h1 className="text-white text-2xl font-bold leading-tight" style={{ fontFamily: "Georgia,serif" }}>
            Wamanafo Senior High Technical School
          </h1>
          {stats?.currentTermName && (
            <p className="text-white/60 text-sm mt-0.5">
              {stats.currentTermName} · {stats.currentYearName}
            </p>
          )}
        </div>
        <div className="absolute right-7 bottom-6 flex gap-2">
          <Link href="/admin/students/import" className="btn-gold btn-sm">
            <Upload className="w-3.5 h-3.5" />Import Students
          </Link>
          <Link href="/admin/settings" className="btn-secondary btn-sm">
            <Settings className="w-3.5 h-3.5" />Settings
          </Link>
        </div>
      </div>

      {isError && (
        <div className="alert-error">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Could not load dashboard data. Check connection or try refreshing.</span>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Students" value={isLoading ? "—" : stats?.activeStudents ?? 0}
          icon={GraduationCap} iconBg="bg-teal-100 text-teal-700"
          subtext={stats ? `${stats.totalStudents} total enrolled` : undefined}
          href="/admin/students"
        />
        <StatCard
          label="Teachers" value={isLoading ? "—" : stats?.totalTeachers ?? 0}
          icon={Users} iconBg="bg-amber-100 text-amber-700"
          href="/admin/teachers"
        />
        <StatCard
          label="Classes" value={isLoading ? "—" : stats?.totalClasses ?? 0}
          icon={School} iconBg="bg-slate-100 text-slate-600"
          subtext="This academic year"
          href="/admin/classes"
        />
        <StatCard
          label="Avg Attendance"
          value={isLoading ? "—" : stats?.averageAttendancePercent != null
            ? `${stats.averageAttendancePercent.toFixed(1)}%` : "—"}
          icon={ClipboardList}
          iconBg={(stats?.averageAttendancePercent ?? 100) < 75
            ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}
          subtext={stats?.belowThresholdCount
            ? `${stats.belowThresholdCount} below 75%` : "All students on track"}
          urgent={!!stats?.belowThresholdCount && stats.belowThresholdCount > 0}
          href="/admin/attendance"
        />
      </div>

      {/* ── Main grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PendingActionsPanel
            pendingScores={stats?.pendingScores ?? 0}
            unpublishedReportCards={stats?.unpublishedReportCards ?? 0}
          />
        </div>

        {/* Quick access */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Quick Access</h3>
              <p className="text-xs text-slate-400 mt-0.5">Navigate to key sections</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/admin/students",       icon: GraduationCap, label: "Students",        desc: `${stats?.activeStudents ?? "—"} active`,           bg: "bg-teal-50 text-teal-700"   },
              { href: "/admin/teachers",       icon: Users,          label: "Teachers",        desc: `${stats?.totalTeachers ?? "—"} on staff`,          bg: "bg-amber-50 text-amber-700" },
              { href: "/admin/scores",         icon: BookOpen,       label: "Score Approval",  desc: `${stats?.pendingScores ?? 0} pending`,             bg: "bg-blue-50 text-blue-700"   },
              { href: "/admin/report-cards",   icon: FileText,       label: "Report Cards",    desc: `${stats?.unpublishedReportCards ?? 0} unpublished`, bg: "bg-purple-50 text-purple-700"},
              { href: "/admin/students/import",icon: Upload,         label: "Import Students", desc: "Bulk add via Excel",                               bg: "bg-emerald-50 text-emerald-700"},
              { href: "/admin/settings",       icon: Settings,       label: "School Settings", desc: "Logo & info",                                      bg: "bg-slate-100 text-slate-600" },
            ].map((item) => (
              <Link
                key={item.href} href={item.href}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100
                  hover:border-teal-300 hover:bg-teal-50/30 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg} transition-colors`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors leading-tight">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 ml-auto shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Grade Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Approved scores this term, all subjects</p>
          </div>
          <div className="p-6">
            {isLoading
              ? <div className="h-48 skeleton" />
              : <GradeDistributionChart data={stats?.gradeDistribution ?? []} />
            }
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Class Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Average score per class (approved only)</p>
          </div>
          <div className="p-6">
            {isLoading
              ? <div className="h-48 skeleton" />
              : <ClassPerformanceChart data={stats?.classPerformance ?? []} />
            }
          </div>
        </div>
      </div>

      {/* ── Attendance alert ─────────────────────────────── */}
      {stats && stats.belowThresholdCount > 0 && (
        <div className="alert-warning rounded-2xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {stats.belowThresholdCount} student{stats.belowThresholdCount !== 1 ? "s" : ""} below 75% attendance threshold
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Parents of affected students may be notified via SMS.</p>
          </div>
          <Link href="/admin/attendance" className="text-xs font-semibold text-amber-700 hover:underline shrink-0">
            View attendance →
          </Link>
        </div>
      )}
    </div>
  );
}
