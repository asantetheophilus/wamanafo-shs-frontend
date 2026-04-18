// ============================================================
// Wamanafo SHS — Parent: Child Report Cards
// Shows published report cards for a linked child.
// studentId from query param; defaults to first linked child.
// ============================================================

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { useLinkedChildren, useChildReportCards, type ParentReportCardRow } from "@/hooks/useParentPortal";
import { formatPosition } from "@/lib/ranking";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ParentReportCardsPage() {
  const params    = useSearchParams();
  const studentId = params.get("studentId") ?? "";

  const { data: children } = useLinkedChildren();
  const activeId = studentId || children?.[0]?.studentId || "";

  const child = children?.find((c) => c.studentId === activeId);

  const { data: cards, isLoading } = useChildReportCards(activeId);

  const list = cards ?? [];

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/parent/portal"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to portal
        </Link>
        {child && (
          <span className="text-sm text-slate-700 font-medium">
            {child.firstName} {child.lastName} — Report Cards
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 card-flat animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card-flat px-6 py-16 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            No published report cards yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((card: ParentReportCardRow) => (
            <Link
              key={card.id}
              href={`/parent/report-cards/${card.id}`}
              className="block card-flat px-6 py-5
                hover:shadow-md hover:border-teal-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 group-hover:text-teal-700">
                    {card.termName} · {card.yearName}
                  </p>
                  <div className="flex items-center gap-5 mt-1.5 text-sm text-slate-500">
                    <span>
                      Position:{" "}
                      <strong className="text-teal-700 font-mono">
                        {formatPosition(card.classPosition)}
                      </strong>
                    </span>
                    {card.overallAverage !== null && (
                      <span>
                        Average:{" "}
                        <strong className="text-slate-700 font-mono">
                          {card.overallAverage?.toFixed(1)}
                        </strong>
                      </span>
                    )}
                    <span>
                      Aggregate:{" "}
                      <strong className={cn(
                        "font-mono",
                        card.aggregate === null ? "text-slate-400" :
                        card.aggregate <= 12 ? "text-green-700" :
                        card.aggregate <= 24 ? "text-yellow-700" : "text-red-700"
                      )}>
                        {card.aggregate ?? "Pending"}
                      </strong>
                    </span>
                  </div>
                </div>
                {card.publishedAt && (
                  <p className="text-xs text-slate-400">{formatDate(card.publishedAt)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
