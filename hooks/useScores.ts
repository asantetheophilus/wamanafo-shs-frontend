import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export const scoreKeys = {
  all:     () => ["scores"] as const,
  grid:    (classId: string, subjectId: string, termId: string) => [...scoreKeys.all(), "grid", classId, subjectId, termId] as const,
  pending: (p?: object) => [...scoreKeys.all(), "pending", p] as const,
  audit:   (id: string) => [...scoreKeys.all(), "audit", id] as const,
};

export function useScoreGrid(classId: string, subjectId: string, termId: string) {
  return useQuery({
    queryKey: scoreKeys.grid(classId, subjectId, termId),
    queryFn: async () => {
      const res = await api.get<import("@/types/score").ScoreGridRow[]>(`/api/v1/scores?classId=${classId}&subjectId=${subjectId}&termId=${termId}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!subjectId && !!termId,
  });
}

export function useScoresPendingApproval(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: scoreKeys.pending(params),
    queryFn: async () => {
      const qs = new URLSearchParams(params).toString();
      // Backend returns ScoreApprovalRow[] directly (not wrapped in {items, total})
      const res = await api.get<import("@/types/score").ScoreApprovalRow[]>(`/api/v1/scores/pending${qs ? "?" + qs : ""}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useUpsertScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<unknown>("/api/v1/scores", data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: scoreKeys.all() }),
  });
}

export function useSubmitScores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { subjectId: string; classId: string; termId: string } | string) => {
      const url = typeof params === "string"
        ? `/api/v1/scores/${params}/submit`
        : `/api/v1/scores/batch/submit?subjectId=${params.subjectId}&classId=${params.classId}&termId=${params.termId}`;
      const res = await api.post<unknown>(url);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: scoreKeys.all() }),
  });
}

export function useApproveScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scoreId: string) => {
      const res = await api.post<unknown>(`/api/v1/scores/${scoreId}/approve`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: scoreKeys.all() }),
  });
}

export function useRequestAmendment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scoreId, reason }: { scoreId: string; reason: string }) => {
      const res = await api.post<unknown>(`/api/v1/scores/${scoreId}/amend`, { reason });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: scoreKeys.all() }),
  });
}

// Alias
export const useBulkSaveScores = useUpsertScore;
