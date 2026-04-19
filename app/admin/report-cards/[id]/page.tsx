// ============================================================
// Wamanafo SHS — Admin: Report Card Preview + Publish
// ============================================================

"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft, Download, Send, EyeOff, Loader2, CheckCircle,
} from "lucide-react";
import { useReportCard, usePublishSingleReportCard, reportCardKeys, downloadReportCardPdf } from "@/hooks/useReportCards";
import { ReportCardPreview } from "@/components/report-card/ReportCardPreview";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ReportCardDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: card, isLoading, isError } = useReportCard(id);
  const publishMutation = usePublishSingleReportCard();

  async function handlePublish(publish: boolean) {
    setActionMsg(null);
    await publishMutation.mutateAsync({ id, publish });
    void queryClient.invalidateQueries({ queryKey: reportCardKeys.detail(id) });
    setActionMsg(publish ? "Report card published." : "Report card unpublished.");
  }

  async function handleDownloadPdf() {
    try {
      setActionMsg(null);
      setDownloading(true);
      await downloadReportCardPdf(id);
    } catch (error) {
      setActionMsg(error instanceof Error ? error.message : "Unable to download PDF.");
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
      <div className="px-8 py-12 text-center">
        <p className="text-slate-500">Report card not found.</p>
        <Link href="/admin/report-cards"
          className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to report cards
        </Link>
      </div>
    );
  }

  const isPublished = card.status === "PUBLISHED";

  return (
    <div>
      {/* Top bar */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <Link href="/admin/report-cards"
            className="text-sm text-slate-500 hover:text-teal-700 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <StatusBadge
            label={isPublished ? "Published" : "Draft"}
            variant={isPublished ? "success" : "neutral"}
          />
        </div>

        <div className="flex items-center gap-3">
          {actionMsg && (
            <span className="text-sm text-green-700 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {actionMsg}
            </span>
          )}

          {/* PDF download */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
              "border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
            )}
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Downloading..." : "Download PDF"}
          </button>

          {/* Publish / Unpublish */}
          {isPublished ? (
            <button
              onClick={() => handlePublish(false)}
              disabled={publishMutation.isPending}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
                "border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors",
                "disabled:opacity-60"
              )}
            >
              {publishMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <EyeOff className="w-4 h-4" />
              }
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => handlePublish(true)}
              disabled={publishMutation.isPending}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
                "bg-teal-700 text-white hover:bg-teal-600 transition-colors",
                "disabled:opacity-60"
              )}
            >
              {publishMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="px-8 py-8 bg-slate-100 min-h-screen">
        <ReportCardPreview data={card} />
      </div>
    </div>
  );
}
