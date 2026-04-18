// ============================================================
// Wamanafo SHS — Student Table (Liquid UI)
// ============================================================
"use client";

import Link from "next/link";
import { StatusBadge, studentStatusLabel } from "@/components/shared/StatusBadge";
import { studentStatusVariant, formatDate, getInitials } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

export interface StudentRow {
  id:          string;
  indexNumber: string;
  status:      string;
  user:        { firstName: string; lastName: string; email: string };
  dateOfBirth: string | null;
  gender:      string | null;
  class?:      { name: string } | null;
}

interface StudentTableProps {
  students:  StudentRow[];
  isLoading: boolean;
}

export function StudentTable({ students, isLoading }: StudentTableProps) {
  if (isLoading) return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  );

  if (!students.length) return (
    <div className="empty-state py-20">
      <GraduationCap className="empty-state-icon" />
      <p className="empty-state-title">No students found</p>
      <p className="empty-state-body">Try adjusting your search or filters, or import students.</p>
    </div>
  );

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Index No.</th>
          <th>Class</th>
          <th>Gender</th>
          <th>Date of Birth</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => {
          const fullName = `${s.user.firstName} ${s.user.lastName}`;
          return (
            <tr key={s.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">
                    {getInitials(fullName)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">{fullName}</p>
                    <p className="text-xs text-slate-400">{s.user.email}</p>
                  </div>
                </div>
              </td>
              <td><span className="font-mono text-xs font-semibold text-slate-600">{s.indexNumber}</span></td>
              <td>{s.class?.name ?? <span className="text-slate-300">—</span>}</td>
              <td>{s.gender
                ? <span className="capitalize text-slate-600">{s.gender.toLowerCase()}</span>
                : <span className="text-slate-300">—</span>
              }</td>
              <td><span className="font-mono text-xs">{formatDate(s.dateOfBirth)}</span></td>
              <td>
                <StatusBadge
                  label={studentStatusLabel(s.status)}
                  variant={studentStatusVariant(s.status)}
                />
              </td>
              <td>
                <Link
                  href={`/admin/students/${s.id}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-800 hover:underline transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
