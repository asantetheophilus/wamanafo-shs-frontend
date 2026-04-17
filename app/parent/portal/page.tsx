// ============================================================
// Wamanafo SHS — Parent Portal Dashboard
// Shows linked children; tapping one shows their summary.
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ClipboardList, BookOpen, Users } from "lucide-react";
import {
  useLinkedChildren,
  useChildOverview,
  type LinkedChild,
} from "@/hooks/useParentPortal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { studentStatusVariant, cn } from "@/lib/utils";

export default function ParentPortalPage() {
  const { data: children, isLoading } = useLinkedChildren();
  const [selectedId, setSelectedId] = useState("");

  const firstChild = children?.[0];
  const activeId   = selectedId || firstChild?.studentId || "";

  const { data: overview } = useChildOverview(activeId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-white rounded-xl border border-slate-200" />
        <div className="h-48 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">
          No linked children found. Contact the school administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((child: LinkedChild) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedId(child.studentId)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                activeId === child.studentId
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-slate-700 border-slate-300 hover:border-teal-400"
              )}
            >
              {child.firstName} {child.lastName}
            </button>
          ))}
        </div>
      )}

      {overview && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold shrink-0">
                {overview.student.firstName[0]}{overview.student.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {overview.student.lastName}, {overview.student.firstName}
                  </h2>
                  <StatusBadge
                    label={overview.student.status}
                    variant={studentStatusVariant(overview.student.status)}
                  />
                </div>
                <p className="text-sm text-slate-500 font-mono mt-0.5">
                  {overview.student.indexNumber}
                  {overview.relation && <span className="text-slate-400 ml-2">({overview.relation})</span>}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {[
                { label: "Class",        value: overview.currentClass     ?? "—" },
                { label: "Programme",    value: overview.currentProgramme ?? "—" },
                { label: "Year",         value: overview.currentYear      ?? "—" },
                { label: "Current Term", value: overview.currentTerm      ?? "—" },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { href: `/parent/report-cards?studentId=${activeId}`, icon: FileText, title: "Report Cards", value: `${overview.publishedReportCards} published`, colour: "teal" },
              { href: `/parent/report-cards?studentId=${activeId}&view=scores`, icon: BookOpen, title: "Scores", value: "View subject scores", colour: "yellow" },
              { href: `/parent/report-cards?studentId=${activeId}&view=attendance`, icon: ClipboardList, title: "Attendance", value: "View attendance record", colour: "slate" },
            ].map((card) => (
              <Link key={card.title} href={card.href}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  card.colour === "teal"   ? "bg-teal-50 text-teal-700 group-hover:bg-teal-100" :
                  card.colour === "yellow" ? "bg-yellow-50 text-yellow-700 group-hover:bg-yellow-100" :
                  "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                )}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{card.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{card.value}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
