// ============================================================
// Wamanafo SHS — Admin: Teacher Detail / Edit Page
// ============================================================

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTeacher, useDeactivateTeacher, teacherKeys } from "@/hooks/useTeachers";
import { EditTeacherForm } from "@/components/forms/TeacherForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getInitials, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TeacherDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const { data: teacher, isLoading, isError } = useTeacher(id);
  const deactivate = useDeactivateTeacher();

  function handleUpdateSuccess() {
    void queryClient.invalidateQueries({ queryKey: teacherKeys.detail(id) });
  }

  async function handleDeactivate() {
    await deactivate.mutateAsync(id);
    setShowDeactivateConfirm(false);
    void queryClient.invalidateQueries({ queryKey: teacherKeys.detail(id) });
  }

  if (isLoading) return <TeacherDetailSkeleton />;

  if (isError || !teacher) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-slate-500">Teacher not found or failed to load.</p>
        <Link href="/admin/teachers" className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to teachers
        </Link>
      </div>
    );
  }

  const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;

  return (
    <div>
      <PageHeader
        title={fullName}
        description={`Staff ID: ${teacher.staffId}`}
        breadcrumbs={[
          { label: "Admin",    href: "/admin/dashboard" },
          { label: "Teachers", href: "/admin/teachers"  },
          { label: fullName },
        ]}
        action={
          <StatusBadge
            label={teacher.user.isActive ? "Active" : "Inactive"}
            variant={teacher.user.isActive ? "success" : "neutral"}
          />
        }
      />

      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="col-span-1 space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {getInitials(fullName)}
            </div>
            <h2 className="text-base font-semibold text-slate-800">{fullName}</h2>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{teacher.staffId}</p>

            <div className="mt-4 space-y-2 text-sm text-left divide-y divide-slate-100">
              <InfoRow label="Email"         value={teacher.user.email} mono />
              <InfoRow label="Assignments"   value={String(teacher.assignmentCount)} />
              <InfoRow label="Form classes"  value={teacher.formMasterClasses.map(c => c.name).join(", ") || "—"} />
              <InfoRow label="Member since"  value={formatDate(teacher.createdAt)} />
            </div>
          </div>

          {/* Deactivate section */}
          {teacher.user.isActive && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
              <h4 className="text-sm font-semibold text-red-700 mb-1">Deactivate account</h4>
              <p className="text-xs text-slate-500 mb-3">
                The teacher will no longer be able to sign in. Historical data is preserved.
              </p>
              {!showDeactivateConfirm ? (
                <button
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-300
                    rounded-lg hover:bg-red-50 transition-colors"
                >
                  Deactivate teacher
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    Are you sure? This will immediately revoke access.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeactivateConfirm(false)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-slate-600
                        border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivate}
                      disabled={deactivate.isPending}
                      className={cn(
                        "flex-1 px-3 py-2 text-xs font-semibold text-white",
                        "bg-red-600 hover:bg-red-700 rounded-lg transition-colors",
                        "disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                    >
                      {deactivate.isPending ? "Deactivating…" : "Confirm"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="col-span-2">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-5">Edit Profile</h3>
            <EditTeacherForm teacher={teacher} onSuccess={handleUpdateSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-slate-800 text-xs font-medium truncate max-w-[60%] ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function TeacherDetailSkeleton() {
  return (
    <div className="animate-pulse px-8 py-6 grid grid-cols-3 gap-6">
      <div className="col-span-1 bg-white rounded-xl h-80 border border-slate-200" />
      <div className="col-span-2 bg-white rounded-xl h-80 border border-slate-200" />
    </div>
  );
}
