import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export const attendanceKeys = {
  all:  () => ["attendance"] as const,
  grid: (classId: string, termId: string, date: string) => [...attendanceKeys.all(), "grid", classId, termId, date] as const,
  summary: (classId: string, termId: string) => [...attendanceKeys.all(), "summary", classId, termId] as const,
};

export function useAttendanceGrid(classId: string, termId: string, date: string) {
  return useQuery({
    queryKey: attendanceKeys.grid(classId, termId, date),
    queryFn: async () => {
      const res = await api.get<import("@/types/attendance").AttendanceGridRow[]>(`/api/v1/attendance?classId=${classId}&termId=${termId}&date=${date}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!termId && !!date,
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await api.post<{ saved: number; warnings: string[] }>("/api/v1/attendance", data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: attendanceKeys.all() }),
  });
}

// Alias for backward compatibility
export const useBulkMarkAttendance = useMarkAttendance;

// Attendance summary hook
export function useAttendanceSummary(classId: string, termId: string) {
  return useQuery({
    queryKey: [...attendanceKeys.summary(classId, termId)],
    queryFn: async () => {
      const res = await api.get<import("@/types/attendance").AttendanceSummaryRow[]>(
        `/api/v1/attendance/summary?classId=${classId}&termId=${termId}`
      );
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!classId && !!termId,
  });
}
