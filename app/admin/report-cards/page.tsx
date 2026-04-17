// ============================================================
// Wamanafo SHS — Admin: Report Cards Management Page
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileText, RefreshCw, Send, AlertTriangle, CheckCircle, Loader2, Eye,
} from "lucide-react";
import {
  useReportCardList,
  useReportCardPrerequisites,
  useGenerateReportCards,
  usePublishReportCards,
} from "@/hooks/useReportCards";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatPosition } from "@/lib/ranking";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

export default function AdminReportCardsPage() {
  const [classId, setClassId] = useState("");
  const [termId,  setTermId]  = useState("");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: classesData } = useQuery({
    queryKey: ["classes", "options"],
    queryFn:  async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/v1/classes?pageSize=100");
      return res.success ? res.data : { items: [] };
    },
  });
  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn:  async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string; isCurrent: boolean }> }>("/api/v1/terms");
      return res.success ? res.data : { items: [] };
    },
  });

  const canLoad = !!classId && !!termId;

  const { data: prereqs  } = useReportCardPrerequisites(classId, termId);
  const { data: listData, isLoading } = useReportCardList(classId, termId);

  const generate = useGenerateReportCards();
  const publish  = usePublishReportCards();

  async function handleGenerate() {
    setActionMsg(null);
    try {
      const r = await generate.mutateAsync({ classId, termId });
      setActionMsg({ type: "success", text: r.message });
    } catch (err: unknown) {
      const details = (err as Error & { details?: string[] }).details;
      setActionMsg({
        type: "error",
        text: details?.join("; ") ?? (err instanceof Error ? err.message : "Generation failed."),
      });
    }
  }

  async function handlePublish() {
    setActionMsg(null);
    try {
      const r = await publish.mutateAsync({ classId, termId });
      setActionMsg({ type: "success", text: `${r.published} report card(s) published successfully.` });
    } catch (err: unknown) {
      setActionMsg({ type: "error", text: err instanceof Error ? err.message : "Publish failed." });
    }
  }

  const cards   = listData?.items ?? [];
  const draftCount     = cards.filter((c) => c.status === "DRAFT").length;
  const publishedCount = cards.filter((c) => c.status === "PUBLISHED").length;

  return (
    <div>
      <PageHeader
        title="Report Cards"
        description="Generate, preview, and publish end-of-term report cards."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Report Cards" },
        ]}
      />

      {/* Selectors + actions */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white">
        <select value={classId} onChange={(e) => setClassId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]">
          <option value="">Select class…</option>
          {(classesData?.items ?? []).map((c: { id: string; name: string }) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={termId} onChange={(e) => setTermId(e.target.value)}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[160px]">
          <option value="">Select term…</option>
          {(termsData?.items ?? []).map((t: { id: string; name: string; isCurrent: boolean }) => (
            <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? " (current)" : ""}</option>
          ))}
        </select>

        {canLoad && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleGenerate}
              disabled={generate.isPending || (prereqs && !prereqs.ready)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
                "border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {generate.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              Generate
            </button>

            {draftCount > 0 && (
              <button
                onClick={handlePublish}
                disabled={publish.isPending}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
                  "bg-teal-700 text-white hover:bg-teal-600 transition-colors",
                  "disabled:opacity-50"
                )}
              >
                {publish.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                Publish {draftCount} draft{draftCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Prerequisites warning */}
        {canLoad && prereqs && !prereqs.ready && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Prerequisites not met — report cards cannot be generated yet
                </p>
                <ul className="mt-2 space-y-1">
                  {prereqs.missing.map((m, i) => (
                    <li key={i} className="text-sm text-yellow-700 flex items-start gap-1.5">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action feedback */}
        {actionMsg && (
          <div className={cn(
            "rounded-xl border p-4 flex items-start gap-3",
            actionMsg.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          )}>
            {actionMsg.type === "success"
              ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            }
            <p className={cn("text-sm font-medium",
              actionMsg.type === "success" ? "text-green-800" : "text-red-800"
            )}>
              {actionMsg.text}
            </p>
          </div>
        )}

        {/* Stats strip */}
        {canLoad && cards.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            <span className="text-slate-500">
              <strong className="text-slate-800">{cards.length}</strong> total
            </span>
            <span className="text-slate-500">
              <strong className="text-yellow-700">{draftCount}</strong> draft
            </span>
            <span className="text-slate-500">
              <strong className="text-green-700">{publishedCount}</strong> published
            </span>
          </div>
        )}

        {/* Cards table */}
        {!canLoad ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Select a class and term to manage report cards.</p>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No report cards generated yet.{" "}
              {prereqs?.ready
                ? "Click Generate to create them."
                : "Fix prerequisites first."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Pos.", "Student", "Index No.", "Aggregate", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-teal-700">
                      {formatPosition(card.classPosition)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{card.studentName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{card.indexNumber}</td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {card.aggregate !== null ? (
                        <span className={cn(
                          (card.aggregate ?? 99) <= 12 ? "text-green-700" :
                          (card.aggregate ?? 99) <= 24 ? "text-yellow-700" : "text-red-700"
                        )}>
                          {card.aggregate}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={card.status === "PUBLISHED" ? "Published" : "Draft"}
                        variant={card.status === "PUBLISHED" ? "success" : "neutral"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/report-cards/${card.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
