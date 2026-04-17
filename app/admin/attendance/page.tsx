// ============================================================
// Wamanafo SHS — Admin: Attendance Overview Page
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAttendanceSummary } from "@/hooks/useAttendance";
import { AttendanceSummaryTable } from "@/components/tables/AttendanceTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ClipboardList } from "lucide-react";

export default function AdminAttendancePage() {
  const [classId, setClassId] = useState("");
  const [termId,  setTermId]  = useState("");

  const { data: classesData } = useQuery({
    queryKey: ["classes", "options"],
    queryFn: async () => {
      const res = await fetch("/api/v1/classes?pageSize=100");
      return (await res.json()).data as { items: Array<{ id: string; name: string }> };
    },
  });

  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn: async () => {
      const res = await fetch("/api/v1/terms");
      return (await res.json()).data as { items: Array<{ id: string; name: string; isCurrent: boolean }> };
    },
  });

  const { data: summary, isLoading } = useAttendanceSummary(classId, termId);

  const canLoad = classId && termId;

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="View attendance summaries by class and term."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Attendance" },
        ]}
      />

      {/* Filters */}
      <div className="px-8 py-4 flex items-center gap-4 border-b border-slate-200 bg-white">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]"
        >
          <option value="">Select class…</option>
          {(classesData?.items ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]"
        >
          <option value="">Select term…</option>
          {(termsData?.items ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}{t.isCurrent ? " (current)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="px-8 py-6">
        {!canLoad ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-16 text-center">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Select a class and term to view attendance data.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <AttendanceSummaryTable rows={summary ?? []} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
