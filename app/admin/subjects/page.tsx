// ============================================================
// Wamanafo SHS — Admin: Subjects List Page
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { SubjectTable } from "@/components/tables/SubjectTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

type CoreFilter = "all" | "core" | "elective";

export default function SubjectsPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [coreFilter, setCoreFilter] = useState<CoreFilter>("all");
  const debouncedSearch           = useDebounce(search, 300);

  const isCore =
    coreFilter === "all"     ? undefined :
    coreFilter === "core"    ? true      : false;

  const { data, isLoading, isError } = useSubjects({
    page,
    pageSize: 50,
    search:   debouncedSearch || undefined,
    isCore,
  });

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Configure core and elective subjects available at this school."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Subjects" },
        ]}
        action={
          <Link
            href="/admin/subjects/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              bg-teal-700 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add subject
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="px-8 py-4 flex items-center gap-3 border-b border-slate-200 bg-white">
        {/* Type tabs */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
          {(["all", "core", "elective"] as CoreFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setCoreFilter(f); setPage(1); }}
              className={cn(
                "px-4 py-1.5 font-medium capitalize transition-colors",
                coreFilter === f
                  ? "bg-teal-700 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or code…"
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

        {data && (
          <p className="text-sm text-slate-500 ml-auto">
            {data.total} {data.total === 1 ? "subject" : "subjects"}
          </p>
        )}
      </div>

      <div className="bg-white rounded-b-lg shadow-sm">
        {isError ? (
          <div className="px-8 py-12 text-center text-sm text-red-600">
            Failed to load subjects. Please refresh.
          </div>
        ) : (
          <SubjectTable
            subjects={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            pageSize={50}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
