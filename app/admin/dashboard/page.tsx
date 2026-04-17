// ============================================================
// Wamanafo SHS — Admin Dashboard (Phase 10 — full implementation)
// ============================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  GraduationCap, Users, School, ClipboardList,
  AlertTriangle, TrendingUp, BookOpen,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { PendingActionsPanel } from "@/components/dashboard/PendingActionsPanel";
import { GradeDistributionChart } from "@/components/dashboard/GradeDistributionChart";
import { ClassPerformanceChart } from "@/components/dashboard/ClassPerformanceChart";
import { apiFetch } from "@/lib/api-client";


interface DashboardStats {
  // Term / year
  currentTermName:         string | null;
  currentYearName:         string | null;
  // Student counts
  activeStudents:          number;
  totalStudents:           number;
  totalTeachers:           number;
  totalClasses:            number;
  pendingScores:           number;
  unpublishedReportCards:  number;
  // Attendance
  averageAttendancePercent: number | null;
  belowThresholdCount:     number;
  // Charts
  gradeDistribution:       Array<{ grade: string; count: number }>;
  classPerformance:        Array<{ className: string; averageScore: number; studentCount: number }>;
  attendanceAlerts:        Array<{ studentName: string; indexNumber: string; percentage: number }>;
}

function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
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
    <div className="px-8 py-7 space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Dashboard</h1>
        {stats?.currentTermName && (
          <p className="text-sm text-slate-500 mt-1">
            {stats.currentTermName} · {stats.currentYearName}
          </p>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Could not load dashboard data</p>
            <p className="text-xs text-red-600 mt-0.5">
              Check your connection or try refreshing the page.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={isLoading ? "—" : stats?.activeStudents ?? 0}
          icon={GraduationCap}
          iconBg="bg-teal-100 text-teal-700"
          subtext={stats ? `${stats.totalStudents} total enrolled` : undefined}
        />
        <StatCard
          label="Teachers"
          value={isLoading ? "—" : stats?.totalTeachers ?? 0}
          icon={Users}
          iconBg="bg-yellow-100 text-yellow-700"
        />
        <StatCard
          label="Classes"
          value={isLoading ? "—" : stats?.totalClasses ?? 0}
          icon={School}
          iconBg="bg-slate-100 text-slate-600"
          subtext="This academic year"
        />
        <StatCard
          label="Avg Attendance"
          value={
            isLoading ? "—"
            : stats?.averageAttendancePercent != null
              ? `${stats.averageAttendancePercent.toFixed(1)}%`
              : "—"
          }
          icon={ClipboardList}
          iconBg={
            (stats?.averageAttendancePercent ?? 100) < 75
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }
          subtext={
            stats?.belowThresholdCount
              ? `${stats.belowThresholdCount} below 75%`
              : "All students on track"
          }
          urgent={!!stats?.belowThresholdCount && stats.belowThresholdCount > 0}
        />
      </div>

      {/* Pending actions + quick links */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <PendingActionsPanel
            pendingScores={stats?.pendingScores ?? 0}
            unpublishedReportCards={stats?.unpublishedReportCards ?? 0}
          />
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Quick Access</h3>
              <p className="text-xs text-slate-400 mt-0.5">Navigate to key sections</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { href: "/admin/students",     icon: GraduationCap, label: "Students",       desc: `${stats?.activeStudents ?? "—"} active` },
                { href: "/admin/teachers",     icon: Users,          label: "Teachers",       desc: `${stats?.totalTeachers ?? "—"} on staff` },
                { href: "/admin/scores",       icon: BookOpen,       label: "Score Approval", desc: `${stats?.pendingScores ?? 0} pending` },
                { href: "/admin/report-cards", icon: ClipboardList,  label: "Report Cards",   desc: `${stats?.unpublishedReportCards ?? 0} unpublished` },
                { href: "/admin/attendance",   icon: TrendingUp,     label: "Attendance",     desc: stats?.belowThresholdCount ? `${stats.belowThresholdCount} below threshold` : "View records" },
                { href: "/admin/classes",      icon: School,         label: "Classes",        desc: `${stats?.totalClasses ?? "—"} this year` },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200
                    hover:border-teal-300 hover:bg-teal-50/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-md bg-slate-100 group-hover:bg-teal-100
                    flex items-center justify-center shrink-0 transition-colors">
                    <item.icon className="w-4 h-4 text-slate-500 group-hover:text-teal-700 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-teal-700 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">Grade Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Approved scores this term, all subjects</p>
          </div>
          <div className="px-5 py-5">
            {isLoading
              ? <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />
              : <GradeDistributionChart data={stats?.gradeDistribution ?? []} />
            }
          </div>
          {stats && (
            <div className="px-5 pb-4 flex items-center gap-4 text-xs text-slate-400">
              {["A1","B2","B3"].map((g) => (
                <span key={g}>
                  <span className="font-medium text-green-700">{g}</span>:{" "}
                  {stats.gradeDistribution.find((d) => d.grade === g)?.count ?? 0}
                </span>
              ))}
              <span className="ml-auto">
                <span className="font-medium text-red-700">F9</span>:{" "}
                {stats.gradeDistribution.find((d) => d.grade === "F9")?.count ?? 0}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">Class Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Average score per class (approved only)</p>
          </div>
          <div className="px-5 py-5">
            {isLoading
              ? <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />
              : <ClassPerformanceChart data={stats?.classPerformance ?? []} />
            }
          </div>
        </div>
      </div>

      {/* Attendance alert */}
      {stats && stats.belowThresholdCount > 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              {stats.belowThresholdCount} student{stats.belowThresholdCount !== 1 ? "s" : ""} below the 75% attendance threshold
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Parents of affected students have been notified via SMS.
            </p>
          </div>
          <Link href="/admin/attendance"
            className="text-xs font-semibold text-yellow-700 hover:underline shrink-0">
            View attendance →
          </Link>
        </div>
      )}
    </div>
  );
}
