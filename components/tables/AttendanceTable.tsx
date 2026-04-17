// ============================================================
// Wamanafo SHS — Attendance Summary Table
// Displays per-student attendance percentages for a term.
// ============================================================

"use client";

import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatAttendancePercentage } from "@/lib/attendance";
import { cn } from "@/lib/utils";
import type { AttendanceSummaryRow } from "@/types/attendance";

interface AttendanceTableProps {
  rows:      AttendanceSummaryRow[];
  isLoading?: boolean;
}

function percentageClass(pct: number | null): string {
  if (pct === null) return "text-slate-400";
  if (pct >= 90)   return "text-green-700 font-semibold";
  if (pct >= 75)   return "text-yellow-700 font-semibold";
  return "text-red-700 font-semibold";
}

export function AttendanceSummaryTable({ rows, isLoading }: AttendanceTableProps) {
  if (isLoading) return <AttendanceSkeleton />;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No attendance data"
        description="Mark attendance for this class to see the summary."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {["Student", "Index No.", "Present", "Late", "Absent", "Excused", "Attendance %", "Days Absent"].map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.studentId} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-2.5 font-medium text-slate-800">
                {row.lastName}, {row.firstName}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.indexNumber}</td>
              <td className="px-4 py-2.5 font-mono text-green-700">{row.presentCount}</td>
              <td className="px-4 py-2.5 font-mono text-yellow-700">{row.lateCount}</td>
              <td className="px-4 py-2.5 font-mono text-red-700">{row.absentCount}</td>
              <td className="px-4 py-2.5 font-mono text-blue-700">{row.excusedCount}</td>
              <td className={cn("px-4 py-2.5 font-mono", percentageClass(row.attendancePercentage))}>
                {formatAttendancePercentage(row.attendancePercentage)}
              </td>
              <td className="px-4 py-2.5 font-mono text-slate-700">{row.daysAbsent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {[160, 80, 40, 40, 40, 40, 70, 60].map((w, j) => (
            <div key={j} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}
