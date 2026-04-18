// ============================================================
// Wamanafo SHS — Teacher Export Page
// ============================================================
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, API_BASE, getToken } from "@/lib/api-client";
import {
  Download, FileSpreadsheet, Loader2, Filter,
  ClipboardList, BookOpen, CheckCircle2, AlertCircle,
} from "lucide-react";

interface SelectOption { id: string; name: string; }

function useClasses() {
  return useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const res = await api.get<{ items: SelectOption[] }>("/api/v1/classes");
      if (!res.success) return [];
      return (res.data as unknown as { id: string; name: string }[]) ?? [];
    },
  });
}
function useTerms() {
  return useQuery({
    queryKey: ["terms-list"],
    queryFn: async () => {
      const res = await api.get<SelectOption[]>("/api/v1/terms");
      if (!res.success) return [];
      return (res.data as unknown as SelectOption[]) ?? [];
    },
  });
}
function useSubjects() {
  return useQuery({
    queryKey: ["subjects-list"],
    queryFn: async () => {
      const res = await api.get<SelectOption[]>("/api/v1/subjects");
      if (!res.success) return [];
      return (res.data as unknown as SelectOption[]) ?? [];
    },
  });
}

type ExportType   = "attendance" | "scores";
type ExportFormat = "xlsx" | "csv";

interface Filters {
  classId:   string; subjectId: string; termId:    string;
  dateFrom:  string; dateTo:    string; format:    ExportFormat;
}

function buildUrl(type: ExportType, filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.classId)   params.set("classId",   filters.classId);
  if (filters.subjectId && type === "scores") params.set("subjectId", filters.subjectId);
  if (filters.termId)    params.set("termId",    filters.termId);
  if (type === "attendance") {
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo)   params.set("dateTo",   filters.dateTo);
  }
  params.set("format", filters.format);
  return `${API_BASE}/api/v1/export/${type}?${params.toString()}`;
}

export default function TeacherExportPage() {
  const { data: classes  = [] } = useClasses();
  const { data: terms    = [] } = useTerms();
  const { data: subjects = [] } = useSubjects();

  const [filters, setFilters] = useState<Filters>({
    classId: "", subjectId: "", termId: "",
    dateFrom: "", dateTo: "", format: "xlsx",
  });
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [done,      setDone]      = useState<string | null>(null);

  const set = (field: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setFilters((f) => ({ ...f, [field]: e.target.value }));

  async function doExport(type: ExportType) {
    setError(null); setDone(null); setExporting(type);
    try {
      const token = getToken();
      const url   = buildUrl(type, filters);
      const res   = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? `Export failed (${res.status})`);
      }
      const blob     = await res.blob();
      const filename = res.headers.get("Content-Disposition")?.match(/filename="(.+?)"/)?.[1]
        ?? `${type}_export.${filters.format}`;
      const a = document.createElement("a");
      a.href  = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      setDone(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">Export Data</h1>
          <p className="page-subtitle">Download attendance and score reports</p>
        </div>
      </div>

      {error && (
        <div className="alert-error mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {done && (
        <div className="alert-success mb-5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{done}</span>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="section-title flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-600" />
          Export Filters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="label">Class</label>
            <select className="select" value={filters.classId} onChange={set("classId")}>
              <option value="">All my classes</option>
              {(classes as SelectOption[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Term</label>
            <select className="select" value={filters.termId} onChange={set("termId")}>
              <option value="">All terms</option>
              {(terms as SelectOption[]).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select className="select" value={filters.format}
              onChange={(e) => setFilters((f) => ({ ...f, format: e.target.value as ExportFormat }))}>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>
          <div>
            <label className="label">Date From (attendance)</label>
            <input type="date" className="input" value={filters.dateFrom} onChange={set("dateFrom")} />
          </div>
          <div>
            <label className="label">Date To (attendance)</label>
            <input type="date" className="input" value={filters.dateTo} onChange={set("dateTo")} />
          </div>
          <div>
            <label className="label">Subject (scores)</label>
            <select className="select" value={filters.subjectId} onChange={set("subjectId")}>
              <option value="">All subjects</option>
              {(subjects as SelectOption[]).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Attendance export */}
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Attendance Report</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Export attendance records with date, status, and class details.
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-xs text-slate-400 mb-3">
              Columns: Index No, Student Name, Class, Term, Date, Status, Note
            </p>
            <button
              onClick={() => doExport("attendance")}
              disabled={!!exporting}
              className="btn-primary w-full"
            >
              {exporting === "attendance"
                ? <><Loader2 className="w-4 h-4 animate-spin" />Exporting…</>
                : <><Download className="w-4 h-4" />Export Attendance {filters.format.toUpperCase()}</>
              }
            </button>
          </div>
        </div>

        {/* Scores export */}
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Scores & Grades Report</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Export class scores, exam scores, totals, grades, and remarks.
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-xs text-slate-400 mb-3">
              Columns: Index No, Student Name, Subject, Class Score, Exam Score, Total, Grade
            </p>
            <button
              onClick={() => doExport("scores")}
              disabled={!!exporting}
              className="btn-gold w-full"
            >
              {exporting === "scores"
                ? <><Loader2 className="w-4 h-4 animate-spin" />Exporting…</>
                : <><FileSpreadsheet className="w-4 h-4" />Export Scores {filters.format.toUpperCase()}</>
              }
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <p className="text-xs text-slate-500">
          <strong>Note:</strong> Exports include only data from classes and subjects you are assigned to.
          Filters are optional — leave blank to export all your available data.
        </p>
      </div>
    </div>
  );
}
