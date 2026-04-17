import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { TeacherDTO, TeacherListRow } from "@/types/teacher";

export const teacherKeys = {
  all:    ()           => ["teachers"] as const,
  list:   (p?: object) => [...teacherKeys.all(), "list", p] as const,
  detail: (id: string) => [...teacherKeys.all(), "detail", id] as const,
};

interface ListParams { [key: string]: unknown; page?: number; pageSize?: number; search?: string; }

export function useTeachers(params: ListParams = {}) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])).toString();
      const res = await api.get<{ items: TeacherListRow[]; total: number }>(`/api/v1/teachers${qs ? "?" + qs : ""}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<TeacherDTO>(`/api/v1/teachers/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<TeacherDTO>("/api/v1/teachers", data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all() }),
  });
}

export function useUpdateTeacher(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.patch<TeacherDTO>(`/api/v1/teachers/${id}`, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all() }),
  });
}

export function useDeactivateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<unknown>(`/api/v1/teachers/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: teacherKeys.all() }),
  });
}
