// ============================================================
// Wamanafo SHS — Admin: Student Detail / Edit Page
// ============================================================

"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft} from "lucide-react";
import Link from "next/link";
import { useStudent, studentKeys } from "@/hooks/useStudents";
import { EditStudentForm } from "@/components/forms/StudentForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, studentStatusLabel } from "@/components/shared/StatusBadge";
import { studentStatusVariant, formatDate, getInitials } from "@/lib/utils";

export default function StudentDetailPage() {
  const { id }           = useParams<{ id: string }>();
  const queryClient      = useQueryClient();
  const { data: student, isLoading, isError } = useStudent(id);

  function handleUpdateSuccess() {
    void queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
  }

  if (isLoading) return <StudentDetailSkeleton />;

  if (isError || !student) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-slate-500">Student not found or failed to load.</p>
        <Link href="/admin/students" className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
      </div>
    );
  }

  const fullName = `${student.user.firstName} ${student.user.lastName}`;

  return (
    <div>
      <PageHeader
        title={fullName}
        description={`Index: ${student.indexNumber}`}
        breadcrumbs={[
          { label: "Admin",    href: "/admin/dashboard" },
          { label: "Students", href: "/admin/students"  },
          { label: fullName },
        ]}
        action={
          <StatusBadge
            label={studentStatusLabel(student.status)}
            variant={studentStatusVariant(student.status)}
          />
        }
      />

      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        {/* Left: profile card */}
        <div className="col-span-1">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {getInitials(fullName)}
            </div>
            <h2 className="text-base font-semibold text-slate-800">{fullName}</h2>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{student.indexNumber}</p>

            <div className="mt-4 space-y-2 text-sm text-left divide-y divide-slate-100">
              <InfoRow label="Email"    value={student.user.email} mono />
              <InfoRow label="DOB"      value={formatDate(student.dateOfBirth)} />
              <InfoRow label="Gender"   value={student.gender ?? "—"} />
              <InfoRow label="Class"    value={student.currentEnrollment?.class.name ?? "—"} />
              <InfoRow label="Programme" value={student.currentEnrollment?.class.programme.name ?? "—"} />
              <InfoRow label="Year"     value={student.currentEnrollment?.year.name ?? "—"} />
            </div>
          </div>
        </div>

        {/* Right: edit form */}
        <div className="col-span-2">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-5">Edit Profile</h3>
            <EditStudentForm student={student} onSuccess={handleUpdateSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

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

function StudentDetailSkeleton() {
  return (
    <div className="animate-pulse px-8 py-6 grid grid-cols-3 gap-6">
      <div className="col-span-1 bg-white rounded-xl h-80 border border-slate-200" />
      <div className="col-span-2 bg-white rounded-xl h-80 border border-slate-200" />
    </div>
  );
}
