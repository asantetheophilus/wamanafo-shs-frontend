// ============================================================
// Wamanafo SHS — Admin: Students List Page
// ============================================================

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { StudentTable } from "@/components/tables/StudentTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";

export default function StudentsPage() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const debouncedSearch         = useDebounce(search, 300);

  const { data, isLoading, isError } = useStudents({
    page,
    pageSize: 20,
    search:   debouncedSearch || undefined,
    status:   status         || undefined,
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  }, []);

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records, enrolments, and status."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Students" },
        ]}
        action={
          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-teal-700 text-white text-sm font-semibold hover:bg-teal-600
              transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add student
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="px-8 py-4 flex items-center gap-3 border-b border-slate-200 bg-white">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search name, email, index…"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300
              focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={handleStatusChange}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="WITHDRAWN">Withdrawn</option>
          <option value="GRADUATED">Graduated</option>
        </select>

        {/* Result count */}
        {data && (
          <p className="text-sm text-slate-500 ml-auto">
            {data.total} {data.total === 1 ? "student" : "students"}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-lg shadow-sm">
        {isError ? (
          <div className="px-8 py-12 text-center text-sm text-red-600">
            Failed to load students. Please refresh the page.
          </div>
        ) : (
          <StudentTable
            students={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            pageSize={20}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
