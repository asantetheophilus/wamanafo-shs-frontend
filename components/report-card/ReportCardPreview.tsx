// ============================================================
// Wamanafo SHS — Report Card Screen Preview
// Matches PDF layout exactly. Used by admin before publishing
// and by students/parents after publication.
// ============================================================

"use client";

import { formatDisplayScore } from "@/lib/grading";
import { formatAttendancePercentage } from "@/lib/attendance";
import { formatPosition } from "@/lib/ranking";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ReportCardData } from "@/types/report-card";

const GRADE_COLOR: Record<number, string> = {
  1: "text-green-700", 2: "text-green-700", 3: "text-green-700",
  4: "text-yellow-700", 5: "text-yellow-700", 6: "text-yellow-700",
  7: "text-orange-600", 8: "text-orange-600",
  9: "text-red-700",
};

interface ReportCardPreviewProps {
  data:    ReportCardData;
  onClose?: () => void;
}

export function ReportCardPreview({ data }: ReportCardPreviewProps) {
  const isDraft   = data.status === "DRAFT";
  const coreSubj  = data.subjects.filter((s) => s.isCore);
  const electives = data.subjects.filter((s) => !s.isCore);

  return (
    <div className="relative bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200 max-w-4xl mx-auto font-sans print:shadow-none print:rounded-none">
      {/* DRAFT watermark */}
      {isDraft && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
          <span className="text-[8rem] font-black text-slate-100 -rotate-12 select-none">
            DRAFT
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-teal-950 text-white px-8 py-6 text-center">
        <h1 className="text-2xl font-serif font-bold tracking-tight">{data.school.name}</h1>
        {data.school.motto && (
          <p className="text-yellow-400 text-sm italic mt-1">&ldquo;{data.school.motto}&rdquo;</p>
        )}
        <p className="text-teal-300 text-xs mt-1">
          {[data.school.address, data.school.contactPhone, data.school.contactEmail]
            .filter(Boolean).join("  ·  ")}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          {data.term.name} · {data.year.name} · End-of-Term Report
        </div>
      </div>

      <div className="page-shell">
        {/* Student block */}
        <div className="grid grid-cols-5 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <StudentField label="Full Name"     value={`${data.student.lastName}, ${data.student.firstName}`} />
          <StudentField label="Index Number"  value={data.student.indexNumber} mono />
          <StudentField label="Class"         value={data.class.name} />
          <StudentField label="Programme"     value={data.programme.name} />
          <StudentField label="Date of Birth" value={formatDate(data.student.dateOfBirth)} />
        </div>

        {/* Core subjects */}
        <SubjectSection title="Core Subjects" subjects={coreSubj} />

        {/* Elective subjects */}
        {electives.length > 0 && (
          <SubjectSection title="Elective Subjects" subjects={electives} />
        )}

        {/* Summary */}
        <div>
          <SectionTitle>Summary</SectionTitle>
          <div className="grid grid-cols-6 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <SummaryItem label="Total Marks"    value={formatDisplayScore(data.overallTotal)} />
            <SummaryItem label="Average"        value={formatDisplayScore(data.overallAverage)} />
            <SummaryItem label="Class Position" value={formatPosition(data.classPosition)} highlight />
            <SummaryItem
              label="Aggregate"
              value={data.aggregate?.toString() ?? "Pending"}
              highlight={data.aggregate !== null}
            />
            <SummaryItem label="Attendance"     value={formatAttendancePercentage(data.attendancePercentage)} />
            <SummaryItem label="Days Absent"    value={data.daysAbsent.toString()} />
          </div>
        </div>

        {/* Conduct */}
        {data.conductRatings.length > 0 && (
          <div>
            <SectionTitle>Conduct & Character</SectionTitle>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">Criterion</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">Rating</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.conductRatings.map((c) => (
                    <tr key={c.criterion}>
                      <td className="px-4 py-2 text-slate-700">{c.criterion}</td>
                      <td className="px-4 py-2 font-semibold">
                        <span className={cn(
                          c.rating === "Excellent" ? "text-green-700" :
                          c.rating === "Good"      ? "text-yellow-700" :
                          c.rating === "Fair"      ? "text-orange-600" : "text-red-700"
                        )}>
                          {c.rating}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-500 italic text-xs">{c.remark ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form master remark */}
        {data.formMasterRemark && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
              Form Master&apos;s Remark
            </p>
            <p className="text-sm text-slate-700 italic">&ldquo;{data.formMasterRemark}&rdquo;</p>
          </div>
        )}

        {/* Signature block */}
        <div className="flex items-end gap-12 pt-4 border-t border-slate-200">
          <div className="flex-1">
            <div className="border-b border-slate-400 mb-1 h-8" />
            <p className="text-xs text-slate-500">
              {data.headteacherName ? `Headteacher: ${data.headteacherName}` : "Headteacher's Signature"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Date</p>
            <p className="text-sm font-semibold text-slate-800">
              {data.publishedAt ? formatDate(data.publishedAt) : formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-8 py-3 flex items-center justify-between text-xs text-slate-400">
        <span>{data.school.name}</span>
        <span>{data.term.name} · {data.year.name}</span>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-3 pb-1 border-b border-slate-200">
      {children}
    </h3>
  );
}

function StudentField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={cn("text-sm font-semibold text-slate-800 mt-0.5", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={cn(
        "text-lg font-bold mt-0.5",
        highlight ? "text-teal-700" : "text-slate-800"
      )}>
        {value}
      </p>
    </div>
  );
}

function SubjectSection({
  title,
  subjects,
}: {
  title: string;
  subjects: ReportCardData["subjects"];
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal-950 text-white">
              {["Subject", "Class Score", "Exam Score", "Total Score", "Grade", "GP", "Remark", "Position"].map((h) => (
                <th key={h} className={cn(
                  "px-3 py-2.5 text-xs font-semibold uppercase tracking-wide",
                  h === "Subject" ? "text-left" : "text-center"
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((s, i) => (
              <tr key={s.code} className={cn("transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                <td className="px-3 py-2 text-center font-mono text-slate-600">
                  {s.classScore ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-2 text-center font-mono text-slate-600">
                  {s.examScore ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-2 text-center font-mono font-semibold text-slate-800">
                  {formatDisplayScore(s.totalScore)}
                </td>
                <td className={cn("px-3 py-2 text-center font-mono font-bold",
                  GRADE_COLOR[s.gradePoint ?? 9] ?? "text-slate-400")}>
                  {s.grade ?? "—"}
                </td>
                <td className="px-3 py-2 text-center font-mono text-slate-600">
                  {s.gradePoint ?? "—"}
                </td>
                <td className="px-3 py-2 text-center text-slate-500 text-xs">
                  {s.remark ?? "—"}
                </td>
                <td className="px-3 py-2 text-center font-mono text-slate-600">
                  {formatPosition(s.position)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
