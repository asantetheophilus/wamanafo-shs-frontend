// ============================================================
// Wamanafo SHS — Status Badge
// ============================================================

import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "error" | "neutral" | "info";

const VARIANT_CLASSES: Record<Variant, string> = {
  success: "bg-green-50 text-green-700 ring-green-200",
  warning: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  error:   "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  info:    "bg-blue-50 text-blue-700 ring-blue-200",
};

interface StatusBadgeProps {
  label: string;
  variant: Variant;
  className?: string;
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

/** Map StudentStatus enum value to a human label */
export function studentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE:     "Active",
    WITHDRAWN:  "Withdrawn",
    GRADUATED:  "Graduated",
    SUSPENDED:  "Suspended",
  };
  return map[status] ?? status;
}

/** Map ScoreStatus enum value to a human label */
export function scoreStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT:               "Draft",
    SUBMITTED:           "Submitted",
    APPROVED:            "Approved",
    AMENDMENT_REQUESTED: "Amendment Requested",
  };
  return map[status] ?? status;
}
