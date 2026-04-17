import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ListParams { [key: string]: unknown; yearId?: string; programmeId?: string; }

export const classKeys = {
  all:    ()           => ["classes"] as const,
  list:   (p?: object) => [...classKeys.all(), "list", p] as const,
  detail: (id: string) => [...classKeys.all(), "detail", id] as const,
};

export function useClasses(params: ListParams = {}) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])).toString();
      const res = await api.get<{ items: import("@/types/class").ClassListRow[]; total: number }>(`/api/v1/classes${qs ? "?" + qs : ""}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<import("@/types/class").ClassDTO>(`/api/v1/classes/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<unknown>("/api/v1/classes", data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all() }),
  });
}

export function useUpdateClass(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.patch<unknown>(`/api/v1/classes/${id}`, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: classKeys.all() }),
  });
}
