// ============================================================
// Wamanafo SHS — Admin: Term Configuration
// Admin sets score weights (must sum to 100) and total school
// days for each term before score entry can begin.
// ============================================================

"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { apiFetch, getToken } from "@/lib/api-client";

interface TermRow {
  id:               string;
  name:             string;
  number:           number;
  isCurrent:        boolean;
  totalSchoolDays:  number;
  classScoreWeight: number;
  examScoreWeight:  number;
  startDate:        string | null;
  endDate:          string | null;
  year:             { id: string; name: string };
}

const termEditSchema = z.object({
  totalSchoolDays:  z.coerce.number().int().min(1).max(120),
  classScoreWeight: z.coerce.number().int().min(1).max(99),
  examScoreWeight:  z.coerce.number().int().min(1).max(99),
  startDate:        z.string().optional(),
  endDate:          z.string().optional(),
}).refine((d) => d.classScoreWeight + d.examScoreWeight === 100, {
  message: "Weights must sum to 100.",
  path:    ["examScoreWeight"],
});

type TermEditValues = z.infer<typeof termEditSchema>;

function TermEditForm({
  term,
  onSuccess,
}: {
  term: TermRow;
  onSuccess: () => void;
}) {
  const [serverMsg, setServerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, isDirty } } =
    useForm<TermEditValues>({
      resolver: zodResolver(termEditSchema),
      defaultValues: {
        totalSchoolDays:  term.totalSchoolDays,
        classScoreWeight: term.classScoreWeight,
        examScoreWeight:  term.examScoreWeight,
        startDate:        term.startDate?.split("T")[0] ?? "",
        endDate:          term.endDate?.split("T")[0]   ?? "",
      },
    });

  const classW = watch("classScoreWeight") ?? 0;
  const examW  = watch("examScoreWeight")  ?? 0;
  const weightSum = Number(classW) + Number(examW);

  async function onSubmit(data: TermEditValues) {
    setServerMsg(null);
    const res = await apiFetch(`/api/v1/terms/${term.id}`, {
      method:  "PATCH",
      body:    JSON.stringify(data),
    });
    if (!res.success) {
      setServerMsg({ type: "error", text: res.error ?? "Update failed." });
      return;
    }
    setServerMsg({ type: "success", text: "Term configuration saved." });
    onSuccess();
  }

  const inputClass = (err: boolean) =>
    cn("w-full px-3 py-2 text-sm rounded-lg border transition-colors font-mono",
      "focus:outline-none focus:ring-2 focus:ring-teal-500",
      err ? "border-red-300 bg-red-50" : "border-slate-300 bg-white");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverMsg && (
        <div className={cn("flex items-center gap-2 text-sm rounded-lg px-3 py-2.5",
          serverMsg.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        )}>
          {serverMsg.type === "success"
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />
          }
          {serverMsg.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Total School Days</label>
          <input {...register("totalSchoolDays")} type="number" min={1} max={120}
            className={inputClass(!!errors.totalSchoolDays)} />
          {errors.totalSchoolDays && (
            <p className="text-xs text-red-600 mt-1">{errors.totalSchoolDays.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Class Score Weight (%)</label>
          <input {...register("classScoreWeight")} type="number" min={1} max={99}
            className={inputClass(!!errors.classScoreWeight)} />
          {errors.classScoreWeight && (
            <p className="text-xs text-red-600 mt-1">{errors.classScoreWeight.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Exam Score Weight (%)
            <span className={cn("ml-2 font-mono", weightSum === 100 ? "text-green-600" : "text-red-600")}>
              Sum: {weightSum}
            </span>
          </label>
          <input {...register("examScoreWeight")} type="number" min={1} max={99}
            className={inputClass(!!errors.examScoreWeight)} />
          {errors.examScoreWeight && (
            <p className="text-xs text-red-600 mt-1">{errors.examScoreWeight.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
          <input {...register("startDate")} type="date"
            className={cn(inputClass(false), "font-sans")} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
          <input {...register("endDate")} type="date"
            className={cn(inputClass(false), "font-sans")} />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting || !isDirty}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
            "bg-teal-700 text-white hover:bg-teal-600 transition-colors disabled:opacity-60"
          )}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function AdminTermsPage() {
  const qc = useQueryClient();

  const { data: termsData, isLoading } = useQuery({
    queryKey: ["terms", "all"],
    queryFn: async () => {
      const res = await apiFetch<{ items: TermRow[] }>("/api/v1/terms");
      return res.success ? res.data : { items: [] };
    },
  });

  const terms = termsData?.items ?? [];

  // Group by year
  const grouped = terms.reduce<Record<string, { yearName: string; terms: TermRow[] }>>(
    (acc, t) => {
      const key = t.year.id;
      if (!acc[key]) acc[key] = { yearName: t.year.name, terms: [] };
      acc[key]!.terms.push(t);
      return acc;
    },
    {}
  );

  return (
    <div>
      <PageHeader
        title="Term Configuration"
        description="Set score weights and school days for each term. These must be configured before teachers can submit scores."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Terms" },
        ]}
      />

      <div className="px-8 py-6 space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center">
            <Settings className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No terms found. Run the database seed first.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([yearId, { yearName, terms: yearTerms }]) => (
            <div key={yearId}>
              <h2 className="text-base font-serif font-bold text-slate-800 mb-4">
                {yearName}
              </h2>
              <div className="space-y-4">
                {yearTerms.sort((a, b) => a.number - b.number).map((term) => {
                  const isConfigured =
                    term.classScoreWeight > 0 &&
                    term.examScoreWeight  > 0 &&
                    term.classScoreWeight + term.examScoreWeight === 100 &&
                    term.totalSchoolDays  > 0;

                  return (
                    <div key={term.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-slate-800">{term.name}</h3>
                        {term.isCurrent && (
                          <StatusBadge label="Current" variant="success" />
                        )}
                        <StatusBadge
                          label={isConfigured ? "Configured" : "Needs setup"}
                          variant={isConfigured ? "success" : "warning"}
                        />
                        {isConfigured && (
                          <span className="text-xs text-slate-400 ml-auto font-mono">
                            {term.classScoreWeight}/{term.examScoreWeight} · {term.totalSchoolDays} days
                          </span>
                        )}
                      </div>
                      <div className="px-5 py-5">
                        <TermEditForm
                          term={term}
                          onSuccess={() => void qc.invalidateQueries({ queryKey: ["terms"] })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
