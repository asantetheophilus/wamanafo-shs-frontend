import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { StudentDTO, StudentListRow } from "@/types/student";

export const studentKeys = {
  all:    ()           => ["students"] as const,
  list:   (p?: object) => [...studentKeys.all(), "list", p] as const,
  detail: (id: string) => [...studentKeys.all(), "detail", id] as const,
};

interface ListParams { [key: string]: unknown; page?: number; pageSize?: number; search?: string; status?: string; }

export function useStudents(params: ListParams = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])).toString();
      const res = await api.get<{ items: StudentListRow[]; total: number }>(`/api/v1/students${qs ? "?" + qs : ""}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<StudentDTO>(`/api/v1/students/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<StudentDTO>("/api/v1/students", data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all() }),
  });
}

export function useUpdateStudent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.patch<StudentDTO>(`/api/v1/students/${id}`, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.all() }),
  });
}
