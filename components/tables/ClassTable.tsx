// ============================================================
// Wamanafo SHS — Class Table
// ============================================================

"use client";

import Link from "next/link";
import { MoreHorizontal, School } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { cn } from "@/lib/utils";
import type { ClassListRow } from "@/types/class";

interface ClassTableProps {
  classes:      ClassListRow[];
  total:        number;
  page:         number;
  pageSize:     number;
  onPageChange: (page: number) => void;
  isLoading?:   boolean;
}

export function ClassTable({ classes, total, page, pageSize, onPageChange, isLoading }: ClassTableProps) {
  if (isLoading) return <ClassTableSkeleton />;

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={School}
        title="No classes found"
        description="Try adjusting your filters or create a new class."
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["Class", "Academic Year", "Programme", "Form Master", "Students", ""].map((h, i) => (
                <th key={i} className={cn(
                  "text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide",
                  i === 5 && "w-12"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 font-medium text-slate-800">{cls.name}</td>
                <td className="px-4 py-3 text-slate-600">{cls.yearName}</td>
                <td className="px-4 py-3 text-slate-600">{cls.programmeName}</td>
                <td className="px-4 py-3 text-slate-600">
                  {cls.formMasterName ?? <span className="text-slate-400 italic text-xs">Not assigned</span>}
                </td>
                <td className="px-4 py-3 font-mono text-slate-700">{cls.studentCount}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/classes/${cls.id}`}
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

function ClassTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex gap-4">
        {[120, 100, 140, 160, 60].map((w, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {[100, 90, 130, 150, 40].map((w, j) => (
            <div key={j} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}
