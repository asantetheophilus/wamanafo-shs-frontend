// ============================================================
// Wamanafo SHS — Admin: Score Approval Queue
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { useScoresPendingApproval, useApproveScore, useRequestAmendment } from "@/hooks/useScores";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, scoreStatusLabel } from "@/components/shared/StatusBadge";
import { scoreStatusVariant, formatDisplayScore, cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { ScoreApprovalRow } from "@/types/score";

type ClassOption = { id: string; name: string };
type TermOption  = { id: string; name: string; isCurrent: boolean };

export default function AdminScoresPage() {
  const [classId,          setClassId]          = useState("");
  const [termId,           setTermId]            = useState("");
  const [amendmentScoreId, setAmendmentScoreId]  = useState<string | null>(null);
  const [amendmentReason,  setAmendmentReason]   = useState("");
  const [actionError,      setActionError]        = useState<string | null>(null);

  const { data: classesData } = useQuery({
    queryKey: ["classes", "options"],
    queryFn: async () => {
      const res = await api.get<{ items: ClassOption[]; total: number }>("/api/v1/classes?pageSize=100");
      return res.success ? res.data : { items: [], total: 0 };
    },
  });

  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn: async () => {
      const res = await api.get<{ items: TermOption[]; total: number }>("/api/v1/terms");
      return res.success ? res.data : { items: [], total: 0 };
    },
  });

  // Backend returns ScoreApprovalRow[] directly — no {items, total} wrapper
  const { data: pending, isLoading } = useScoresPendingApproval(
    Object.fromEntries(
      [["classId", classId], ["termId", termId]].filter(([, v]) => v) as [string, string][]
    )
  );

  const rows: ScoreApprovalRow[] = pending ?? [];

  const approve          = useApproveScore();
  const requestAmendment = useRequestAmendment();

  async function handleApprove(scoreId: string) {
    setActionError(null);
    try {
      await approve.mutateAsync(scoreId);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Approval failed.");
    }
  }

  async function handleAmendmentSubmit(scoreId: string) {
    if (!amendmentReason.trim()) return;
    setActionError(null);
    try {
      await requestAmendment.mutateAsync({ scoreId, reason: amendmentReason });
      setAmendmentScoreId(null);
      setAmendmentReason("");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Amendment request failed.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Score Approval"
        description="Review and approve submitted scores, or request corrections from teachers."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Scores" },
        ]}
      />

      {/* Filters */}
      <div className="px-8 py-4 flex items-center gap-4 border-b border-slate-200 bg-white">
        <select value={classId} onChange={(e) => setClassId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]">
          <option value="">All classes</option>
          {(classesData?.items ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={termId} onChange={(e) => setTermId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]">
          <option value="">All terms</option>
          {(termsData?.items ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? " (current)" : ""}</option>
          ))}
        </select>

        <span className="text-sm text-slate-500 ml-auto">
          {rows.length} pending
        </span>
      </div>

      <div className="px-8 py-6">
        {actionError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {actionError}
          </div>
        )}

        <div className="card">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
              <p className="text-slate-600 font-medium">All caught up!</p>
              <p className="text-sm text-slate-400">No scores pending approval.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Student", "Subject", "Class", "Class Score", "Exam Score", "Total", "Grade", "Status", "Actions"].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <>
                    <tr key={row.scoreId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{row.studentName}</p>
                        <p className="text-xs text-slate-400 font-mono">{row.indexNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.subjectName}</td>
                      <td className="px-4 py-3 text-slate-600">{row.className}</td>
                      <td className="px-4 py-3 font-mono text-slate-700 text-center">
                        {row.classScore ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 text-center">
                        {row.examScore ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800 text-center">
                        {formatDisplayScore(row.totalScore)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">
                        {row.grade ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={scoreStatusLabel(row.status)}
                          variant={scoreStatusVariant(row.status)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "SUBMITTED" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(row.scoreId)}
                              disabled={approve.isPending}
                              className={cn(
                                "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md",
                                "bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                              )}
                            >
                              {approve.isPending
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCircle className="w-3 h-3" />
                              }
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setAmendmentScoreId(row.scoreId);
                                setAmendmentReason("");
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md
                                border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Amend
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Amendment reason input */}
                    {amendmentScoreId === row.scoreId && (
                      <tr key={`${row.scoreId}-amend`} className="bg-yellow-50">
                        <td colSpan={9} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <textarea
                              value={amendmentReason}
                              onChange={(e) => setAmendmentReason(e.target.value)}
                              placeholder="Explain what needs to be corrected…"
                              rows={2}
                              className="flex-1 text-sm px-3 py-2 rounded-lg border border-yellow-300
                                focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white resize-none"
                            />
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setAmendmentScoreId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAmendmentSubmit(row.scoreId)}
                                disabled={!amendmentReason.trim() || requestAmendment.isPending}
                                className={cn(
                                  "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold",
                                  "bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-60"
                                )}
                              >
                                {requestAmendment.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                                Send for amendment
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Amendment reason display */}
                    {row.status === "AMENDMENT_REQUESTED" && row.amendmentReason && (
                      <tr key={`${row.scoreId}-reason`} className="bg-yellow-50/50">
                        <td colSpan={9} className="px-4 py-2">
                          <p className="text-xs text-yellow-700">
                            <span className="font-semibold">Amendment reason: </span>
                            {row.amendmentReason}
                          </p>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
