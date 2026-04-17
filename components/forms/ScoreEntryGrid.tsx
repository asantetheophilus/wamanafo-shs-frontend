// ============================================================
// Wamanafo SHS — Score Entry Grid
// Tab-navigable grid. Teachers enter classScore and examScore
// per student; totalScore + grade computed live for preview.
// ============================================================

"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { useBulkSaveScores, useSubmitScores } from "@/hooks/useScores";
import { computeTotalScore, getGrade, formatDisplayScore } from "@/lib/grading";
import { scoreStatusVariant } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { scoreStatusLabel } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { ScoreGridRow } from "@/types/score";

interface ScoreEntryGridProps {
  classId:          string;
  subjectId:        string;
  termId:           string;
  classScoreWeight: number;
  examScoreWeight:  number;
  rows:             ScoreGridRow[];
  onSaved?:         () => void;
}

type LocalRow = ScoreGridRow & { dirty: boolean };

export function ScoreEntryGrid({
  classId, subjectId, termId,
  classScoreWeight, examScoreWeight,
  rows, onSaved,
}: ScoreEntryGridProps) {
  const [grid, setGrid]       = useState<LocalRow[]>(rows.map((r) => ({ ...r, dirty: false })));
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const tableRef              = useRef<HTMLTableElement>(null);

  const { mutateAsync: bulkSave,   isPending: saving   } = useBulkSaveScores();
  const { mutateAsync: submitAll,  isPending: submitting } = useSubmitScores();

  // Parse a score field: integer 0-100 or null
  const parseScore = (val: string): number | null => {
    if (val.trim() === "") return null;
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0 || n > 100) return null;
    return n;
  };

  const updateCell = useCallback(
    (studentId: string, field: "classScore" | "examScore", val: string) => {
      setGrid((prev) =>
        prev.map((row) =>
          row.studentId === studentId
            ? { ...row, [field]: parseScore(val), dirty: true }
            : row
        )
      );
      setSaved(false);
    },
    []
  );

  // Tab key moves to next input in the grid
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Tab") return;
    const inputs = tableRef.current?.querySelectorAll<HTMLInputElement>("input[data-score]");
    if (!inputs) return;
    const arr  = Array.from(inputs);
    const curr = e.currentTarget;
    const idx  = arr.indexOf(curr);
    if (idx === -1) return;
    const next = arr[e.shiftKey ? idx - 1 : idx + 1];
    if (next) { e.preventDefault(); next.focus(); }
  }, []);

  async function handleSave() {
    setError(null);
    const dirty = grid.filter((r) => r.dirty);
    if (dirty.length === 0) { setSaved(true); return; }

    await bulkSave({
      subjectId, termId, classId,
      scores: dirty.map((r) => ({
        studentId:  r.studentId,
        classScore: r.classScore,
        examScore:  r.examScore,
      })),
    });

    setGrid((prev) => prev.map((r) => ({ ...r, dirty: false })));
    setSaved(true);
    onSaved?.();
  }

  async function handleSubmit() {
    setError(null);
    // Save any unsaved changes first
    const dirty = grid.filter((r) => r.dirty);
    if (dirty.length > 0) await handleSave();

    try {
      await submitAll({ subjectId, classId, termId });
      setSubmitConfirm(false);
      onSaved?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setSubmitConfirm(false);
    }
  }

  // Live-preview total and grade
  const preview = (row: LocalRow) => {
    const total = computeTotalScore(row.classScore, row.examScore, classScoreWeight, examScoreWeight);
    const grade = total !== null ? getGrade(total) : null;
    return { total, grade };
  };

  const allLocked = grid.every(
    (r) => r.status === "APPROVED" || r.status === "SUBMITTED"
  );

  return (
    <div className="space-y-3">
      {/* Weight reminder */}
      <p className="text-xs text-slate-400">
        Class score weight: <strong className="text-slate-600">{classScoreWeight}%</strong>
        &nbsp;·&nbsp;Exam score weight: <strong className="text-slate-600">{examScoreWeight}%</strong>
        &nbsp;·&nbsp;Inputs: integers 0–100 only
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table ref={tableRef} className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-8">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Student</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Index</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-28">Class Score</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-28">Exam Score</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-24">Total</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-16">Grade</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {grid.map((row, idx) => {
              const { total, grade } = preview(row);
              const locked = row.status === "APPROVED" || row.status === "SUBMITTED";
              return (
                <tr key={row.studentId}
                  className={cn("transition-colors", row.dirty ? "bg-yellow-50" : "hover:bg-slate-50")}>
                  <td className="px-4 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {row.lastName}, {row.firstName}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{row.indexNumber}</td>

                  {/* Class score input */}
                  <td className="px-3 py-2">
                    <input
                      data-score
                      type="number"
                      min={0} max={100} step={1}
                      disabled={locked}
                      value={row.classScore ?? ""}
                      onChange={(e) => updateCell(row.studentId, "classScore", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="—"
                      className={cn(
                        "w-full text-center font-mono text-sm px-2 py-1.5 rounded-md border transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-teal-500",
                        locked
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-slate-300 bg-white"
                      )}
                    />
                  </td>

                  {/* Exam score input */}
                  <td className="px-3 py-2">
                    <input
                      data-score
                      type="number"
                      min={0} max={100} step={1}
                      disabled={locked}
                      value={row.examScore ?? ""}
                      onChange={(e) => updateCell(row.studentId, "examScore", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="—"
                      className={cn(
                        "w-full text-center font-mono text-sm px-2 py-1.5 rounded-md border transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-teal-500",
                        locked
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-slate-300 bg-white"
                      )}
                    />
                  </td>

                  {/* Computed total */}
                  <td className="px-3 py-2 text-center font-mono text-sm font-semibold text-slate-700">
                    {formatDisplayScore(total)}
                  </td>

                  {/* Grade */}
                  <td className="px-3 py-2 text-center">
                    {grade ? (
                      <span className={cn(
                        "font-mono font-bold text-sm",
                        grade.gradePoint <= 3 ? "text-green-700" :
                        grade.gradePoint <= 6 ? "text-yellow-700" :
                        grade.gradePoint <= 8 ? "text-orange-600" : "text-red-700"
                      )}>
                        {grade.grade}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2">
                    {row.status ? (
                      <StatusBadge
                        label={scoreStatusLabel(row.status)}
                        variant={scoreStatusVariant(row.status)}
                      />
                    ) : (
                      <span className="text-xs text-slate-300 italic">Not saved</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Scores saved as draft.
        </div>
      )}

      {/* Actions */}
      {!allLocked && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold",
              "border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Save draft"}
          </button>

          {!submitConfirm ? (
            <button
              onClick={() => setSubmitConfirm(true)}
              disabled={saving || submitting}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold",
                "bg-teal-700 text-white hover:bg-teal-600 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              Submit for approval
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Confirm submission?</span>
              <button onClick={() => setSubmitConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold",
                  "bg-teal-700 text-white rounded-lg hover:bg-teal-600 disabled:opacity-60"
                )}
              >
                {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                {submitting ? "Submitting…" : "Confirm submit"}
              </button>
            </div>
          )}
        </div>
      )}

      {allLocked && (
        <p className="text-sm text-slate-500 text-center py-2 italic">
          All scores are submitted or approved and cannot be edited.
        </p>
      )}
    </div>
  );
}
