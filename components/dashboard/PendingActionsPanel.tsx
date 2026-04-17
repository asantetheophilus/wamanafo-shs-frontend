// ============================================================
// Wamanafo SHS — Pending Actions Panel
// Shows admin what needs attention: pending score approvals
// and generated-but-unpublished report cards.
// ============================================================

import Link from "next/link";
import { CheckCircle, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingActionsPanelProps {
  pendingScores:         number;
  unpublishedReportCards: number;
}

export function PendingActionsPanel({
  pendingScores,
  unpublishedReportCards,
}: PendingActionsPanelProps) {
  const hasActions = pendingScores > 0 || unpublishedReportCards > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Pending Actions</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Items that require your attention
        </p>
      </div>

      {!hasActions ? (
        <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <p className="text-sm font-medium text-slate-600">All caught up!</p>
          <p className="text-xs text-slate-400">No pending actions at this time.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pendingScores > 0 && (
            <ActionItem
              icon={CheckCircle}
              iconBg="bg-yellow-100 text-yellow-700"
              title="Scores awaiting approval"
              count={pendingScores}
              href="/admin/scores"
              urgent
            />
          )}
          {unpublishedReportCards > 0 && (
            <ActionItem
              icon={FileText}
              iconBg="bg-blue-100 text-blue-700"
              title="Report cards ready to publish"
              count={unpublishedReportCards}
              href="/admin/report-cards"
            />
          )}
        </div>
      )}
    </div>
  );
}

function ActionItem({
  icon: Icon, iconBg, title, count, href, urgent,
}: {
  icon:    React.ElementType;
  iconBg:  string;
  title:   string;
  count:   number;
  href:    string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className={cn("text-xs mt-0.5", urgent ? "text-yellow-700 font-semibold" : "text-slate-400")}>
          {count} {count === 1 ? "item" : "items"} waiting
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
    </Link>
  );
}
