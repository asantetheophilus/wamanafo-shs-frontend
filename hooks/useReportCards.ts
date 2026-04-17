import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_BASE, getToken } from "@/lib/api-client";
import type { ReportCardListRow, ReportCardData, ReportCardPrerequisites } from "@/types/report-card";

export const reportCardKeys = {
  all:         ()                                     => ["report-cards"] as const,
  list:        (classId: string, termId: string)      => [...reportCardKeys.all(), "list", classId, termId] as const,
  detail:      (id: string)                           => [...reportCardKeys.all(), "detail", id] as const,
  prereqs:     (classId: string, termId: string)      => [...reportCardKeys.all(), "prereqs", classId, termId] as const,
};

export function useReportCardList(classId: string, termId: string) {
  return useQuery({
    queryKey: reportCardKeys.list(classId, termId),
    queryFn: async () => {
      const res = await api.get<{ items: ReportCardListRow[]; total: number }>(`/api/v1/report-cards?classId=${classId}&termId=${termId}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!termId,
  });
}

export function useReportCardPrerequisites(classId: string, termId: string) {
  return useQuery({
    queryKey: reportCardKeys.prereqs(classId, termId),
    queryFn: async () => {
      const res = await api.get<ReportCardPrerequisites>(`/api/v1/report-cards?classId=${classId}&termId=${termId}&check=1`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!termId,
  });
}

export function useReportCard(id: string) {
  return useQuery({
    queryKey: reportCardKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<ReportCardData>(`/api/v1/report-cards/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

/** Returns direct URL to backend PDF endpoint with auth header embedded via token param */
export function getReportCardPdfUrl(id: string): string {
  const token = getToken();
  return `${API_BASE}/api/v1/report-cards/${id}/pdf?token=${token ?? ""}`;
}

export function useGenerateReportCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { classId: string; termId: string }) => {
      const res = await api.post<{ generated: number; skipped: number; message: string }>("/api/v1/report-cards", payload);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: reportCardKeys.all() }),
  });
}

export function usePublishReportCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { classId: string; termId: string }) => {
      const res = await api.post<{ published: number }>("/api/v1/report-cards?action=publish", payload);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: reportCardKeys.all() }),
  });
}

export function usePublishSingleReportCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const res = publish
        ? await api.post<{ published: boolean }>(`/api/v1/report-cards/${id}/publish`)
        : await api.delete<{ published: boolean }>(`/api/v1/report-cards/${id}/publish`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: reportCardKeys.all() }),
  });
}
