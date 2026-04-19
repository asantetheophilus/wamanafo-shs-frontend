// ============================================================
// Wamanafo SHS — Student: Report Cards List
// Only published report cards are shown.
// ============================================================

"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { studentPortalKeys } from "@/hooks/useStudentPortal";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatPosition } from "@/lib/ranking";

interface ReportCardRow {
  id:            string;
  termName:      string;
  yearName:      string;
  classPosition: number | null;
  aggregate:     number | null;
  publishedAt:   string | null;
}

export default function StudentReportCardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: studentPortalKeys.reportCards(),
    queryFn: async () => {
      const res = await api.get<ReportCardRow[]>("/api/v1/student-portal?view=report-cards");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  const cards = data ?? [];

  return (
    <div>
      <PageHeader
        title="My Report Cards"
        description="Published end-of-term reports."
        breadcrumbs={[
          { label: "Portal", href: "/student/portal" },
          { label: "Report Cards" },
        ]}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 card-flat animate-pulse" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="card-flat px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No published report cards yet. Check back after your school publishes results.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/student/report-cards/${card.id}`}
                className="block card-flat px-6 py-5
                  hover:shadow-md hover:border-teal-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-teal-700">
                      {card.termName} · {card.yearName}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                      <span>
                        Position: <strong className="text-teal-700 font-mono">
                          {formatPosition(card.classPosition)}
                        </strong>
                      </span>
                      <span>
                        Aggregate: <strong className={
                          card.aggregate === null ? "text-slate-400" :
                          card.aggregate <= 12 ? "text-green-700 font-mono" :
                          card.aggregate <= 24 ? "text-yellow-700 font-mono" :
                          "text-red-700 font-mono"
                        }>
                          {card.aggregate ?? "Pending"}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <StatusBadge label="Published" variant="success" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
