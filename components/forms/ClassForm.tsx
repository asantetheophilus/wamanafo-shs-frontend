// ============================================================
// Wamanafo SHS — Class Form (create + edit)
// ============================================================

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClassSchema, updateClassSchema } from "@/lib/validators/class";
import { cn } from "@/lib/utils";
import type { CreateClassInput, UpdateClassInput } from "@/lib/validators/class";
import type { ClassDTO } from "@/types/class";
import type { SelectOption } from "@/types/common";

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass = (e: boolean) =>
  cn("w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500",
    e ? "border-red-300 bg-red-50" : "border-slate-300 bg-white");

// ── Create ────────────────────────────────────────────────────

interface CreateClassFormProps {
  yearOptions:      SelectOption[];
  programmeOptions: SelectOption[];
  teacherOptions:   SelectOption[];
  onSuccess: (classId: string) => void;
}

export function CreateClassForm({
  yearOptions, programmeOptions, teacherOptions, onSuccess,
}: CreateClassFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateClassInput>({ resolver: zodResolver(createClassSchema) });

  async function onSubmit(data: CreateClassInput) {
    const res = await fetch("/api/v1/classes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      if (json.fields) Object.entries(json.fields).forEach(([f, m]) =>
        setError(f as keyof CreateClassInput, { message: String(m) }));
      else setError("root", { message: json.error ?? "An error occurred." });
      return;
    }
    onSuccess(json.data.id);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {"root" in errors && (errors as Record<string, { message?: string }>).root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(errors as Record<string, { message?: string }>).root?.message}
        </div>
      )}

      <Field label="Class name" error={errors.name?.message} required>
        <input {...register("name")} className={inputClass(!!errors.name)}
          placeholder="SHS 1A" />
      </Field>

      <Field label="Academic year" error={errors.yearId?.message} required>
        <select {...register("yearId")} className={inputClass(!!errors.yearId)}>
          <option value="">Select year…</option>
          {yearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Programme" error={errors.programmeId?.message} required>
        <select {...register("programmeId")} className={inputClass(!!errors.programmeId)}>
          <option value="">Select programme…</option>
          {programmeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Form master (optional)" error={errors.formMasterId?.message}>
        <select {...register("formMasterId")} className={inputClass(!!errors.formMasterId)}>
          <option value="">Assign later</option>
          {teacherOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className={cn("inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-teal-700 text-white hover:bg-teal-600 transition-colors disabled:opacity-60")}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Creating…" : "Create class"}
        </button>
      </div>
    </form>
  );
}

// ── Edit ──────────────────────────────────────────────────────

interface EditClassFormProps {
  cls:            ClassDTO;
  teacherOptions: SelectOption[];
  onSuccess:      () => void;
}

export function EditClassForm({ cls, teacherOptions, onSuccess }: EditClassFormProps) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } =
    useForm<UpdateClassInput>({
      resolver: zodResolver(updateClassSchema),
      defaultValues: {
        name:         cls.name,
        formMasterId: cls.formMaster?.id ?? undefined,
      },
    });

  useEffect(() => {
    reset({ name: cls.name, formMasterId: cls.formMaster?.id ?? undefined });
  }, [cls, reset]);

  async function onSubmit(data: UpdateClassInput) {
    const res = await fetch(`/api/v1/classes/${cls.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError("root", { message: json.error ?? "Update failed." });
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {"root" in errors && (errors as Record<string, { message?: string }>).root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(errors as Record<string, { message?: string }>).root?.message}
        </div>
      )}

      <Field label="Class name" error={errors.name?.message} required>
        <input {...register("name")} className={inputClass(!!errors.name)} />
      </Field>

      <Field label="Form master" error={errors.formMasterId?.message}>
        <select {...register("formMasterId")} className={inputClass(!!errors.formMasterId)}>
          <option value="">Not assigned</option>
          {teacherOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <div className="flex justify-end pt-2 border-t border-slate-200">
        <button type="submit" disabled={isSubmitting || !isDirty}
          className={cn("inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-teal-700 text-white hover:bg-teal-600 transition-colors disabled:opacity-60")}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
