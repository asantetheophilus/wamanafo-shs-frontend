// ============================================================
// Wamanafo SHS — Teacher Dashboard (Client Component)
// ============================================================
"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { ClipboardList, BookOpen, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

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

  const { data: dashData } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: async () => {
      const [amendRes, termRes] = await Promise.all([
        api.get<AmendmentScore[]>("/api/v1/scores/pending?mine=1"),
        api.get<{ items: CurrentTerm[] }>("/api/v1/terms?current=1"),
      ]);
      const currentTerm = (termRes.success && termRes.data.items?.[0]) ? termRes.data.items[0] : null;
      const amendments  = amendRes.success ? amendRes.data : [];
      let assignments: Assignment[] = [];
      if (currentTerm) {
        const asgRes = await api.get<{ items: Assignment[] }>(
          `/api/v1/classes?termId=${currentTerm.id}&pageSize=50`
        );
        if (asgRes.success) assignments = (asgRes.data as { items: Assignment[] } | null)?.items ?? [];
      }
      return { amendments, currentTerm, assignments };
    },
    enabled: !!user,
  });

  const amendments  = dashData?.amendments  ?? [];
  const currentTerm = dashData?.currentTerm ?? null;
  const assignments = dashData?.assignments ?? [];
  const firstName   = (user?.name ?? "").split(" ")[0];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description={currentTerm ? `Current term: ${currentTerm.name}` : "No active term"}
      />
      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { href: "/teacher/attendance", icon: ClipboardList, label: "Mark Attendance",  desc: "Record daily student attendance",   cls: "bg-teal-50 text-teal-700" },
            { href: "/teacher/scores",     icon: BookOpen,       label: "Enter Scores",      desc: assignments.length > 0 ? `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} this term` : "No assignments yet", cls: "bg-yellow-50 text-yellow-700" },
            { href: "/teacher/conduct",    icon: UserCheck,      label: "Conduct Ratings",   desc: "Rate student conduct", cls: "bg-slate-100 text-slate-600" },
          ].map((card) => (
            <Link key={card.href} href={card.href}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-teal-300 transition-all flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${card.cls}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{card.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {amendments.length > 0 ? (
          <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-yellow-200 bg-yellow-50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <h3 className="text-sm font-semibold text-yellow-800">
                {amendments.length} Score{amendments.length !== 1 ? "s" : ""} Returned for Amendment
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {amendments.map((score) => (
                <div key={score.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">
                      {score.student.user.lastName}, {score.student.user.firstName}
                      <span className="ml-2 text-slate-400 font-mono text-xs">{score.student.indexNumber}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{score.subject.name} · {score.term.name}</p>
                    {score.amendmentReason && (
                      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1 mt-2 inline-block">
                        {score.amendmentReason}
                      </p>
                    )}
                  </div>
                  <Link href="/teacher/scores" className="shrink-0 text-xs font-semibold text-teal-700 hover:underline">Correct →</Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-6 flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-sm text-slate-600">No amendment requests pending.</p>
          </div>
        )}

        {assignments.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">My Assignments — {currentTerm?.name}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Class</th>
                  <th className="px-5 py-2.5 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {a.subject.name}
                      <span className="ml-2 text-xs font-mono text-slate-400">{a.subject.code}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{a.class.name}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href="/teacher/scores" className="text-xs font-medium text-teal-700 hover:underline">Enter →</Link>
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
