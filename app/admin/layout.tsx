// ============================================================
// Wamanafo SHS — Admin Route Layout (Client Component)
// Protects /admin/* routes using JWT auth context.
// School name fetched from auth token.
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/shared/AdminLayout";

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout userName={user.name} schoolName={undefined}>
      {children}
    </AdminLayout>
  );
}
