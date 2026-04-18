// ============================================================
// Wamanafo SHS — Teacher: Conduct Ratings Entry
// Only accessible to teachers who are form masters.
// Allows rating all students in the form class per criterion.
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle, AlertTriangle, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DEFAULT_CONDUCT_CRITERIA, CONDUCT_RATINGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EnrolledStudent {
  student: {
    id: string;
    indexNumber: string;
    user: { firstName: string; lastName: string };
  };
}

interface ExistingRating {
  studentId: string;
  criterion: string;
  rating:    string;
  remark:    string | null;
}

type RatingMap = Record<string, Record<string, { rating: string; remark: string }>>;
// key: studentId → criterion → { rating, remark }

export default function TeacherConductPage() {
  const [classId, setClassId]   = useState("");
  const [termId,  setTermId]    = useState("");
  const [ratingMap, setRatingMap] = useState<RatingMap>({});
  const [formRemarks, setFormRemarks] = useState<Record<string, string>>({});
  const [saved, setSaved]        = useState(false);
  const [error, setError]        = useState<string | null>(null);

  const qc = useQueryClient();

  // Fetch form master classes
  const { data: classesData } = useQuery({
    queryKey: ["teacher-form-classes"],
    queryFn: async () => {
      const res = await fetch("/api/v1/classes?pageSize=50");
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

  // Students in selected class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["class-roster", classId],
    queryFn: async () => {
      if (!classId) return { data: [] };
      const res = await fetch(`/api/v1/classes/${classId}?resource=students&yearId=current`);
      return (await res.json()) as { data: EnrolledStudent[] };
    },
    enabled: !!classId,
  });

  // Existing conduct ratings
  const { data: existingRatings } = useQuery({
    queryKey: ["conduct", classId, termId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/conduct?classId=${classId}&termId=${termId}`);
      return (await res.json()).data as ExistingRating[];
    },
    enabled: !!classId && !!termId,
  });

  // Populate local state from existing ratings
  useEffect(() => {
    if (!existingRatings) return;
    const map: RatingMap = {};
    const remarks: Record<string, string> = {};
    for (const r of existingRatings) {
      if (r.criterion === "FORM_MASTER_REMARK") {
        remarks[r.studentId] = r.remark ?? "";
        continue;
      }
      if (!map[r.studentId]) map[r.studentId] = {};
      map[r.studentId]![r.criterion] = { rating: r.rating, remark: r.remark ?? "" };
    }
    setRatingMap(map);
    setFormRemarks(remarks);
  }, [existingRatings]);

  const students = studentsData?.data ?? [];

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries: Array<{ studentId: string; criterion: string; rating: string; remark?: string }> = [];

      for (const [studentId, criteria] of Object.entries(ratingMap)) {
        for (const [criterion, { rating, remark }] of Object.entries(criteria)) {
          if (rating) entries.push({ studentId, criterion, rating, remark: remark || undefined });
        }
      }

      if (entries.length === 0) throw new Error("No ratings to save.");

      const res = await fetch(`/api/v1/conduct?bulk=true`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ termId, classId, entries }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed.");
      return json.data;
    },
    onSuccess: () => {
      setSaved(true);
      setError(null);
      void qc.invalidateQueries({ queryKey: ["conduct", classId, termId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function setRating(studentId: string, criterion: string, rating: string) {
    setRatingMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] ?? {}),
        [criterion]: { rating, remark: prev[studentId]?.[criterion]?.remark ?? "" },
      },
    }));
    setSaved(false);
  }

  const canLoad = classId && termId;

  return (
    <div>
      <PageHeader
        title="Conduct Ratings"
        description="Rate students in your form class for conduct and character."
        breadcrumbs={[
          { label: "Teacher", href: "/teacher/dashboard" },
          { label: "Conduct" },
        ]}
      />

      <div className="page-shell">
        {/* Selectors */}
        <div className="card-flat p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Class</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select class…</option>
                {(classesData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Term</label>
              <select value={termId} onChange={(e) => setTermId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select term…</option>
                {(termsData?.items ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? " (current)" : ""}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!canLoad && (
          <div className="card-flat px-6 py-12 text-center">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Select your form class and term to enter conduct ratings.</p>
          </div>
        )}

        {canLoad && studentsLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        )}

        {canLoad && !studentsLoading && students.length === 0 && (
          <div className="card-flat px-6 py-12 text-center">
            <p className="text-sm text-slate-500">No students enrolled in this class.</p>
          </div>
        )}

        {canLoad && !studentsLoading && students.length > 0 && (
          <div className="card-flat overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-950 text-white">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide min-w-[180px]">Student</th>
                    {DEFAULT_CONDUCT_CRITERIA.map((c) => (
                      <th key={c} className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide min-w-[120px]">
                        {c}
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide min-w-[200px]">Form Master Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((enrollment, i) => {
                    const { student } = enrollment;
                    return (
                      <tr key={student.id} className={cn("transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 text-xs">
                            {student.user.lastName}, {student.user.firstName}
                          </p>
                          <p className="text-slate-400 font-mono text-xs">{student.indexNumber}</p>
                        </td>
                        {DEFAULT_CONDUCT_CRITERIA.map((criterion) => (
                          <td key={criterion} className="px-3 py-3">
                            <select
                              value={ratingMap[student.id]?.[criterion]?.rating ?? ""}
                              onChange={(e) => setRating(student.id, criterion, e.target.value)}
                              className="w-full text-xs px-2 py-1.5 rounded-md border border-slate-300
                                focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                            >
                              <option value="">—</option>
                              {CONDUCT_RATINGS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={formRemarks[student.id] ?? ""}
                            onChange={(e) => {
                              setFormRemarks((prev) => ({ ...prev, [student.id]: e.target.value }));
                              setSaved(false);
                            }}
                            placeholder="Optional remark…"
                            className="w-full text-xs px-2 py-1.5 rounded-md border border-slate-300
                              focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {saved && !error && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Conduct ratings saved.
                </div>
              )}
              {!error && !saved && <span />}

              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold",
                  "bg-teal-700 text-white hover:bg-teal-600 transition-colors disabled:opacity-60"
                )}
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {saveMutation.isPending ? "Saving…" : "Save conduct ratings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
