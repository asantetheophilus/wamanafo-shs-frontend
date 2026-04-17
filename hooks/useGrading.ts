import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ClassResultRow, SubjectRankingRow, StudentTermResult } from "@/types/report";

export const gradingKeys = {
  all:          ()                                     => ["grading"] as const,
  classSummary: (classId: string, termId: string)      => [...gradingKeys.all(), "class-summary", classId, termId] as const,
  subjectRank:  (classId: string, subjectId: string, termId: string) => [...gradingKeys.all(), "subject-rank", classId, subjectId, termId] as const,
  fullResults:  (classId: string, termId: string)      => [...gradingKeys.all(), "full", classId, termId] as const,
};

export function useClassResultsSummary(classId: string, termId: string) {
  return useQuery({
    queryKey: gradingKeys.classSummary(classId, termId),
    queryFn: async () => {
      const res = await api.get<ClassResultRow[]>(`/api/v1/rankings?classId=${classId}&termId=${termId}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!termId,
  });
}

export function useSubjectRanking(classId: string, subjectId: string, termId: string) {
  return useQuery({
    queryKey: gradingKeys.subjectRank(classId, subjectId, termId),
    queryFn: async () => {
      const res = await api.get<SubjectRankingRow[]>(`/api/v1/rankings?classId=${classId}&subjectId=${subjectId}&termId=${termId}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!subjectId && !!termId,
  });
}

export function useFullClassResults(classId: string, termId: string) {
  return useQuery({
    queryKey: gradingKeys.fullResults(classId, termId),
    queryFn: async () => {
      const res = await api.get<StudentTermResult[]>(`/api/v1/aggregates?classId=${classId}&termId=${termId}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!termId,
  });
}

export function useRecomputeResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { classId: string; termId: string }) => {
      const res = await api.post<{ recomputed: number }>(`/api/v1/aggregates?classId=${payload.classId}&termId=${payload.termId}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: gradingKeys.all() }),
  });
}
