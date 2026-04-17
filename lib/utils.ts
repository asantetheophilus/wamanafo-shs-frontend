// ============================================================
// Wamanafo SHS — Utility Functions
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date (or ISO string) to "15 Apr 2025" */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

/** Capitalise the first letter of a string */
export function capitalise(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Build initials from a name, e.g. "Kwame Asante" → "KA" */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Badge variant for StudentStatus */
export function studentStatusVariant(
  status: string
): "success" | "warning" | "error" | "neutral" {
  switch (status) {
    case "ACTIVE":     return "success";
    case "SUSPENDED":  return "warning";
    case "WITHDRAWN":  return "error";
    case "GRADUATED":  return "neutral";
    default:           return "neutral";
  }
}

/** Badge variant for ScoreStatus */
export function scoreStatusVariant(
  status: string
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "DRAFT":               return "neutral";
    case "SUBMITTED":           return "warning";
    case "APPROVED":            return "success";
    case "AMENDMENT_REQUESTED": return "error";
    default:                    return "neutral";
  }
}

/** Re-export from grading for convenience */
export { formatDisplayScore } from "./grading";
