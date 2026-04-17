// ============================================================
// Wamanafo SHS — Admin: Promotion Recommendations
// Term 3 only. System recommends; ADMIN always decides.
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, MinusCircle, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

const REC_CONFIG = {
  PROMOTE:    { label: "Promote",    icon: CheckCircle,  colour: "text-green-700 bg-green-50 border-green-200" },
  BORDERLINE: { label: "Borderline", icon: AlertTriangle, colour: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  REPEAT:     { label: "Repeat",     icon: MinusCircle,  colour: "text-red-700 bg-red-50 border-red-200" },
};


interface StudentPromotionResult {
  studentId:        string;
  indexNumber:      string;
  firstName:        string;
  lastName:         string;
  corePassCount:    number;
  electivePassCount: number;
  attendancePercent: number | null;
  overallAverage:   number | null;
  recommendation:   "PROMOTE" | "BORDERLINE" | "REPEAT";
  details:          string[];
}

export default function PromotionPage() {
  const [classId, setClassId] = useState("");
  const [termId,  setTermId]  = useState("");

  // Configurable criteria
  const [minCore,       setMinCore]       = useState(3);
  const [minElective,   setMinElective]   = useState(2);
  const [minAttendance, setMinAttendance] = useState(50);
  const [minAverage,    setMinAverage]    = useState(40);

  const { data: classesData } = useQuery({
    queryKey: ["classes", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/v1/classes?pageSize=100");
      return res.success ? res.data : { items: [] };
    },
  });

  // Only show Term 3 terms
  const { data: termsData } = useQuery({
    queryKey: ["terms", "term3"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string; number: number; isCurrent: boolean }> }>("/api/v1/terms");
      if (!res.success) return { items: [] };
      return { ...res.data, items: res.data.items.filter((t) => t.number === 3) };
    },
  });

  const canLoad = !!classId && !!termId;

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ["promotion", classId, termId, minCore, minElective, minAttendance, minAverage],
    queryFn: async () => {
      const qs = new URLSearchParams({
        classId,
        termId,
        minCore:       String(minCore),
        minElective:   String(minElective),
        minAttendance: String(minAttendance),
        minAverage:    String(minAverage),
      }).toString();
      const res = await apiFetch<StudentPromotionResult[]>(`/api/v1/promotion?${qs}`);
      if (!res.success) throw new Error(res.error ?? "Failed to compute recommendations");
      return res.data;
    },
    enabled: canLoad,
  });

  const rows = results ?? [];
  const promoteCt    = rows.filter((r) => r.recommendation === "PROMOTE").length;
  const borderlineCt = rows.filter((r) => r.recommendation === "BORDERLINE").length;
  const repeatCt     = rows.filter((r) => r.recommendation === "REPEAT").length;

  return (
    <div>
      <PageHeader
        title="Promotion Recommendations"
        description="Term 3 only. System recommends based on academic and attendance criteria. Administrator always makes the final decision."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Promotion" },
        ]}
      />

      <div className="px-8 py-6 space-y-6">
        {/* Selectors + criteria */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Class</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select class…</option>
                {(classesData?.items ?? []).map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Term 3</label>
              <select value={termId} onChange={(e) => setTermId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select Term 3…</option>
                {(termsData?.items ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? " (current)" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
              Promotion Criteria
            </p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Min core passes",    value: minCore,       setter: setMinCore,       min: 0, max: 4 },
                { label: "Min elective passes",value: minElective,   setter: setMinElective,   min: 0, max: 4 },
                { label: "Min attendance (%)", value: minAttendance, setter: setMinAttendance, min: 0, max: 100 },
                { label: "Min overall average",value: minAverage,    setter: setMinAverage,    min: 0, max: 100 },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                  <input
                    type="number"
                    min={f.min} max={f.max}
                    value={f.value}
                    onChange={(e) => f.setter(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300
                      focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            These are system <strong>recommendations only</strong>. The administrator must review each
            student and make the final promotion decision. No student is auto-promoted.
          </p>
        </div>

        {/* Summary strip */}
        {rows.length > 0 && (
          <div className="flex gap-4">
            {[
              { label: "Promote",    count: promoteCt,    colour: "text-green-700" },
              { label: "Borderline", count: borderlineCt, colour: "text-yellow-700" },
              { label: "Repeat",     count: repeatCt,     colour: "text-red-700"   },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-3">
                <p className={cn("text-2xl font-bold font-mono", s.colour)}>{s.count}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Results table */}
        {!canLoad ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Select a class and Term 3 to compute recommendations.</p>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-white rounded-xl border border-red-200 px-6 py-8 text-center">
            <p className="text-sm text-red-600">
              Failed to compute recommendations. Ensure this is a Term 3 term with approved scores.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center">
            <p className="text-sm text-slate-500">No active students found in this class.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Student", "Index No.", "Core Passes", "Elective Passes", "Attendance", "Average", "Recommendation", "Notes"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const cfg = REC_CONFIG[row.recommendation as keyof typeof REC_CONFIG];
                  const Icon = cfg.icon;
                  return (
                    <tr key={row.studentId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.lastName}, {row.firstName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.indexNumber}</td>
                      <td className="px-4 py-3 font-mono text-center">
                        <span className={cn("font-semibold",
                          row.corePassCount >= minCore ? "text-green-700" : "text-red-700")}>
                          {row.corePassCount}
                        </span>
                        <span className="text-slate-400">/{minCore}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-center">
                        <span className={cn("font-semibold",
                          row.electivePassCount >= minElective ? "text-green-700" : "text-red-700")}>
                          {row.electivePassCount}
                        </span>
                        <span className="text-slate-400">/{minElective}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-center">
                        <span className={cn("font-semibold",
                          (row.attendancePercent ?? 0) >= minAttendance ? "text-green-700" : "text-red-700")}>
                          {row.attendancePercent?.toFixed(1) ?? "—"}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-center">
                        <span className={cn("font-semibold",
                          (row.overallAverage ?? 0) >= minAverage ? "text-green-700" : "text-red-700")}>
                          {row.overallAverage?.toFixed(1) ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          cfg.colour
                        )}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px]">
                        {row.details.length > 0
                          ? row.details[0]
                          : <span className="text-green-600">Meets all criteria</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
