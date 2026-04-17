// ============================================================
// Wamanafo SHS — Admin: Classes List Page
// ============================================================

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useClasses } from "@/hooks/useClasses";
import { ClassTable } from "@/components/tables/ClassTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import { apiFetch } from "@/lib/api-client";

export default function ClassesPage() {
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [yearId, setYearId]           = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const debouncedSearch               = useDebounce(search, 300);

  // Fetch filter options
  const { data: yearsData }      = useQuery({
    queryKey: ["academic-years", "options"],
    queryFn:  async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string; isCurrent: boolean }> }>("/api/v1/academic-years");
      return res.success ? res.data : { items: [] };
    },
  });
  const { data: programmesData } = useQuery({
    queryKey: ["programmes", "options"],
    queryFn:  async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/v1/programmes");
      return res.success ? res.data : { items: [] };
    },
  });

  const { data, isLoading, isError } = useClasses({
    page,
    pageSize:    20,
    search:      debouncedSearch || undefined,
    yearId:      yearId      || undefined,
    programmeId: programmeId || undefined,
  });

  const resetFilters = useCallback(() => {
    setSearch(""); setYearId(""); setProgrammeId(""); setPage(1);
  }, []);

  const hasFilters = search || yearId || programmeId;

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Manage class groups, assign form masters, and track enrolments."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Classes" },
        ]}
        action={
          <Link
            href="/admin/classes/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-teal-700 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add class
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search class name…"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300
              focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={yearId}
          onChange={(e) => { setYearId(e.target.value); setPage(1); }}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All years</option>
          {(yearsData?.items ?? []).map((y: { id: string; name: string; isCurrent: boolean }) => (
            <option key={y.id} value={y.id}>
              {y.name}{y.isCurrent ? " (current)" : ""}
            </option>
          ))}
        </select>

        <select
          value={programmeId}
          onChange={(e) => { setProgrammeId(e.target.value); setPage(1); }}
          className="text-sm rounded-lg border border-slate-300 px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All programmes</option>
          {(programmesData?.items ?? []).map((p: { id: string; name: string }) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {hasFilters && (
          <button onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-teal-700 underline">
            Clear filters
          </button>
        )}

        {data && (
          <p className="text-sm text-slate-500 ml-auto">
            {data.total} {data.total === 1 ? "class" : "classes"}
          </p>
        )}
      </div>

      <div className="bg-white rounded-b-lg shadow-sm">
        {isError ? (
          <div className="px-8 py-12 text-center text-sm text-red-600">
            Failed to load classes. Please refresh.
          </div>
        ) : (
          <ClassTable
            classes={data?.items ?? []}
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
