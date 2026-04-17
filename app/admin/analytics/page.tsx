// ============================================================
// Wamanafo SHS — Admin Analytics Page
// Displays school-wide statistics, grade distribution,
// class performance, and attendance overview.
// ============================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { GradeDistributionChart } from "@/components/dashboard/GradeDistributionChart";
import { ClassPerformanceChart } from "@/components/dashboard/ClassPerformanceChart";
import {
  GraduationCap, Users, School, ClipboardList,
  TrendingUp, AlertTriangle, CheckCircle2, BarChart2,
  Loader2,
} from "lucide-react";

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
  classPerformance:         Array<{ className: string; averageScore: number | null }>;
}

function useAnalytics() {
  return useQuery<DashboardStats>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const res = await apiFetch<DashboardStats>("/api/v1/analytics");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    refetchInterval: 60_000,
  });
}

// ── Loading skeleton ──────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
      <div className="h-8 w-16 bg-slate-300 rounded" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useAnalytics();

  return (
    <div className="px-8 py-7 space-y-8">
      <PageHeader
        title="Analytics"
        description={
          data?.currentTermName
            ? `${data.currentTermName} · ${data.currentYearName}`
            : "School-wide performance overview"
        }
      />

      {/* ── Error state ───────────────────────────────────── */}
      {isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">Failed to load analytics</p>
            <p className="text-xs text-red-600 mt-1">
              {error instanceof Error ? error.message : "An unexpected error occurred."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800
              text-xs font-medium transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Overview
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Active Students"
              value={data?.activeStudents ?? 0}
              sub={`of ${data?.totalStudents ?? 0} total`}
              icon={GraduationCap}
              color="teal"
            />
            <StatCard
              label="Teachers"
              value={data?.totalTeachers ?? 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Classes"
              value={data?.totalClasses ?? 0}
              sub="this academic year"
              icon={School}
              color="violet"
            />
            <StatCard
              label="Avg Attendance"
              value={
                data?.averageAttendancePercent != null
                  ? `${data.averageAttendancePercent}%`
                  : "—"
              }
              sub={
                data?.belowThresholdCount
                  ? `${data.belowThresholdCount} below 75%`
                  : "all above threshold"
              }
              icon={ClipboardList}
              color={data?.belowThresholdCount ? "red" : "green"}
            />
          </div>
        )}
      </section>

      {/* ── Pending actions ────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Pending Actions
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              {(data?.pendingScores ?? 0) > 0 ? (
                <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              )}
              <div>
                <p className="text-2xl font-bold text-slate-900">{data?.pendingScores ?? 0}</p>
                <p className="text-sm text-slate-500">Scores awaiting approval</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              {(data?.unpublishedReportCards ?? 0) > 0 ? (
                <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              )}
              <div>
                <p className="text-2xl font-bold text-slate-900">{data?.unpublishedReportCards ?? 0}</p>
                <p className="text-sm text-slate-500">Unpublished report cards</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Charts ────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Grade distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-700">Grade Distribution</h3>
              <span className="text-xs text-slate-400 ml-auto">Current term · approved scores</span>
            </div>
            {(data?.gradeDistribution?.every((g) => g.count === 0)) ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No approved scores yet</p>
              </div>
            ) : (
              <GradeDistributionChart data={data?.gradeDistribution ?? []} />
            )}
          </div>

          {/* Class performance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-700">Class Performance</h3>
              <span className="text-xs text-slate-400 ml-auto">Average total score</span>
            </div>
            {(data?.classPerformance?.every((c) => c.averageScore == null)) ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No performance data yet</p>
              </div>
            ) : (
              <ClassPerformanceChart data={(data?.classPerformance ?? []).map(c => ({
                className: c.className,
                averageScore: c.averageScore ?? 0,
                studentCount: 0,
              }))} />
            )}
          </div>
        </section>
      )}

      {/* ── Empty state (no term set) ────────────────────── */}
      {!isLoading && !isError && !data?.currentTermName && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No active term</p>
          <p className="text-xs text-slate-400 mt-1">
            Set a current term in <strong>Terms</strong> to see full analytics.
          </p>
        </div>
      )}
    </div>
  );
}
