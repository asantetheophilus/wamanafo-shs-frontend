import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ListParams { [key: string]: unknown; programmeId?: string; isCore?: boolean; }

export const subjectKeys = {
  all:    ()           => ["subjects"] as const,
  list:   (p?: object) => [...subjectKeys.all(), "list", p] as const,
  detail: (id: string) => [...subjectKeys.all(), "detail", id] as const,
};

export function useSubjects(params: ListParams = {}) {
  return useQuery({
    queryKey: subjectKeys.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])).toString();
      const res = await api.get<{ items: import("@/types/class").SubjectListRow[]; total: number }>(`/api/v1/subjects${qs ? "?" + qs : ""}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: subjectKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<import("@/types/class").SubjectDTO>(`/api/v1/subjects/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<unknown>("/api/v1/subjects", data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all() }),
  });
}

export function useUpdateSubject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.patch<unknown>(`/api/v1/subjects/${id}`, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectKeys.all() }),
  });
}
