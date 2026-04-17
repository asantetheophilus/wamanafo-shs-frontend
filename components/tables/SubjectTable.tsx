// ============================================================
// Wamanafo SHS — Subject Table
// ============================================================

"use client";

import Link from "next/link";
import { MoreHorizontal, BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { cn } from "@/lib/utils";
import type { SubjectListRow } from "@/types/class";

interface SubjectTableProps {
  subjects:     SubjectListRow[];
  total:        number;
  page:         number;
  pageSize:     number;
  onPageChange: (page: number) => void;
  isLoading?:   boolean;
}

export function SubjectTable({ subjects, total, page, pageSize, onPageChange, isLoading }: SubjectTableProps) {
  if (isLoading) return <SubjectTableSkeleton />;

  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No subjects found"
        description="Add core and elective subjects to get started."
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["Subject Name", "Code", "Type", "Programmes", ""].map((h, i) => (
                <th key={i} className={cn(
                  "text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide",
                  i === 4 && "w-12"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600 text-xs">{s.code}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={s.isCore ? "Core" : "Elective"}
                    variant={s.isCore ? "info" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {s.isCore
                    ? <span className="text-xs text-slate-400 italic">All programmes</span>
                    : s.programmeCount
                  }
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/subjects/${s.id}`}
                    className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-md",
                      "text-slate-400 hover:text-teal-700 hover:bg-teal-50",
                      "opacity-0 group-hover:opacity-100 transition-all"
                    )}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  );
}

function SubjectTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex gap-4">
        {[180, 80, 80, 80].map((w, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {[160, 70, 70, 50].map((w, j) => (
            <div key={j} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}
