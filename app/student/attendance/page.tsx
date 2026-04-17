// ============================================================
// Wamanafo SHS — Student: My Attendance
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentPortalKeys } from "@/hooks/useStudentPortal";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatAttendancePercentage } from "@/lib/attendance";
import { cn } from "@/lib/utils";

interface AttendanceSummary {
  presentCount:         number;
  lateCount:            number;
  absentCount:          number;
  excusedCount:         number;
  attendancePercentage: number | null;
  daysAbsent:           number;
  totalSchoolDays:      number;
}

function PercentageBar({ value }: { value: number | null }) {
  const pct = value ?? 0;
  const colour = pct >= 90 ? "bg-green-500" : pct >= 75 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
      <div
        className={cn("h-2.5 rounded-full transition-all", colour)}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export default function StudentAttendancePage() {
  const [termId, setTermId] = useState("");

  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn: async () => {
      const res = await fetch("/api/v1/terms");
      return (await res.json()).data as { items: Array<{ id: string; name: string; isCurrent: boolean }> };
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: studentPortalKeys.attendance(),
    queryFn: async () => {
      const url = new URL("/api/v1/student-portal", window.location.origin);
      url.searchParams.set("view", "attendance");
      if (termId) url.searchParams.set("termId", termId);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load attendance");
      return (await res.json()).data as AttendanceSummary;
    },
  });

  return (
    <div>
      <PageHeader
        title="My Attendance"
        description="Your attendance record for this term."
        breadcrumbs={[
          { label: "Portal", href: "/student/portal" },
          { label: "Attendance" },
        ]}
      />

      <div className="mt-6 space-y-5">
        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">Current term</option>
          {(termsData?.items ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? " (current)" : ""}</option>
          ))}
        </select>

        {isLoading ? (
          <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
        ) : !data ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center">
            <p className="text-sm text-slate-500">No attendance data available yet.</p>
          </div>
        ) : (
          <>
            {/* Percentage card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Attendance Rate
                  </p>
                  <p className={cn("text-4xl font-bold mt-1",
                    (data.attendancePercentage ?? 0) >= 90 ? "text-green-700" :
                    (data.attendancePercentage ?? 0) >= 75 ? "text-yellow-700" :
                    "text-red-700"
                  )}>
                    {formatAttendancePercentage(data.attendancePercentage)}
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  Out of {data.totalSchoolDays} school days
                </p>
              </div>
              <PercentageBar value={data.attendancePercentage} />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Present",  value: data.presentCount,  colour: "text-green-700" },
                { label: "Late",     value: data.lateCount,     colour: "text-yellow-700" },
                { label: "Absent",   value: data.absentCount,   colour: "text-red-700" },
                { label: "Excused",  value: data.excusedCount,  colour: "text-blue-700" },
              ].map((item) => (
                <div key={item.label}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <p className={cn("text-3xl font-bold mt-1", item.colour)}>{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
