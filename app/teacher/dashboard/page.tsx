// ============================================================
// Wamanafo SHS — Teacher Dashboard (Liquid UI)
// ============================================================
"use client";

import { useAuth }      from "@/lib/auth-context";
import { useQuery }     from "@tanstack/react-query";
import { api }          from "@/lib/api-client";
import Link             from "next/link";
import {
  ClipboardList, BookOpen, AlertTriangle, CheckCircle2,
  UserCheck, Download, ArrowRight, GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { getInitials } from "@/lib/utils";

type AmendmentScore = {
  id: string; amendmentReason: string | null;
  subject: { name: string; code: string };
  student: { indexNumber: string; user: { firstName: string; lastName: string } };
  term: { name: string };
};
type Assignment = { id: string; subject: { name: string; code: string }; class: { name: string } };
type CurrentTerm = { id: string; name: string } | null;

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  const { data: dashData, isLoading } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const [amendRes, termRes] = await Promise.all([
        api.get<AmendmentScore[]>("/api/v1/scores/pending?mine=1"),
        api.get<{ items: CurrentTerm[] }>("/api/v1/terms?current=1"),
      ]);
      const currentTerm = (termRes.success && (termRes.data as unknown as {items:CurrentTerm[]})?.items?.[0])
        ? (termRes.data as unknown as {items:CurrentTerm[]}).items[0]
        : null;
      const amendments = amendRes.success ? (amendRes.data as unknown as AmendmentScore[]) : [];
      let assignments: Assignment[] = [];
      if (currentTerm) {
        const asgRes = await api.get<{ items: Assignment[] }>(
          `/api/v1/classes?termId=${currentTerm.id}&pageSize=50`
        );
        if (asgRes.success)
          assignments = (asgRes.data as unknown as { items: Assignment[] })?.items ?? [];
      }
      return { amendments, currentTerm, assignments };
    },
    enabled: !!user,
  });

  const amendments  = dashData?.amendments  ?? [];
  const currentTerm = dashData?.currentTerm ?? null;
  const assignments = dashData?.assignments ?? [];
  const firstName   = (user?.name ?? "").split(" ")[0];

  const QUICK = [
    { href: "/teacher/attendance", icon: ClipboardList, label: "Mark Attendance",  desc: "Record daily attendance",              bg: "bg-teal-50 text-teal-700"    },
    { href: "/teacher/scores",     icon: BookOpen,      label: "Enter Scores",      desc: assignments.length > 0 ? `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} this term` : "No assignments yet",
                                                                                                                                  bg: "bg-amber-50 text-amber-700"  },
    { href: "/teacher/conduct",    icon: UserCheck,     label: "Conduct Ratings",   desc: "Rate student conduct",                 bg: "bg-slate-100 text-slate-600"  },
    { href: "/teacher/export",     icon: Download,      label: "Export Data",       desc: "Download attendance & scores",         bg: "bg-emerald-50 text-emerald-700"},
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description={currentTerm ? `Current term: ${currentTerm.name}` : "No active term"}
      />

      <div className="page-shell">
        {/* Quick action cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK.map((card) => (
            <Link key={card.href} href={card.href}
              className="card p-5 flex flex-col gap-3 hover:shadow-md group cursor-pointer">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
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

        {/* Amendment alerts */}
        {isLoading ? (
          <div className="skeleton h-24" />
        ) : amendments.length > 0 ? (
          <div className="card-flat border-amber-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-amber-200 bg-amber-50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">
                {amendments.length} Score{amendments.length !== 1 ? "s" : ""} Returned for Amendment
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {amendments.map((score) => (
                <div key={score.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0 mt-0.5">
                      {getInitials(`${score.student.user.firstName} ${score.student.user.lastName}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        {score.student.user.lastName}, {score.student.user.firstName}
                        <span className="ml-2 text-slate-400 font-mono text-xs">{score.student.indexNumber}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{score.subject.name} · {score.term.name}</p>
                      {score.amendmentReason && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-2 inline-block">
                          {score.amendmentReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href="/teacher/scores"
                    className="text-xs font-bold text-teal-700 hover:underline shrink-0">
                    Correct →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-flat px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-600">No amendment requests pending.</p>
          </div>
        )}

        {/* Assignments table */}
        {assignments.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">My Assignments</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentTerm?.name}</p>
              </div>
              <span className="badge badge-active">{assignments.length} subjects</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Class</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="font-semibold text-slate-800">{a.subject.name}</td>
                    <td><span className="font-mono text-xs text-slate-500">{a.subject.code}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {a.class.name}
                      </div>
                    </td>
                    <td>
                      <Link href="/teacher/scores"
                        className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline transition-colors">
                        Enter scores →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
