import { redirect } from "next/navigation";

export default function DeprecatedParentReportCardDetailRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { studentId?: string };
}) {
  const studentId = searchParams?.studentId;
  const base = `/parent/report-cards/${params.id}`;
  redirect(studentId ? `${base}?studentId=${encodeURIComponent(studentId)}` : base);
}
