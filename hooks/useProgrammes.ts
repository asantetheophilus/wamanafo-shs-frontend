import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export const programmeKeys = {
  all:    ()           => ["programmes"] as const,
  list:   ()           => [...programmeKeys.all(), "list"] as const,
  detail: (id: string) => [...programmeKeys.all(), "detail", id] as const,
};

export function useProgrammes() {
  return useQuery({
    queryKey: programmeKeys.list(),
    queryFn: async () => {
      const res = await api.get<{ items: unknown[] }>("/api/v1/programmes");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useProgramme(id: string) {
  return useQuery({
    queryKey: programmeKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<unknown>(`/api/v1/programmes/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}
