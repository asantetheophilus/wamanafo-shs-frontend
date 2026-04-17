import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export const studentPortalKeys = {
  all:         ()          => ["student-portal"] as const,
  overview:    ()          => [...studentPortalKeys.all(), "overview"] as const,
  scores:      (t?: string) => [...studentPortalKeys.all(), "scores", t] as const,
  attendance:  ()          => [...studentPortalKeys.all(), "attendance"] as const,
  reportCards: ()          => [...studentPortalKeys.all(), "report-cards"] as const,
};

export function useStudentOverview() {
  return useQuery({
    queryKey: studentPortalKeys.overview(),
    queryFn: async () => {
      const res = await api.get<{
        student: { id: string; indexNumber: string; user: { firstName: string; lastName: string } };
        currentClass: string | null; currentProgramme: string | null;
        currentYear: string | null; currentTerm: string | null;
        publishedReportCards: number;
      }>("/api/v1/student-portal?view=overview");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useStudentScores(termId?: string) {
  return useQuery({
    queryKey: studentPortalKeys.scores(termId),
    queryFn: async () => {
      const url = termId ? `/api/v1/student-portal?view=scores&termId=${termId}` : "/api/v1/student-portal?view=scores";
      const res = await api.get<unknown[]>(url);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useStudentAttendance() {
  return useQuery({
    queryKey: studentPortalKeys.attendance(),
    queryFn: async () => {
      const res = await api.get<unknown>("/api/v1/student-portal?view=attendance");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useStudentReportCards() {
  return useQuery({
    queryKey: studentPortalKeys.reportCards(),
    queryFn: async () => {
      const res = await api.get<unknown[]>("/api/v1/student-portal?view=report-cards");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}
