// ============================================================
// Wamanafo SHS — Admin: Class Results Page
// Shows overall rankings, aggregates, and per-subject tabs.
// Allows admin to force recompute before generating report cards.
// ============================================================

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { useClassResultsSummary, useSubjectRanking, useRecomputeResults } from "@/hooks/useGrading";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDisplayScore } from "@/lib/grading";
import { formatPosition } from "@/lib/ranking";
import { cn } from "@/lib/utils";
import type { ClassResultRow, SubjectRankingRow } from "@/types/report";

export default function ClassResultsPage() {
  const { classId } = useParams<{ classId: string }>();

  const [termId,    setTermId]    = useState("");
  const [subjectId, setSubjectId] = useState("overall");
  const [recomputeError, setRecomputeError] = useState<string | null>(null);
  const [recomputeSuccess, setRecomputeSuccess] = useState(false);

  // Fetch class info
  const { data: classData } = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/classes/${classId}`);
      return (await res.json()).data as { name: string; programme: { id: string; name: string }; programmeId: string };
    },
    enabled: !!classId,
  });

  // Fetch terms
  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn:  async () => (await fetch("/api/v1/terms")).json()
      .then((r: { data: { items: Array<{ id: string; name: string; isCurrent: boolean }> } }) => r.data),
  });

  // Fetch subjects for this programme
  const { data: subjectsData } = useQuery({
    queryKey: ["subjects", "for-class", classId],
    queryFn: async () => {
      if (!classData?.programmeId) return { items: [] };
      const res = await fetch(`/api/v1/subjects?pageSize=50`);
      return (await res.json()).data as { items: Array<{ id: string; name: string; code: string; isCore: boolean }> };
    },
    enabled: !!classData?.programmeId,
  });

  // Results
  const { data: overallSummary, isLoading: overallLoading } =
    useClassResultsSummary(classId, termId);

  const { data: subjectRanking, isLoading: subjectLoading } =
    useSubjectRanking(classId, subjectId === "overall" ? "" : subjectId, termId);

  const recompute = useRecomputeResults();

  async function handleRecompute() {
    if (!termId) return;
    setRecomputeError(null);
    setRecomputeSuccess(false);
    try {
      await recompute.mutateAsync({ classId, termId });
      setRecomputeSuccess(true);
    } catch (err: unknown) {
      setRecomputeError(err instanceof Error ? err.message : "Recompute failed.");
    }
  }

  const subjects = subjectsData?.items ?? [];
  const canLoad  = classId && termId;

  return (
    <div>
      <PageHeader
        title={classData?.name ?? "Class Results"}
        description="View rankings, grades, and aggregates for this class."
        breadcrumbs={[
          { label: "Admin",  href: "/admin/dashboard" },
          { label: "Scores", href: "/admin/scores"    },
          { label: classData?.name ?? "Class Results" },
        ]}
        action={
          canLoad ? (
            <button
              onClick={handleRecompute}
              disabled={recompute.isPending}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
                "border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors",
                "disabled:opacity-60"
              )}
            >
              {recompute.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              {recompute.isPending ? "Recomputing…" : "Recompute results"}
            </button>
          ) : undefined
        }
      />

      <div className="px-8 py-4 flex items-center gap-4 border-b border-slate-200 bg-white">
        {/* Term selector */}
        <select
          value={termId}
          onChange={(e) => { setTermId(e.target.value); setSubjectId("overall"); }}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]"
        >
          <option value="">Select term…</option>
          {(termsData?.items ?? []).map((t: { id: string; name: string; isCurrent: boolean }) => (
            <option key={t.id} value={t.id}>
              {t.name}{t.isCurrent ? " (current)" : ""}
            </option>
          ))}
        </select>

        {/* View tabs */}
        {canLoad && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            <button
              onClick={() => setSubjectId("overall")}
              className={cn(
                "px-4 py-1.5 font-medium transition-colors",
                subjectId === "overall"
                  ? "bg-teal-700 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Overall
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubjectId(s.id)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors border-l border-slate-200",
                  subjectId === s.id
                    ? "bg-teal-700 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {s.code}
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {recomputeSuccess && (
          <span className="text-xs text-green-700 font-medium">Results updated ✓</span>
        )}
        {recomputeError && (
          <span className="text-xs text-red-600">{recomputeError}</span>
        )}
      </div>

      <div className="px-8 py-6">
        {!canLoad ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Select a term to view class results.</p>
          </div>
        ) : subjectId === "overall" ? (
          <OverallResultsTable rows={overallSummary ?? []} isLoading={overallLoading} />
        ) : (
          <SubjectResultsTable
            rows={subjectRanking ?? []}
            isLoading={subjectLoading}
            subjectName={subjects.find((s) => s.id === subjectId)?.name ?? ""}
          />
        )}
      </div>
    </div>
  );
}

// ── Overall results table ─────────────────────────────────────

function OverallResultsTable({
  rows, isLoading,
}: { rows: ClassResultRow[]; isLoading: boolean }) {
  if (isLoading) return <TableSkeleton cols={7} rows={8} />;

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-12 text-center">
        <p className="text-sm text-slate-500">
          No results yet. Ensure scores are approved and click Recompute.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {["Pos.", "Student", "Index No.", "Subjects Graded", "Total Score", "Average", "Aggregate"].map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.studentId} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-mono font-bold text-teal-700">
                {formatPosition(row.classPosition)}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/students/${row.studentId}`}
                  className="font-medium text-slate-800 hover:text-teal-700">
                  {row.lastName}, {row.firstName}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.indexNumber}</td>
              <td className="px-4 py-3 font-mono text-slate-600">
                {row.gradedCount}/{row.subjectCount}
              </td>
              <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                {formatDisplayScore(row.overallTotal)}
              </td>
              <td className="px-4 py-3 font-mono text-slate-700">
                {formatDisplayScore(row.overallAverage)}
              </td>
              <td className="px-4 py-3 font-mono font-bold">
                {row.aggregate !== null ? (
                  <span className={cn(
                    row.aggregate <= 12 ? "text-green-700" :
                    row.aggregate <= 24 ? "text-yellow-700" : "text-red-700"
                  )}>
                    {row.aggregate}
                  </span>
                ) : (
                  <span className="text-slate-300 italic text-xs">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Subject ranking table ─────────────────────────────────────

function SubjectResultsTable({
  rows, isLoading, subjectName,
}: { rows: SubjectRankingRow[]; isLoading: boolean; subjectName: string }) {
  if (isLoading) return <TableSkeleton cols={6} rows={8} />;

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-12 text-center">
        <p className="text-sm text-slate-500">No approved scores for {subjectName} yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <p className="text-sm font-semibold text-slate-700">{subjectName}</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {["Pos.", "Student", "Index No.", "Class Score", "Exam Score", "Total", "Grade", "Remark"].map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.studentId} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-2.5 font-mono font-bold text-teal-700">
                {formatPosition(row.position)}
              </td>
              <td className="px-4 py-2.5 font-medium text-slate-800">
                {row.lastName}, {row.firstName}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.indexNumber}</td>
              <td className="px-4 py-2.5 font-mono text-slate-700 text-center">
                {row.classScore ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-2.5 font-mono text-slate-700 text-center">
                {row.examScore ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">
                {formatDisplayScore(row.totalScore)}
              </td>
              <td className="px-4 py-2.5 font-mono font-bold">
                {row.grade ? (
                  <span className={cn(
                    (row.gradePoint ?? 9) <= 3 ? "text-green-700" :
                    (row.gradePoint ?? 9) <= 6 ? "text-yellow-700" :
                    (row.gradePoint ?? 9) <= 8 ? "text-orange-600" : "text-red-700"
                  )}>
                    {row.grade}
                  </span>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-2.5 text-slate-500 text-xs">{row.remark ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

function TableSkeleton({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: 60 + i * 20 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-slate-200 rounded" style={{ width: 60 + j * 15 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
