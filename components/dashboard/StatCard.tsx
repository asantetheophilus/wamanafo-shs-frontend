// ============================================================
// Wamanafo SHS — Dashboard Stat Card (Liquid UI)
// ============================================================

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  iconBg?:  string;
  subtext?: string;
  urgent?:  boolean;
  href?:    string;
  trend?:   { value: number; label: string };
}

export function StatCard({
  label, value, icon: Icon,
  iconBg = "bg-teal-100 text-teal-700",
  subtext, urgent, href, trend,
}: StatCardProps) {
  const inner = (
    <div className={cn(
      "card px-5 py-5 flex items-start gap-4 group transition-all",
      urgent ? "border-red-200 bg-red-50/40" : "",
      href   ? "cursor-pointer hover:shadow-md" : "",
    )}>
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
        iconBg
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</p>
        <p className={cn(
          "text-3xl font-bold mt-0.5 font-mono tracking-tight",
          urgent ? "text-red-700" : "text-slate-900"
        )}>
          {value}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {subtext && (
            <p className={cn("text-xs", urgent ? "text-red-600" : "text-slate-400")}>
              {subtext}
            </p>
          )}
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded-md",
              trend.value >= 0
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-700 bg-red-50"
            )}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
