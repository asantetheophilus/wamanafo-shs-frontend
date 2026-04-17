// ============================================================
// Wamanafo SHS — Teacher Table
// ============================================================

"use client";

import Link from "next/link";
import { MoreHorizontal, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { cn, getInitials } from "@/lib/utils";
import type { TeacherListRow } from "@/types/teacher";

interface TeacherTableProps {
  teachers: TeacherListRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function TeacherTable({
  teachers,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
}: TeacherTableProps) {
  if (isLoading) return <TeacherTableSkeleton />;

  if (teachers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No teachers found"
        description="Try adjusting your search or add a new teacher."
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
                Teacher
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Staff ID
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Form Master
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Assignments
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                {/* Name + email */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-xs font-semibold shrink-0">
                      {getInitials(`${teacher.firstName} ${teacher.lastName}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {teacher.lastName}, {teacher.firstName}
                      </p>
                      <p className="text-xs text-slate-400 truncate font-mono">
                        {teacher.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Staff ID */}
                <td className="px-4 py-3 font-mono text-slate-700">
                  {teacher.staffId}
                </td>

                {/* Form master class */}
                <td className="px-4 py-3 text-slate-600">
                  {teacher.formMasterClass ?? <span className="text-slate-400">—</span>}
                </td>

                {/* Assignment count */}
                <td className="px-4 py-3 font-mono text-slate-700">
                  {teacher.assignmentCount}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge
                    label={teacher.isActive ? "Active" : "Inactive"}
                    variant={teacher.isActive ? "success" : "neutral"}
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/teachers/${teacher.id}`}
                    className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-md",
                      "text-slate-400 hover:text-teal-700 hover:bg-teal-50",
                      "opacity-0 group-hover:opacity-100 transition-all"
                    )}
                    title="View teacher"
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

function TeacherTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex gap-4">
        {[200, 100, 100, 80, 80].map((w, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
          <div className="h-3 bg-slate-200 rounded w-40" />
          <div className="h-3 bg-slate-200 rounded w-24 ml-4" />
          <div className="h-3 bg-slate-200 rounded w-20 ml-4" />
          <div className="h-3 bg-slate-200 rounded w-8 ml-4" />
          <div className="h-5 bg-slate-200 rounded-full w-16 ml-4" />
        </div>
      ))}
    </div>
  );
}
