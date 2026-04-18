// ============================================================
// Wamanafo SHS — Admin Route Layout (with school logo fetch)
// ============================================================
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/shared/AdminLayout";
import { api } from "@/lib/api-client";

interface SchoolInfo {
  name:    string;
  logoUrl: string | null;
}

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/login");
  }, [user, loading, router]);

  const { data: school } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res = await api.get<SchoolInfo>("/api/v1/school-settings");
      if (!res.success) return null;
      return res.data as SchoolInfo;
    },
    enabled: !!user && user.role === "ADMIN",
    staleTime: 5 * 60_000,
  });

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout
      userName={user.name}
      schoolName={school?.name}
      schoolLogo={school?.logoUrl ?? undefined}
    >
      {children}
    </AdminLayout>
  );
}
