// ============================================================
// Wamanafo SHS — Teacher Form
// ============================================================

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createTeacherSchema, updateTeacherSchema } from "@/lib/validators/teacher";
import { cn } from "@/lib/utils";
import type { CreateTeacherInput, UpdateTeacherInput } from "@/lib/validators/teacher";
import type { TeacherDTO } from "@/types/teacher";

// ── Shared field component ────────────────────────────────────

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  cn(
    "w-full px-3 py-2 text-sm rounded-lg border transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
    hasError
      ? "border-red-300 bg-red-50 text-red-900"
      : "border-slate-300 bg-white text-slate-900"
  );

// ── Create form ───────────────────────────────────────────────

interface CreateTeacherFormProps {
  onSuccess: (teacherId: string) => void;
}

export function CreateTeacherForm({ onSuccess }: CreateTeacherFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeacherInput>({
    resolver: zodResolver(createTeacherSchema),
  });

  async function onSubmit(data: CreateTeacherInput) {
    const res = await fetch("/api/v1/teachers", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      if (json.fields) {
        Object.entries(json.fields).forEach(([field, msg]) => {
          setError(field as keyof CreateTeacherInput, { message: String(msg) });
        });
      } else {
        setError("root" as keyof CreateTeacherInput, {
          message: json.error ?? "An error occurred.",
        } as { message: string });
      }
      return;
    }

    onSuccess(json.data.id);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Root error */}
      {"root" in errors && errors.root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(errors.root as { message?: string }).message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" error={errors.firstName?.message} required>
          <input
            {...register("firstName")}
            className={inputClass(!!errors.firstName)}
            placeholder="Kofi"
          />
        </Field>

        <Field label="Last name" error={errors.lastName?.message} required>
          <input
            {...register("lastName")}
            className={inputClass(!!errors.lastName)}
            placeholder="Asante"
          />
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.message} required>
        <input
          {...register("email")}
          type="email"
          className={cn(inputClass(!!errors.email), "font-mono")}
          placeholder="k.asante@school.edu.gh"
        />
      </Field>

      <Field
        label="Staff ID"
        error={errors.staffId?.message}
        hint="Unique identifier from the school's HR records."
        required
      >
        <input
          {...register("staffId")}
          className={cn(inputClass(!!errors.staffId), "font-mono")}
          placeholder="GES/2024/001"
        />
      </Field>

      <Field
        label="Initial password"
        error={errors.password?.message}
        hint="The teacher will be able to change this after first login."
        required
      >
        <input
          {...register("password")}
          type="password"
          className={inputClass(!!errors.password)}
          placeholder="Min 8 characters"
          autoComplete="new-password"
        />
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold",
            "bg-teal-700 text-white hover:bg-teal-600 transition-colors",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Creating…" : "Create teacher"}
        </button>
      </div>
    </form>
  );
}

// ── Edit form ─────────────────────────────────────────────────

interface EditTeacherFormProps {
  teacher: TeacherDTO;
  onSuccess: () => void;
}

export function EditTeacherForm({ teacher, onSuccess }: EditTeacherFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateTeacherInput>({
    resolver: zodResolver(updateTeacherSchema),
    defaultValues: {
      firstName: teacher.user.firstName,
      lastName:  teacher.user.lastName,
      email:     teacher.user.email,
      staffId:   teacher.staffId,
      isActive:  teacher.user.isActive,
    },
  });

  useEffect(() => {
    reset({
      firstName: teacher.user.firstName,
      lastName:  teacher.user.lastName,
      email:     teacher.user.email,
      staffId:   teacher.staffId,
      isActive:  teacher.user.isActive,
    });
  }, [teacher, reset]);

  async function onSubmit(data: UpdateTeacherInput) {
    const res = await fetch(`/api/v1/teachers/${teacher.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      if (json.fields) {
        Object.entries(json.fields).forEach(([field, msg]) => {
          setError(field as keyof UpdateTeacherInput, { message: String(msg) });
        });
      } else {
        setError("root" as keyof UpdateTeacherInput, {
          message: json.error ?? "Update failed.",
        } as { message: string });
      }
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {"root" in errors && errors.root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(errors.root as { message?: string }).message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" error={errors.firstName?.message} required>
          <input {...register("firstName")} className={inputClass(!!errors.firstName)} />
        </Field>
        <Field label="Last name" error={errors.lastName?.message} required>
          <input {...register("lastName")} className={inputClass(!!errors.lastName)} />
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.message} required>
        <input
          {...register("email")}
          type="email"
          className={cn(inputClass(!!errors.email), "font-mono")}
        />
      </Field>

      <Field label="Staff ID" error={errors.staffId?.message} required>
        <input
          {...register("staffId")}
          className={cn(inputClass(!!errors.staffId), "font-mono")}
        />
      </Field>

      <Field label="Account status">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("isActive")}
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700">Account is active</span>
        </label>
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold",
            "bg-teal-700 text-white hover:bg-teal-600 transition-colors",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
