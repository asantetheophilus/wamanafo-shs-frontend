// ============================================================
// Wamanafo SHS — Pending Actions Panel (Liquid UI)
// ============================================================
import Link from "next/link";
import { BookOpen, FileText, ChevronRight } from "lucide-react";

interface PendingActionsPanelProps {
  pendingScores:          number;
  unpublishedReportCards: number;
}

export function PendingActionsPanel({ pendingScores, unpublishedReportCards }: PendingActionsPanelProps) {
  const items = [
    {
      href:   "/admin/scores",
      icon:   BookOpen,
      label:  "Pending Scores",
      count:  pendingScores,
      color:  pendingScores > 0
        ? "text-amber-700 bg-amber-100 border-amber-200"
        : "text-slate-400 bg-slate-100 border-slate-200",
      urgent: pendingScores > 0,
    },
    {
      href:   "/admin/report-cards",
      icon:   FileText,
      label:  "Unpublished Reports",
      count:  unpublishedReportCards,
      color:  unpublishedReportCards > 0
        ? "text-blue-700 bg-blue-100 border-blue-200"
        : "text-slate-400 bg-slate-100 border-slate-200",
      urgent: unpublishedReportCards > 0,
    },
  ];

  return (
    <div className="card h-full p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Pending Actions</h3>
        <p className="text-xs text-slate-400 mt-0.5">Items requiring your attention</p>
      </div>
      <div className="p-5 space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-xl border transition-all
              hover:shadow-sm hover:border-teal-200 hover:bg-teal-50/20 group"
          >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">
                {item.label}
              </p>
              <p className="text-2xl font-bold font-mono text-slate-900 leading-tight mt-0.5">
                {item.count}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors shrink-0" />
          </Link>
        ))}

        {pendingScores === 0 && unpublishedReportCards === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">All caught up! No pending actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
