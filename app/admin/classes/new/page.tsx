// ============================================================
// Wamanafo SHS — Admin: New Class Page
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreateClassForm } from "@/components/forms/ClassForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiFetch } from "@/lib/api-client";
import type { SelectOption } from "@/types/common";

export default function NewClassPage() {
  const router = useRouter();

  const { data: yearsData } = useQuery({
    queryKey: ["academic-years", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string; isCurrent: boolean }> }>("/api/v1/academic-years");
      return res.success ? res.data : { items: [] };
    },
  });

  const { data: programmesData } = useQuery({
    queryKey: ["programmes", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/v1/programmes");
      return res.success ? res.data : { items: [] };
    },
  });

  const { data: teachersData } = useQuery({
    queryKey: ["teachers", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; firstName: string; lastName: string; staffId: string }> }>("/api/v1/teachers?pageSize=100&isActive=true");
      return res.success ? res.data : { items: [] };
    },
  });

  const yearOptions: SelectOption[] = (yearsData?.items ?? []).map((y) => ({
    value: y.id,
    label: `${y.name}${y.isCurrent ? " (current)" : ""}`,
  }));

  const programmeOptions: SelectOption[] = (programmesData?.items ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const teacherOptions: SelectOption[] = (teachersData?.items ?? []).map((t) => ({
    value: t.id,
    label: `${t.lastName}, ${t.firstName} (${t.staffId})`,
  }));

  return (
    <div>
      <PageHeader
        title="Add New Class"
        description="Create a class group for the selected academic year and programme."
        breadcrumbs={[
          { label: "Admin",   href: "/admin/dashboard" },
          { label: "Classes", href: "/admin/classes"   },
          { label: "New class" },
        ]}
      />

      <div className="px-8 py-6 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <CreateClassForm
            yearOptions={yearOptions}
            programmeOptions={programmeOptions}
            teacherOptions={teacherOptions}
            onSuccess={(id) => router.push(`/admin/classes/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
