// ============================================================
// Wamanafo SHS — Student Table
// Displays paginated student list with status, class, actions.
// ============================================================

"use client";

import Link from "next/link";
import { MoreHorizontal, GraduationCap } from "lucide-react";
import { StatusBadge, studentStatusLabel } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { cn, studentStatusVariant, getInitials } from "@/lib/utils";
import type { StudentListRow } from "@/types/student";

interface StudentTableProps {
  students: StudentListRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function StudentTable({
  students,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
}: StudentTableProps) {
  if (isLoading) return <StudentTableSkeleton />;

  if (students.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No students found"
        description="Try adjusting your search or filters, or add a new student."
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Student
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Index No.
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Class
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Programme
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                {/* Name + email */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-semibold shrink-0">
                      {getInitials(`${student.firstName} ${student.lastName}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {student.lastName}, {student.firstName}
                      </p>
                      <p className="text-xs text-slate-400 truncate font-mono">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Index number */}
                <td className="px-4 py-3 font-mono text-slate-700">
                  {student.indexNumber}
                </td>

                {/* Class */}
                <td className="px-4 py-3 text-slate-600">
                  {student.className ?? <span className="text-slate-400">—</span>}
                </td>

                {/* Programme */}
                <td className="px-4 py-3 text-slate-600">
                  {student.programmeName ?? <span className="text-slate-400">—</span>}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge
                    label={studentStatusLabel(student.status)}
                    variant={studentStatusVariant(student.status)}
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-md",
                      "text-slate-400 hover:text-teal-700 hover:bg-teal-50",
                      "opacity-0 group-hover:opacity-100 transition-all"
                    )}
                    title="View student"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────

function StudentTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex gap-4">
        {[200, 100, 80, 120, 80].map((w, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
          <div className="h-3 bg-slate-200 rounded w-40" />
          <div className="h-3 bg-slate-200 rounded w-24 ml-4" />
          <div className="h-3 bg-slate-200 rounded w-20 ml-4" />
          <div className="h-3 bg-slate-200 rounded w-28 ml-4" />
          <div className="h-5 bg-slate-200 rounded-full w-16 ml-4" />
        </div>
      ))}
    </div>
  );
}
