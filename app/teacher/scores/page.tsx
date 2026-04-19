// ============================================================
// Wamanafo SHS — Teacher: Score Entry Page
// ============================================================

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { useScoreGrid } from "@/hooks/useScores";
import { ScoreEntryGrid } from "@/components/forms/ScoreEntryGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api-client";

export default function TeacherScoresPage() {
  const [classId,   setClassId]   = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId,    setTermId]    = useState("");

  const { data: classesData } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: async () => { const res = await api.get<{ items: Array<{ id: string; name: string }> }>("/api/v1/classes?pageSize=50"); if (!res.success) throw new Error(res.error); return res.data; },
  });

  const { data: subjectsData } = useQuery({
    queryKey: ["subjects", "options"],
    queryFn: async () => { const res = await api.get<{ items: Array<{ id: string; name: string; code: string }> }>("/api/v1/subjects?pageSize=100"); if (!res.success) throw new Error(res.error); return res.data; },
  });

  const { data: termsData } = useQuery({
    queryKey: ["terms", "options"],
    queryFn: async () => { const res = await api.get<{ items: Array<{ id: string; name: string; number: number; isCurrent: boolean; classScoreWeight: number; examScoreWeight: number }> }>("/api/v1/terms"); if (!res.success) throw new Error(res.error); return res.data; },
  });

  const selectedTerm = termsData?.items?.find((t: { id: string }) => t.id === termId);
  const canLoad = classId && subjectId && termId;

  const { data: grid, isLoading, isError, refetch } = useScoreGrid(classId, subjectId, termId);

  return (
    <div>
      <PageHeader
        title="Score Entry"
        description="Enter and submit class and exam scores for your assigned subjects."
        breadcrumbs={[
          { label: "Teacher", href: "/teacher/dashboard" },
          { label: "Scores" },
        ]}
      />

      <div className="page-shell">
        {/* Selectors */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Select subject, class, and term</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Subject</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select subject…</option>
                {(subjectsData?.items ?? []).map((s: { id: string; name: string; code: string }) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
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
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Term</label>
              <select value={termId} onChange={(e) => setTermId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Select term…</option>
                {(termsData?.items ?? []).map((t: { id: string; name: string; isCurrent: boolean }) => (
                  <option key={t.id} value={t.id}>{t.name}{t.isCurrent ? " (current)" : ""}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {canLoad ? (
          <div className="card p-6">
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              </div>
            )}
            {isError && (
              <p className="text-center py-8 text-sm text-red-600">Failed to load scores. Please try again.</p>
            )}
            {!isLoading && !isError && grid && (
              grid.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-500">No students enrolled in this class.</p>
              ) : (
                <ScoreEntryGrid
                  classId={classId}
                  subjectId={subjectId}
                  termId={termId}
                  classScoreWeight={selectedTerm?.classScoreWeight ?? 30}
                  examScoreWeight={selectedTerm?.examScoreWeight ?? 70}
                  rows={grid}
                  onSaved={() => void refetch()}
                />
              )
            )}
          </div>
        ) : (
          <div className="card px-6 py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Select a subject, class, and term to begin entering scores.</p>
          </div>
        )}
      </div>
    </div>
  );
}
