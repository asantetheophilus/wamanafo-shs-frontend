// ============================================================
// Wamanafo SHS — Parent Portal Dashboard (Liquid UI)
// ============================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ClipboardList, BookOpen, Users, ArrowRight } from "lucide-react";
import {
  useLinkedChildren, useChildOverview, type LinkedChild,
} from "@/hooks/useParentPortal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { studentStatusVariant, getInitials } from "@/lib/utils";

export default function ParentPortalPage() {
  const { data: children, isLoading } = useLinkedChildren();
  const [selectedId, setSelectedId]   = useState("");

  const firstChild = children?.[0];
  const activeId   = selectedId || firstChild?.studentId || "";
  const { data: overview } = useChildOverview(activeId);
  const reportCardsHref = activeId
    ? `/parent/report-cards?studentId=${encodeURIComponent(activeId)}`
    : "/parent/report-cards";

  if (isLoading) return (
    <div className="page-shell">
      <div className="skeleton h-24 mb-4" />
      <div className="skeleton h-64" />
    </div>
  );

  if (!children || children.length === 0) return (
    <div className="page-shell">
      <div className="card py-20 text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="font-bold text-slate-700">No children linked to your account</p>
        <p className="text-sm text-slate-400 mt-1">Please contact the school administrator.</p>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      {/* Header banner */}
      <div className="rounded-2xl overflow-hidden relative h-28 flex items-end"
        style={{ background: "linear-gradient(135deg,#0D5E6E 0%,#0a4a56 60%,#071e25 100%)" }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/school-entrance.jpg')" }} />
        <div className="relative z-10 px-7 pb-5">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-0.5">Parent Portal</p>
          <h1 className="text-white text-xl font-bold" style={{ fontFamily: "Georgia,serif" }}>
            Wamanafo Senior High Technical School
          </h1>
        </div>
      </div>

      {/* Child selector tabs */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((child: LinkedChild) => {
            const name = `${child.firstName} ${child.lastName}`;
            return (
              <button
                key={child.studentId}
                onClick={() => setSelectedId(child.studentId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeId === child.studentId
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {getInitials(name)}
                </div>
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected child overview */}
      {overview && (
        <div className="card p-0 overflow-hidden">
          {/* Identity header */}
          <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-lg font-bold text-teal-700 shrink-0">
              {getInitials(`${overview.student?.firstName ?? ""} ${overview.student?.lastName ?? ""}`)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 text-lg leading-tight">
                {overview.student?.lastName}, {overview.student?.firstName}
              </h2>
              <p className="font-mono text-sm text-slate-400 mt-0.5">{overview.student?.indexNumber}</p>
            </div>
            <StatusBadge
              label={overview.student?.status ?? "ACTIVE"}
              variant={studentStatusVariant(overview.student?.status ?? "ACTIVE")}
            />
          </div>

          {/* Info grid */}
          <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 border-b border-slate-100 bg-slate-50/50">
            {[
              { label: "Class",      value: overview.currentClass     ?? "—" },
              { label: "Programme",  value: overview.currentProgramme ?? "—" },
              { label: "Year",       value: overview.currentYear      ?? "—" },
              { label: "Term",       value: overview.currentTerm      ?? "—" },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">{f.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Quick nav links */}
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href:  reportCardsHref,
                icon:  FileText,
                label: "Report Cards",
                desc:  `${overview.publishedReportCards ?? 0} published this year`,
                bg:    "bg-teal-50 text-teal-700",
              },
              {
                href:  reportCardsHref,
                icon:  BookOpen,
                label: "Academic Scores",
                desc:  "View term subject scores",
                bg:    "bg-amber-50 text-amber-700",
              },
              {
                href:  reportCardsHref,
                icon:  ClipboardList,
                label: "Attendance",
                desc:  "View attendance summary",
                bg:    "bg-slate-100 text-slate-600",
              },
            ].map((card) => (
              <Link key={card.label} href={card.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100
                  hover:border-teal-200 hover:bg-teal-50/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                    {card.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
