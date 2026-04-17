// ============================================================
// Wamanafo SHS — Student Portal Dashboard
// ============================================================

"use client";

import Link from "next/link";
import { FileText, BookOpen, ClipboardList } from "lucide-react";
import { useStudentOverview } from "@/hooks/useStudentPortal";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

export default function StudentPortalPage() {
  const { data: overview, isLoading } = useStudentOverview();

  return (
    <div>
      <PageHeader
        title={isLoading ? "Welcome" : `Welcome, ${overview?.student.user.firstName ?? ""}`}
        description="Your academic dashboard"
      />

      <div className="px-8 py-6 space-y-6">
        {/* Student info card */}
        {overview && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold shrink-0">
                {overview.student.user.firstName[0]}{overview.student.user.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {overview.student.user.lastName}, {overview.student.user.firstName}
                </h2>
                <p className="text-sm text-slate-500 font-mono">{overview.student.indexNumber}</p>
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
        )}

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          <PortalCard href="/student/report-cards" icon={FileText}
            title="Report Cards"
            description={overview ? `${overview.publishedReportCards} published` : "View results"}
            accent="teal" />
          <PortalCard href="/student/scores" icon={BookOpen}
            title="My Scores" description="Approved subject scores" accent="yellow" />
          <PortalCard href="/student/attendance" icon={ClipboardList}
            title="Attendance" description="Term attendance record" accent="slate" />
        </div>
      </div>
    </div>
  );
}

function PortalCard({ href, icon: Icon, title, description, accent }: {
  href: string; icon: React.ElementType; title: string; description: string;
  accent: "teal" | "yellow" | "slate";
}) {
  const colors = {
    teal:   "bg-teal-50 text-teal-700 group-hover:bg-teal-100",
    yellow: "bg-yellow-50 text-yellow-700 group-hover:bg-yellow-100",
    slate:  "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
  };
  return (
    <Link href={href} className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5
      hover:shadow-md transition-all flex flex-col gap-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", colors[accent])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}
