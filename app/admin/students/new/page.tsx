// ============================================================
// Wamanafo SHS — Admin: New Student Page
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { CreateStudentForm } from "@/components/forms/StudentForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";

/** Fetch classes and years for enrolment dropdowns */
function useEnrolmentOptions() {
  const classes = useQuery({
    queryKey: ["classes", "options"],
    queryFn: async () => {
      const res = await fetch("/api/v1/classes?pageSize=100");
      if (!res.ok) return { items: [] };
      const json = await res.json();
      return json.data;
    },
  });

  const years = useQuery({
    queryKey: ["academic-years", "options"],
    queryFn: async () => {
      const res = await fetch("/api/v1/academic-years?pageSize=20");
      if (!res.ok) return { items: [] };
      const json = await res.json();
      return json.data;
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
