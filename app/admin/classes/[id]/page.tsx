// ============================================================
// Wamanafo SHS — Admin: Class Detail Page
// ============================================================

"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useClass, classKeys } from "@/hooks/useClasses";
import { EditClassForm } from "@/components/forms/ClassForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiFetch } from "@/lib/api-client";
import type { SelectOption } from "@/types/common";

export default function ClassDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: cls, isLoading, isError } = useClass(id);

  const { data: teachersData } = useQuery({
    queryKey: ["teachers", "options"],
    queryFn: async () => {
      const res = await apiFetch<{ items: Array<{ id: string; firstName: string; lastName: string; staffId: string }> }>("/api/v1/teachers?pageSize=100&isActive=true");
      return res.success ? res.data : { items: [] };
    },
  });

  // Fetch enrolled students for current year
  const { data: rosterData } = useQuery({
    queryKey: ["class-roster", id, cls?.year.id],
    queryFn: async () => {
      if (!cls?.year.id) return { data: [] };
      const res = await apiFetch<Array<{ student: { id: string; indexNumber: string; status: string; user: { firstName: string; lastName: string } } }>>(`/api/v1/classes/${id}?resource=students&yearId=${cls.year.id}`);
      return res.success ? { data: res.data } : { data: [] };
    },
    enabled: !!cls?.year.id,
  });

  const teacherOptions: SelectOption[] = (teachersData?.items ?? []).map((t) => ({
    value: t.id,
    label: `${t.lastName}, ${t.firstName} (${t.staffId})`,
  }));

  function handleUpdateSuccess() {
    void queryClient.invalidateQueries({ queryKey: classKeys.detail(id) });
  }

  if (isLoading) {
    return <div className="animate-pulse px-8 py-6 space-y-4">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 h-64 card-flat" />
        <div className="col-span-2 h-64 card-flat" />
      </div>
    </div>;
  }

  if (isError || !cls) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-slate-500">Class not found.</p>
        <Link href="/admin/classes" className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to classes
        </Link>
      </div>
    );
  }

  const enrollments = rosterData?.data ?? [];

  return (
    <div>
      <PageHeader
        title={cls.name}
        description={`${cls.programme.name} · ${cls.year.name}`}
        breadcrumbs={[
          { label: "Admin",   href: "/admin/dashboard" },
          { label: "Classes", href: "/admin/classes"   },
          { label: cls.name },
        ]}
      />

      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        {/* Info + edit card */}
        <div className="col-span-2 space-y-6">
          {/* Edit form */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Class Settings</h3>
            <EditClassForm cls={cls} teacherOptions={teacherOptions} onSuccess={handleUpdateSuccess} />
          </div>

          {/* Student roster */}
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Enrolled Students
                <span className="ml-2 text-xs font-normal text-slate-400 font-mono">
                  ({cls.studentCount})
                </span>
              </h3>
              <Link href={`/admin/students?classId=${cls.id}&yearId=${cls.year.id}`}
                className="text-xs text-teal-700 hover:underline">
                Manage enrolments →
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No students enrolled yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Index No.</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map(({ student }) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">
                        <Link href={`/admin/students/${student.id}`} className="hover:text-teal-700">
                          {student.user.lastName}, {student.user.firstName}
                        </Link>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-600">{student.indexNumber}</td>
                      <td className="px-4 py-2">
                        <StatusBadge
                          label={student.status}
                          variant={student.status === "ACTIVE" ? "success" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="col-span-1 space-y-4">
          <div className="card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</h4>
            <div className="space-y-0 divide-y divide-slate-100 text-sm">
              <InfoRow label="Year"        value={cls.year.name} />
              <InfoRow label="Programme"   value={`${cls.programme.name} (${cls.programme.code})`} />
              <InfoRow label="Form Master" value={
                cls.formMaster
                  ? `${cls.formMaster.user.firstName} ${cls.formMaster.user.lastName}`
                  : "Not assigned"
              } />
              <InfoRow label="Students" value={String(cls.studentCount)} />
            </div>
          </div>

          {/* Subjects in programme */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Programme Subjects
              </h4>
              <Link href="/admin/subjects" className="text-xs text-teal-700 hover:underline">
                Manage →
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Subject assignments are managed at the programme level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800 truncate max-w-[55%]">{value}</span>
    </div>
  );
}
