// ============================================================
// Wamanafo SHS — Student: My Scores
// Shows only APPROVED scores for the current student.
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentPortalKeys } from "@/hooks/useStudentPortal";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDisplayScore } from "@/lib/grading";
import { cn } from "@/lib/utils";

const GRADE_COLOUR: Record<number, string> = {
  1: "text-green-700", 2: "text-green-700", 3: "text-green-700",
  4: "text-yellow-700", 5: "text-yellow-700", 6: "text-yellow-700",
  7: "text-orange-600", 8: "text-orange-600",
  9: "text-red-700",
};

interface SubjectScore {
  subject:    { name: string; code: string; isCore: boolean };
  classScore: number | null;
  examScore:  number | null;
  totalScore: number | null;
  grade:      string | null;
  gradePoint: number | null;
  remark:     string | null;
}

export default function StudentScoresPage() {
  const [termId, setTermId] = useState("");

  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn: async () => {
      const res = await fetch("/api/v1/terms");
      return (await res.json()).data as { items: Array<{ id: string; name: string; isCurrent: boolean }> };
    },
  });

  const { data: scoresData, isLoading } = useQuery({
    queryKey: studentPortalKeys.scores(termId || undefined),
    queryFn: async () => {
      const url = new URL("/api/v1/student-portal", window.location.origin);
      url.searchParams.set("view", "scores");
      if (termId) url.searchParams.set("termId", termId);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load scores");
      return (await res.json()).data as SubjectScore[];
    },
    enabled: true,
  });

  const scores = scoresData ?? [];
  const core     = scores.filter((s) => s.subject.isCore);
  const elective = scores.filter((s) => !s.subject.isCore);

  return (
    <div>
      <PageHeader
        title="My Scores"
        description="Your approved subject scores."
        breadcrumbs={[
          { label: "Portal", href: "/student/portal" },
          { label: "Scores" },
        ]}
      />

      <div className="mt-6 space-y-6">
        {/* Term selector */}
        <div className="flex items-center gap-3">
          <select
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            className="text-sm rounded-lg border border-slate-300 px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Current term</option>
            {(termsData?.items ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.isCurrent ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="h-48 card-flat animate-pulse" />
        ) : scores.length === 0 ? (
          <div className="card-flat px-6 py-12 text-center">
            <p className="text-sm text-slate-500">No approved scores for this term yet.</p>
          </div>
        ) : (
          <>
            {[
              { title: "Core Subjects", rows: core },
              { title: "Elective Subjects", rows: elective },
            ].filter((g) => g.rows.length > 0).map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-3">
                  {group.title}
                </h3>
                <div className="card-flat overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-teal-950 text-white">
                        {["Subject", "Class Score", "Exam Score", "Total", "Grade", "Remark"].map((h) => (
                          <th key={h} className={cn(
                            "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide",
                            h === "Subject" ? "text-left" : "text-center"
                          )}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.rows.map((s, i) => (
                        <tr key={s.subject.code}
                          className={cn("transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                          <td className="px-4 py-3 font-medium text-slate-800">{s.subject.name}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            {s.classScore ?? <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            {s.examScore ?? <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800">
                            {formatDisplayScore(s.totalScore)}
                          </td>
                          <td className={cn("px-4 py-3 text-center font-mono font-bold text-lg",
                            GRADE_COLOUR[s.gradePoint ?? 9] ?? "text-slate-400")}>
                            {s.grade ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">
                            {s.remark ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
