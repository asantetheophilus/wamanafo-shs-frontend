// ============================================================
// Wamanafo SHS — Dashboard Stat Card
// ============================================================

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  iconBg?:  string;
  subtext?: string;
  urgent?:  boolean;
  href?:    string;
}

export function StatCard({
  label, value, icon: Icon, iconBg = "bg-teal-100 text-teal-700",
  subtext, urgent,
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl border p-5 flex items-start gap-4 shadow-sm",
      urgent ? "border-red-200 bg-red-50/30" : "border-slate-200"
    )}>
      <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className={cn(
          "text-2xl font-bold mt-0.5",
          urgent ? "text-red-700" : "text-slate-900"
        )}>
          {value}
        </p>
        {subtext && (
          <p className={cn("text-xs mt-1", urgent ? "text-red-600" : "text-slate-400")}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
