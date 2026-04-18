// ============================================================
// Wamanafo SHS — Admin: Subject Detail Page
// ============================================================

"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSubject, subjectKeys } from "@/hooks/useSubjects";
import { EditSubjectForm } from "@/components/forms/SubjectForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function SubjectDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: subject, isLoading, isError } = useSubject(id);

  function handleSuccess() {
    void queryClient.invalidateQueries({ queryKey: subjectKeys.detail(id) });
  }

  if (isLoading) {
    return <div className="animate-pulse px-8 py-6 grid grid-cols-3 gap-6">
      <div className="col-span-1 h-60 card-flat" />
      <div className="col-span-2 h-60 card-flat" />
    </div>;
  }

  if (isError || !subject) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-slate-500">Subject not found.</p>
        <Link href="/admin/subjects" className="mt-4 inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to subjects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={subject.name}
        description={`Code: ${subject.code}`}
        breadcrumbs={[
          { label: "Admin",    href: "/admin/dashboard" },
          { label: "Subjects", href: "/admin/subjects"  },
          { label: subject.name },
        ]}
        action={
          <StatusBadge
            label={subject.isCore ? "Core Subject" : "Elective Subject"}
            variant={subject.isCore ? "info" : "neutral"}
          />
        }
      />

      <div className="px-8 py-6 grid grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</h4>
            <div className="divide-y divide-slate-100 text-sm">
              <InfoRow label="Code"       value={subject.code} mono />
              <InfoRow label="Type"       value={subject.isCore ? "Core" : "Elective"} />
              <InfoRow label="Added"      value={formatDate(subject.createdAt)} />
            </div>
          </div>

          {/* Programmes using this subject */}
          <div className="card p-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Assigned to Programmes
            </h4>
            {subject.isCore ? (
              <p className="text-xs text-slate-400 italic">
                Core subjects apply to all programmes.
              </p>
            ) : subject.programmes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Not assigned to any programme yet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {subject.programmes.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono
                      bg-slate-100 text-slate-700">
                      {p.code}
                    </span>
                    <span className="text-sm text-slate-700 truncate">{p.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="col-span-2">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-5">Edit Subject</h3>
            <EditSubjectForm subject={subject} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
