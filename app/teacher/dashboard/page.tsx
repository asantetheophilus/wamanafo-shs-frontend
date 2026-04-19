// ============================================================
// Wamanafo SHS — Teacher Dashboard (stable production-safe version)
// ============================================================
"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ClipboardList, BookOpen, UserCheck, Download, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const firstName = (user?.name ?? "").split(" ")[0] || "Teacher";

  const { data: termLabel } = useQuery({
    queryKey: ["teacher-dashboard-term"],
    queryFn: async () => {
      const res = await api.get<{ items: Array<{ id: string; name: string; isCurrent?: boolean }> }>("/api/v1/terms");
      if (!res.success) return "No active term";
      const items = res.data.items ?? [];
      const current = items.find((t) => t.isCurrent) ?? items[0];
      return current ? `Current term: ${current.name}` : "No active term";
    },
    enabled: !!user,
  });

  const cards = [
    { href: "/teacher/attendance", icon: ClipboardList, label: "Mark Attendance", desc: "Record daily attendance", bg: "bg-teal-50 text-teal-700" },
    { href: "/teacher/scores", icon: BookOpen, label: "Enter Scores", desc: "Capture and submit scores", bg: "bg-amber-50 text-amber-700" },
    { href: "/teacher/conduct", icon: UserCheck, label: "Conduct Ratings", desc: "Rate student conduct", bg: "bg-slate-100 text-slate-600" },
    { href: "/teacher/export", icon: Download, label: "Export Data", desc: "Download attendance and scores", bg: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div>
      <PageHeader title={`Welcome, ${firstName}`} description={termLabel ?? "Your teaching dashboard"} />
      <div className="page-shell">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="card p-5 flex flex-col gap-3 hover:shadow-md group cursor-pointer">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors leading-tight">{card.label}</p>
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
