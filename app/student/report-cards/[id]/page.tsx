// ============================================================
// Wamanafo SHS — Student: Single Report Card View
// Uses the shared ReportCardPreview component.
// API enforces publish check — 403 if not published.
// ============================================================

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useReportCard } from "@/hooks/useReportCards";
import { ReportCardPreview } from "@/components/report-card/ReportCardPreview";

export default function StudentReportCardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: card, isLoading, isError } = useReportCard(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">
          This report card is not available. It may not have been published yet.
        </p>
        <Link href="/student/report-cards"
          className="inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to report cards
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <Link href="/student/report-cards"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to report cards
        </Link>
        <a
          href={`/api/v1/report-cards/${id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      <ReportCardPreview data={card} />
    </div>
  );
}
