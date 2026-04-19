import { redirect } from "next/navigation";

export default function DeprecatedParentReportCardsListRoute({
  searchParams,
}: {
  searchParams?: { studentId?: string };
}) {
  const studentId = searchParams?.studentId;
  redirect(studentId ? `/parent/report-cards?studentId=${encodeURIComponent(studentId)}` : "/parent/report-cards");
}
