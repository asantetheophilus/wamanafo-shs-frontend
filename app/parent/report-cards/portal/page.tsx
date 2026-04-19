import { redirect } from "next/navigation";

export default function DeprecatedParentPortalRoute() {
  redirect("/parent/portal");
}
