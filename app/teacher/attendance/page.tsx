// ============================================================
// Wamanafo SHS — Teacher: Mark Attendance Page
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { useAttendanceGrid } from "@/hooks/useAttendance";
import { AttendanceForm } from "@/components/forms/AttendanceForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api-client";

export default function TeacherAttendancePage() {
  const today = format(new Date(), "yyyy-MM-dd");

  const [classId, setClassId] = useState("");
  const [termId,  setTermId]  = useState("");
  const [date,    setDate]    = useState(today);
  const [saveWarnings, setSaveWarnings] = useState<string[]>([]);

  // Fetch classes assigned to this teacher
  const { data: classesData } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const res = await api.get<{ items: Array<{ id: string; name: string }> }>("/api/v1/classes?pageSize=50");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  // Terms
  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn: async () => {
      const res = await api.get<{ items: Array<{ id: string; name: string; number: number; isCurrent: boolean }> }>("/api/v1/terms");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  const { data: grid, isLoading: gridLoading, isError: gridError } =
    useAttendanceGrid(classId, termId, date);

  const canLoad = classId && termId && date;

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        description="Record student attendance for your class."
        breadcrumbs={[
          { label: "Teacher", href: "/teacher/dashboard" },
          { label: "Attendance" },
        ]}
      />

      <div className="page-shell">
        {/* Selector bar */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Select class, term, and date</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label text-xs">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="select"
              >
                <option value="">Select class…</option>
                {(classesData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-xs">Term</label>
              <select
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                className="select"
              >
                <option value="">Select term…</option>
                {(termsData?.items ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.isCurrent ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-xs">
                <CalendarDays className="w-3 h-3 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Attendance warnings */}
        {saveWarnings.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {saveWarnings.length} student(s) are below the attendance threshold.
              Parents will be notified automatically.
            </span>
          </div>
        )}

        {/* Attendance grid */}
        {canLoad && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Attendance for <span className="text-teal-700">{date}</span>
            </h3>

            {gridLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              </div>
            )}

            {gridError && (
              <div className="text-center py-8 text-sm text-red-600">
                Failed to load student list. Please try again.
              </div>
            )}

            {!gridLoading && !gridError && grid && (
              grid.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No students enrolled in this class for the selected year.
                </p>
              ) : (
                <AttendanceForm
                  classId={classId}
                  termId={termId}
                  date={date}
                  students={grid}
                  onSaved={(w) => setSaveWarnings(w)}
                />
              )
            )}
          </div>
        )}

        {!canLoad && (
          <div className="card px-6 py-12 text-center">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Select a class, term, and date above to start marking attendance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
