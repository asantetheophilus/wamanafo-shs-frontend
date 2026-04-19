// ============================================================
// Wamanafo SHS — Parent: Single Report Card View
// API enforces publish check and parent-child link.
// ============================================================

"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useReportCard, downloadReportCardPdf } from "@/hooks/useReportCards";
import { ReportCardPreview } from "@/components/report-card/ReportCardPreview";
import { useState } from "react";

export default function ParentReportCardPage() {
  const { id }    = useParams<{ id: string }>();
  const params    = useSearchParams();
  const studentId = params.get("studentId") ?? "";
  const [downloading, setDownloading] = useState(false);

  const { data: card, isLoading, isError } = useReportCard(id);

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      await downloadReportCardPdf(id);
    } finally {
      setDownloading(false);
    }
  }

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
        <Link
          href={`/parent/report-cards${studentId ? `?studentId=${studentId}` : ""}`}
          className="inline-flex items-center gap-2 text-sm text-teal-700 hover:underline"
        >
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
        <Link
          href={`/parent/report-cards${studentId ? `?studentId=${studentId}` : ""}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to report cards
        </Link>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <ReportCardPreview data={card} />
    </div>
  );
}
