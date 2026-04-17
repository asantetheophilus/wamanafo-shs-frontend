// ============================================================
// Wamanafo SHS — Admin: New Subject Page
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { CreateSubjectForm } from "@/components/forms/SubjectForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewSubjectPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Add New Subject"
        description="Add a core or elective subject to the school catalogue."
        breadcrumbs={[
          { label: "Admin",    href: "/admin/dashboard" },
          { label: "Subjects", href: "/admin/subjects"  },
          { label: "New subject" },
        ]}
      />

      <div className="px-8 py-6 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <CreateSubjectForm onSuccess={(id) => router.push(`/admin/subjects/${id}`)} />
        </div>
      </div>
    </div>
  );
}
