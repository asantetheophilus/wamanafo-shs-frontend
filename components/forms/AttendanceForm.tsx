// ============================================================
// Wamanafo SHS — Attendance Marking Grid
// Keyboard-friendly: Tab moves between students,
// P/A/L/E hotkeys set status, Enter submits.
// ============================================================

"use client";

import { useState, useCallback, useRef } from "react";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { AttendanceStatus } from "@/lib/enums";
import { useBulkMarkAttendance } from "@/hooks/useAttendance";
import { cn } from "@/lib/utils";
import type { AttendanceGridRow } from "@/types/attendance";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; short: string; hotkey: string; classes: string }
> = {
  PRESENT: {
    label:   "Present",
    short:   "P",
    hotkey:  "p",
    classes: "bg-green-100 text-green-800 border-green-300 ring-green-400",
  },
  LATE: {
    label:   "Late",
    short:   "L",
    hotkey:  "l",
    classes: "bg-yellow-100 text-yellow-800 border-yellow-300 ring-yellow-400",
  },
  ABSENT: {
    label:   "Absent",
    short:   "A",
    hotkey:  "a",
    classes: "bg-red-100 text-red-800 border-red-300 ring-red-400",
  },
  EXCUSED: {
    label:   "Excused",
    short:   "E",
    hotkey:  "e",
    classes: "bg-blue-100 text-blue-800 border-blue-300 ring-blue-400",
  },
};

const STATUSES = Object.keys(STATUS_CONFIG) as AttendanceStatus[];

interface AttendanceFormProps {
  classId:  string;
  termId:   string;
  date:     string;
  students: AttendanceGridRow[];
  onSaved?: (warnings: string[]) => void;
}

export function AttendanceForm({
  classId, termId, date, students, onSaved,
}: AttendanceFormProps) {
  // Local state mirrors the grid rows
  const [grid, setGrid] = useState<AttendanceGridRow[]>(students);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  const { mutateAsync, isPending } = useBulkMarkAttendance();

  // Update one student's status
  const setStatus = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setGrid((prev) =>
        prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
      );
      setSaved(false);
    },
    []
  );

  // Mark all present with one click
  const markAllPresent = useCallback(() => {
    setGrid((prev) => prev.map((row) => ({ ...row, status: AttendanceStatus.PRESENT })));
    setSaved(false);
  }, []);

  // Keyboard handler on the grid container
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, studentId: string) => {
      const statusMap: Record<string, AttendanceStatus> = {
        p: AttendanceStatus.PRESENT,
        a: AttendanceStatus.ABSENT,
        l: AttendanceStatus.LATE,
        e: AttendanceStatus.EXCUSED,
      };
      if (e.key in statusMap) {
        e.preventDefault();
        setStatus(studentId, statusMap[e.key]!);
      }
    },
    [setStatus]
  );

  async function handleSubmit() {
    setError(null);

    // All rows must have a status
    const unset = grid.filter((r) => r.status === null);
    if (unset.length > 0) {
      setError(`${unset.length} student(s) have no status set. Please mark all students.`);
      return;
    }

    const records = grid.map((r) => ({
      studentId: r.studentId,
      status:    r.status!,
      note:      r.note ?? undefined,
    }));

    const result = await mutateAsync({ classId, termId, date, records });
    setSaved(true);
    onSaved?.(result?.warnings ?? []);
  }

  // Stats summary
  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: grid.filter((r) => r.status === s).length }),
    {} as Record<AttendanceStatus, number>
  );
  const unmarked = grid.filter((r) => r.status === null).length;

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={markAllPresent}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-green-300
            text-green-700 hover:bg-green-50 transition-colors"
        >
          Mark all present
        </button>

        {/* Status summary pills */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {STATUSES.map((s) => (
            <span key={s} className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
              STATUS_CONFIG[s].classes
            )}>
              {STATUS_CONFIG[s].short}: {counts[s]}
            </span>
          ))}
          {unmarked > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
              font-medium border bg-slate-100 text-slate-600 border-slate-300">
              Unmarked: {unmarked}
            </span>
          )}
        </div>
      </div>

      {/* Hotkey hint */}
      <p className="text-xs text-slate-400">
        Keyboard shortcuts: <kbd className="font-mono bg-slate-100 px-1 rounded">P</kbd> Present ·{" "}
        <kbd className="font-mono bg-slate-100 px-1 rounded">A</kbd> Absent ·{" "}
        <kbd className="font-mono bg-slate-100 px-1 rounded">L</kbd> Late ·{" "}
        <kbd className="font-mono bg-slate-100 px-1 rounded">E</kbd> Excused
      </p>

      {/* Grid */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-8">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Student</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Index No.</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {grid.map((row, idx) => (
              <tr
                key={row.studentId}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, row.studentId)}
                className="hover:bg-slate-50 focus:bg-teal-50 focus:outline-none transition-colors"
              >
                <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-4 py-2.5 font-medium text-slate-800">
                  {row.lastName}, {row.firstName}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                  {row.indexNumber}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(row.studentId, s)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-semibold border transition-all",
                          row.status === s
                            ? cn(STATUS_CONFIG[s].classes, "ring-2 ring-offset-1 scale-105")
                            : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                        )}
                        title={`${STATUS_CONFIG[s].label} (${STATUS_CONFIG[s].hotkey.toUpperCase()})`}
                      >
                        {STATUS_CONFIG[s].short}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Attendance saved successfully.
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold",
            "bg-teal-700 text-white hover:bg-teal-600 transition-colors",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Saving…" : "Save attendance"}
        </button>
      </div>
    </div>
  );
}
