// ============================================================
// Wamanafo SHS — Bulk Student Import Page (Admin)
// ============================================================
"use client";

import { useState, useRef, useCallback } from "react";
import { API_BASE, getToken } from "@/lib/api-client";
import {
  Download, CheckCircle2, XCircle, AlertCircle,
  Loader2, FileSpreadsheet, Users, ArrowRight, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RowStatus  = "success" | "failed" | "skipped";

interface ParsedRow {
  firstName: string; lastName: string; email: string;
  indexNumber: string; gender?: string; dateOfBirth?: string; className?: string;
}

interface ImportResult {
  row:     number;
  status:  RowStatus;
  data:    ParsedRow;
  reason?: string;
}

interface ImportSummary {
  total: number; success: number; failed: number; skipped: number;
  results: ImportResult[];
}

type Step = "upload" | "preview" | "result";

const STATUS_COLORS: Record<RowStatus, string> = {
  success: "text-emerald-700 bg-emerald-50",
  failed:  "text-red-700 bg-red-50",
  skipped: "text-amber-700 bg-amber-50",
};

export default function ImportStudentsPage() {
  const [step,    setStep]    = useState<Step>("upload");
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [dragging,setDragging]= useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Download template ──────────────────────────────────
  function downloadTemplate() {
    const token = getToken();
    const a = document.createElement("a");
    a.href = `${API_BASE}/api/v1/import/students/template`;
    // Append auth header via fetch instead
    fetch(a.href, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "student_import_template.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  // ── File drop / select ─────────────────────────────────
  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    setLoading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API_BASE}/api/v1/import/students?preview=true`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json() as { success: boolean; data?: { rows: ParsedRow[] }; error?: string };
      if (!json.success) throw new Error(json.error ?? "Failed to parse file.");
      setPreview(json.data!.rows);
      setStep("preview");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to parse file.");
    } finally {
      setLoading(false);
    }
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  // ── Run import ─────────────────────────────────────────
  async function runImport() {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/api/v1/import/students`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json() as { success: boolean; data?: ImportSummary; error?: string };
      if (!json.success) throw new Error(json.error ?? "Import failed.");
      setSummary(json.data!);
      setStep("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("upload"); setFile(null); setPreview([]); setSummary(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">Import Students</h1>
          <p className="page-subtitle">Bulk add students from an Excel or CSV file</p>
        </div>
        <button onClick={downloadTemplate} className="btn-secondary">
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-7">
        {(["upload","preview","result"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              step === s ? "bg-teal-700 text-white" :
              (i < ["upload","preview","result"].indexOf(step))
                ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
            )}>
              {i < ["upload","preview","result"].indexOf(step)
                ? <CheckCircle2 className="w-4 h-4" />
                : i + 1
              }
            </div>
            <span className={cn("text-sm font-medium capitalize",
              step === s ? "text-teal-700" : "text-slate-400"
            )}>
              {s}
            </span>
            {i < 2 && <ArrowRight className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="alert-error mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Step 1: Upload ── */}
      {step === "upload" && (
        <div className="card p-8">
          <div
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
              dragging
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
            )}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Drop your file here</h3>
            <p className="text-sm text-slate-500 mb-4">or click to browse</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel (.xlsx) or CSV
            </span>
            <p className="text-xs text-slate-400 mt-3">Maximum 500 rows per import · Max 10 MB</p>

            {loading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-teal-700">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Parsing file…</span>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* Template info */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-2">Required columns</p>
            <div className="flex flex-wrap gap-2">
              {["First Name","Last Name","Email","Index Number","Gender","Date of Birth","Class"].map((col) => (
                <span key={col} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 font-mono">
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Gender: Male / Female / Other · Date format: YYYY-MM-DD
            </p>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview ── */}
      {step === "preview" && (
        <div className="space-y-5">
          <div className="card-flat px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-semibold text-slate-800">{preview.length} students ready to import</p>
                <p className="text-xs text-slate-500">Review the data below before importing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={runImport} disabled={loading} className="btn-primary btn-sm">
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Importing…</>
                  : <><CheckCircle2 className="w-3.5 h-3.5" />Confirm Import</>
                }
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th><th>Last Name</th><th>Email</th>
                  <th>Index No.</th><th>Gender</th><th>Date of Birth</th><th>Class</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 100).map((row, i) => (
                  <tr key={i}>
                    <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="font-medium">{row.firstName}</td>
                    <td>{row.lastName}</td>
                    <td className="text-xs font-mono">{row.email}</td>
                    <td className="font-mono text-xs">{row.indexNumber}</td>
                    <td>{row.gender || "—"}</td>
                    <td>{row.dateOfBirth || "—"}</td>
                    <td>{row.className || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 100 && (
              <p className="text-xs text-slate-400 text-center py-3 border-t border-slate-100">
                Showing first 100 of {preview.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {step === "result" && summary && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total",     count: summary.total,   color: "bg-slate-50 border-slate-200 text-slate-700"    },
              { label: "Imported",  count: summary.success, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { label: "Skipped",   count: summary.skipped, color: "bg-amber-50 border-amber-200 text-amber-700"    },
              { label: "Failed",    count: summary.failed,  color: "bg-red-50 border-red-200 text-red-700"          },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-2xl border p-5 text-center", s.color)}>
                <p className="text-3xl font-bold font-mono">{s.count}</p>
                <p className="text-sm font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card-flat px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Import completed — {summary.success} student{summary.success !== 1 ? "s" : ""} added
            </p>
            <button onClick={reset} className="btn-secondary btn-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Import Another
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Row</th><th>Status</th>
                  <th>Name</th><th>Index No.</th><th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {summary.results.map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-slate-400">{r.row}</td>
                    <td>
                      <span className={cn("badge", STATUS_COLORS[r.status])}>
                        {r.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                        {r.status === "failed"  && <XCircle      className="w-3 h-3" />}
                        {r.status === "skipped" && <AlertCircle  className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td>{r.data.firstName} {r.data.lastName}</td>
                    <td className="font-mono text-xs">{r.data.indexNumber}</td>
                    <td className="text-xs text-slate-500">{r.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
