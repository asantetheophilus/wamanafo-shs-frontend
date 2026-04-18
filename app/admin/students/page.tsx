// ============================================================
// Wamanafo SHS — Admin: Students List Page (Liquid UI)
// ============================================================
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Upload, X } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import type { StudentListRow } from "@/types/student";
import { StudentTable } from "@/components/tables/StudentTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";

export default function StudentsPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debSearch           = useDebounce(search, 300);

  const pageSize = 20;

  const { data, isLoading, isError } = useStudents({
    page, pageSize,
    search: debSearch || undefined,
    status: status   || undefined,
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const tableStudents = (data?.items ?? []).map((student: StudentListRow) => ({
    id: student.id,
    indexNumber: student.indexNumber,
    status: student.status,
    user: {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    },
    dateOfBirth: null,
    gender: null,
    class: student.className ? { name: student.className } : null,
  }));

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value); setPage(1);
  }, []);

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records, enrolments, and status."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Students" }]}
        action={
          <div className="flex gap-2">
            <Link href="/admin/students/import" className="btn-secondary btn-sm">
              <Upload className="w-3.5 h-3.5" />Import
            </Link>
            <Link href="/admin/students/new" className="btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" />Add student
            </Link>
          </div>
        }
      />

      <div className="page-shell">
        {/* Filters toolbar */}
        <div className="card-flat px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or index number…"
              value={search}
              onChange={handleSearch}
              className="input pl-9"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="select w-40"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="GRADUATED">Graduated</option>
          </select>
          {(search || status) && (
            <button
              onClick={() => { setSearch(""); setStatus(""); setPage(1); }}
              className="btn-secondary btn-sm"
            >
              <X className="w-3.5 h-3.5" />Clear
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {isLoading ? "Loading…" : `${data?.total ?? 0} students`}
          </span>
        </div>

        {isError && (
          <div className="alert-error">
            Failed to load students. Please try again.
          </div>
        )}

        <div className="table-wrap">
          <StudentTable
            students={tableStudents}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} · {data.total} students
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary btn-sm disabled:opacity-40"
              >Previous</button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary btn-sm disabled:opacity-40"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
