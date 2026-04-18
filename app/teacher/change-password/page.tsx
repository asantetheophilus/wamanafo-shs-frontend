"use client";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";
export default function TeacherChangePasswordPage() {
  return (
    <div className="page-shell">
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your teacher account password</p>
        </div>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
