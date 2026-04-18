// ============================================================
// Wamanafo SHS — Admin: New Student Page
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { CreateStudentForm } from "@/components/forms/StudentForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

/** Fetch classes and years for enrolment dropdowns */
function useEnrolmentOptions() {
  const classes = useQuery({
    queryKey: ["classes", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/v1/classes?pageSize=100");
      return res.success ? res.data : { items: [] };
    },
  });

  const years = useQuery({
    queryKey: ["academic-years", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/v1/academic-years?pageSize=20");
      return res.success ? res.data : { items: [] };
    },
  });

  return { classes, years };
}

export default function NewStudentPage() {
  const router = useRouter();
  const { classes, years } = useEnrolmentOptions();

  const classOptions =
    (classes.data?.items ?? []).map((c: { id: string; name: string }) => ({
      value: c.id,
      label: c.name,
    }));

  const yearOptions =
    (years.data?.items ?? []).map((y: { id: string; name: string }) => ({
      value: y.id,
      label: y.name,
    }));

  return (
    <div>
      <PageHeader
        title="Add New Student"
        description="Create a student account and optionally enrol them in a class."
        breadcrumbs={[
          { label: "Admin",    href: "/admin/dashboard" },
          { label: "Students", href: "/admin/students"  },
          { label: "New student" },
        ]}
      />

      <div className="px-8 py-6 max-w-2xl">
        <div className="card p-6">
          <CreateStudentForm
            classOptions={classOptions}
            yearOptions={yearOptions}
            onSuccess={(id) => router.push(`/admin/students/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
