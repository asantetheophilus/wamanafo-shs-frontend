import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export const parentPortalKeys = {
  all:         ()              => ["parent-portal"] as const,
  children:    ()              => [...parentPortalKeys.all(), "children"] as const,
  overview:    (sid: string)   => [...parentPortalKeys.all(), "overview", sid] as const,
  reportCards: (sid: string)   => [...parentPortalKeys.all(), "report-cards", sid] as const,
  attendance:  (sid: string)   => [...parentPortalKeys.all(), "attendance", sid] as const,
  scores:      (sid: string)   => [...parentPortalKeys.all(), "scores", sid] as const,
};

export interface LinkedChild { studentId: string; firstName: string; lastName: string; indexNumber: string; status: string; relation: string; className: string | null; yearName: string | null; }
export interface ChildOverview { student: { id: string; firstName: string; lastName: string; indexNumber: string; status: string }; relation: string; currentClass: string | null; currentProgramme: string | null; currentYear: string | null; currentTerm: string | null; publishedReportCards: number; }
export interface ParentReportCardRow { id: string; termName: string; yearName: string; classPosition: number | null; overallAverage: number | null; aggregate: number | null; publishedAt: string | null; }
export interface ParentAttendanceRow { termName: string; termNumber: number; presentCount: number; lateCount: number; absentCount: number; attendancePercentage: number | null; daysAbsent: number; }
export interface ParentScoreRow { subjectName: string; subjectCode: string; isCore: boolean; termName: string; yearName: string; totalScore: number | null; grade: string | null; gradePoint: number | null; remark: string | null; }

async function fetchParent(view: string, studentId?: string) {
  const url = studentId ? `/api/v1/parent-portal?view=${view}&studentId=${studentId}` : `/api/v1/parent-portal?view=${view}`;
  const res = await api.get<unknown>(url);
  if (!res.success) throw new Error(res.error);
  return res.data;
}

export function useLinkedChildren() {
  return useQuery({ queryKey: parentPortalKeys.children(), queryFn: () => fetchParent("children") as Promise<LinkedChild[]> });
}
export function useChildOverview(studentId: string) {
  return useQuery({ queryKey: parentPortalKeys.overview(studentId), queryFn: () => fetchParent("overview", studentId) as Promise<ChildOverview>, enabled: !!studentId });
}
export function useChildReportCards(studentId: string) {
  return useQuery({ queryKey: parentPortalKeys.reportCards(studentId), queryFn: () => fetchParent("report-cards", studentId) as Promise<ParentReportCardRow[]>, enabled: !!studentId });
}
export function useChildAttendance(studentId: string) {
  return useQuery({ queryKey: parentPortalKeys.attendance(studentId), queryFn: () => fetchParent("attendance", studentId) as Promise<ParentAttendanceRow[]>, enabled: !!studentId });
}
export function useChildScores(studentId: string) {
  return useQuery({ queryKey: parentPortalKeys.scores(studentId), queryFn: () => fetchParent("scores", studentId) as Promise<ParentScoreRow[]>, enabled: !!studentId });
}
