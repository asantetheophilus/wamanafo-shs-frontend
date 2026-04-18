// ============================================================
// Wamanafo SHS — Student Portal Dashboard (Liquid UI)
// ============================================================
"use client";

import Link from "next/link";
import { FileText, BookOpen, ClipboardList, KeyRound, ArrowRight } from "lucide-react";
import { useStudentOverview } from "@/hooks/useStudentPortal";
import { PageHeader } from "@/components/shared/PageHeader";
import { getInitials } from "@/lib/utils";

export default function StudentPortalPage() {
  const { data: overview, isLoading } = useStudentOverview();

  const CARDS = [
    {
      href:  "/student/report-cards",
      icon:  FileText,
      label: "Report Cards",
      desc:  overview ? `${overview.publishedReportCards} published` : "View results",
      bg:    "bg-teal-50 text-teal-700",
    },
    {
      href:  "/student/scores",
      icon:  BookOpen,
      label: "My Scores",
      desc:  "Approved subject scores",
      bg:    "bg-amber-50 text-amber-700",
    },
    {
      href:  "/student/attendance",
      icon:  ClipboardList,
      label: "Attendance",
      desc:  "Term attendance record",
      bg:    "bg-slate-100 text-slate-600",
    },
    {
      href:  "/student/change-password",
      icon:  KeyRound,
      label: "Change Password",
      desc:  "Update your password",
      bg:    "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div>
      <PageHeader
        title={isLoading ? "Welcome" : `Welcome, ${overview?.student.user.firstName ?? ""}`}
        description="Your academic dashboard"
      />

      <div className="page-shell">
        {/* Student identity card */}
        {isLoading ? (
          <div className="skeleton h-32" />
        ) : overview && (
          <div className="rounded-2xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg,#0D5E6E 0%,#0a4a56 60%,#071e25 100%)" }}>
            <div className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: "url('/school-entrance.jpg')" }} />
            <div className="relative z-10 px-7 py-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0 backdrop-blur-sm">
                {getInitials(`${overview.student.user.firstName} ${overview.student.user.lastName}`)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-0.5">Student</p>
                <h2 className="text-white text-xl font-bold leading-tight">
                  {overview.student.user.lastName}, {overview.student.user.firstName}
                </h2>
                <p className="text-white/60 font-mono text-sm mt-0.5">{overview.student.indexNumber}</p>
              </div>
              <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-2 text-right shrink-0">
                {[
                  { label: "Class",   value: overview.currentClass     ?? "—" },
                  { label: "Programme", value: overview.currentProgramme ?? "—" },
                  { label: "Year",    value: overview.currentYear      ?? "—" },
                  { label: "Term",    value: overview.currentTerm      ?? "—" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-white/40 text-xs uppercase tracking-wide">{f.label}</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick navigation cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((card) => (
            <Link key={card.href} href={card.href}
              className="card p-5 flex flex-col gap-3 hover:shadow-md group cursor-pointer">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.bg}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors leading-tight">
                  {card.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors mt-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
