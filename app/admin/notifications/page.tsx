// ============================================================
// Wamanafo SHS — Admin Notifications Page
// Shows system alerts: pending scores, unpublished report cards,
// low-attendance students, and recent activity.
// Data is derived from analytics — no separate backend table needed.
// ============================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import {
  Bell, AlertTriangle, CheckCircle2, Info,
  FileText, ClipboardList, RefreshCw,
} from "lucide-react";

interface DashboardStats {
  currentTermName:          string | null;
  currentYearName:          string | null;
  pendingScores:            number;
  unpublishedReportCards:   number;
  averageAttendancePercent: number | null;
  belowThresholdCount:      number;
}

interface Notification {
  id:       string;
  type:     "warning" | "info" | "success";
  title:    string;
  message:  string;
  icon:     React.ElementType;
  action?:  { label: string; href: string };
}

function useNotificationsData() {
  return useQuery<DashboardStats>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const res = await apiFetch<DashboardStats>("/api/v1/analytics");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

function buildNotifications(data: DashboardStats): Notification[] {
  const items: Notification[] = [];

  if (data.pendingScores > 0) {
    items.push({
      id:      "pending-scores",
      type:    "warning",
      title:   `${data.pendingScores} score${data.pendingScores === 1 ? "" : "s"} awaiting approval`,
      message: `Teachers have submitted scores that require your review for ${data.currentTermName ?? "the current term"}.`,
      icon:    ClipboardList,
      action:  { label: "Review scores", href: "/admin/scores" },
    });
  }

  if (data.unpublishedReportCards > 0) {
    items.push({
      id:      "unpublished-cards",
      type:    "warning",
      title:   `${data.unpublishedReportCards} report card${data.unpublishedReportCards === 1 ? "" : "s"} not published`,
      message: "Generated report cards are in draft state and have not been published to students and parents.",
      icon:    FileText,
      action:  { label: "View report cards", href: "/admin/report-cards" },
    });
  }

  if (data.belowThresholdCount > 0) {
    items.push({
      id:      "attendance-alert",
      type:    "warning",
      title:   `${data.belowThresholdCount} student${data.belowThresholdCount === 1 ? "" : "s"} below attendance threshold`,
      message: `${data.belowThresholdCount} student${data.belowThresholdCount === 1 ? " has" : "s have"} attendance below 75% this term.`,
      icon:    AlertTriangle,
      action:  { label: "View attendance", href: "/admin/attendance" },
    });
  }

  // Positive / info items
  if (data.pendingScores === 0 && data.unpublishedReportCards === 0) {
    items.push({
      id:      "all-clear",
      type:    "success",
      title:   "All clear — no pending actions",
      message: "All scores have been reviewed and report cards are published.",
      icon:    CheckCircle2,
    });
  }

  if (data.currentTermName) {
    items.push({
      id:      "current-term",
      type:    "info",
      title:   `Active term: ${data.currentTermName}`,
      message: `Academic year ${data.currentYearName ?? "—"} is currently in progress.`,
      icon:    Info,
    });
  }

  if (!data.currentTermName) {
    items.push({
      id:      "no-term",
      type:    "warning",
      title:   "No active term set",
      message: "Scores and attendance cannot be recorded until you mark a term as current.",
      icon:    AlertTriangle,
      action:  { label: "Manage terms", href: "/admin/terms" },
    });
  }

  return items;
}

// ── Notification card ─────────────────────────────────────────

const typeStyles = {
  warning: {
    wrapper: "border-amber-200 bg-amber-50",
    iconBg:  "bg-amber-100",
    icon:    "text-amber-600",
    title:   "text-amber-900",
    msg:     "text-amber-700",
  },
  info: {
    wrapper: "border-blue-200 bg-blue-50",
    iconBg:  "bg-blue-100",
    icon:    "text-blue-600",
    title:   "text-blue-900",
    msg:     "text-blue-700",
  },
  success: {
    wrapper: "border-green-200 bg-green-50",
    iconBg:  "bg-green-100",
    icon:    "text-green-600",
    title:   "text-green-900",
    msg:     "text-green-700",
  },
};

function NotificationCard({ n }: { n: Notification }) {
  const s = typeStyles[n.type];
  const Icon = n.icon;

  return (
    <div className={cn("rounded-xl border p-5 flex items-start gap-4", s.wrapper)}>
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", s.iconBg)}>
        <Icon className={cn("w-4 h-4", s.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", s.title)}>{n.title}</p>
        <p className={cn("text-xs mt-0.5", s.msg)}>{n.message}</p>
        {n.action && (
          <a
            href={n.action.href}
            className="inline-block mt-2 text-xs font-medium underline underline-offset-2 hover:no-underline"
          >
            {n.action.label} →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useNotificationsData();

  const notifications = data ? buildNotifications(data) : [];
  const warningCount  = notifications.filter((n) => n.type === "warning").length;

  return (
    <div className="px-8 py-7 space-y-6">
      <PageHeader
        title="Notifications"
        description={
          isLoading
            ? "Loading…"
            : warningCount > 0
            ? `${warningCount} item${warningCount === 1 ? "" : "s"} require your attention`
            : "No pending actions — everything is up to date"
        }
        action={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200
              bg-white text-sm font-medium text-slate-600 hover:bg-slate-50
              disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            Refresh
          </button>
        }
      />

      {/* ── Error ──────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Failed to load notifications</p>
            <p className="text-xs text-red-600 mt-1">
              {error instanceof Error ? error.message : "An unexpected error occurred."}
            </p>
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ── Notifications list ──────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                You are all caught up. Notifications will appear here as events occur.
              </p>
            </div>
          ) : (
            notifications.map((n) => <NotificationCard key={n.id} n={n} />)
          )}
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────────── */}
      {!isLoading && !isError && notifications.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          Notifications refresh automatically every 60 seconds. Last updated just now.
        </p>
      )}
    </div>
  );
}
