// ============================================================
// Wamanafo SHS — Admin: New Teacher Page
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { CreateTeacherForm } from "@/components/forms/TeacherForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewTeacherPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Add New Teacher"
        description="Create a teacher account with staff credentials."
        breadcrumbs={[
          { label: "Admin",    href: "/admin/dashboard" },
          { label: "Teachers", href: "/admin/teachers"  },
          { label: "New teacher" },
        ]}
      />

      <div className="px-8 py-6 max-w-2xl">
        <div className="card p-6">
          <CreateTeacherForm
            onSuccess={(id) => router.push(`/admin/teachers/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
