// ============================================================
// Wamanafo SHS — Subject Form (create + edit)
// ============================================================

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSubjectSchema, updateSubjectSchema } from "@/lib/validators/subject";
import { cn } from "@/lib/utils";
import type { CreateSubjectInput, UpdateSubjectInput } from "@/lib/validators/subject";
import type { SubjectDTO } from "@/types/class";

function Field({ label, error, required, hint, children }: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass = (e: boolean) =>
  cn("w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500",
    e ? "border-red-300 bg-red-50" : "border-slate-300 bg-white");

// ── Create ────────────────────────────────────────────────────

export function CreateSubjectForm({ onSuccess }: { onSuccess: (id: string) => void }) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CreateSubjectInput>({ resolver: zodResolver(createSubjectSchema) });

  async function onSubmit(data: CreateSubjectInput) {
    const res = await fetch("/api/v1/subjects", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      if (json.fields) Object.entries(json.fields).forEach(([f, m]) =>
        setError(f as keyof CreateSubjectInput, { message: String(m) }));
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

      <Field label="Subject name" error={errors.name?.message} required>
        <input {...register("name")} className={inputClass(!!errors.name)}
          placeholder="Mathematics" />
      </Field>

      <Field label="Subject code" error={errors.code?.message}
        hint="Short uppercase code used in reports, e.g. MATH, ENG, PHY." required>
        <input {...register("code")} className={cn(inputClass(!!errors.code), "font-mono uppercase")}
          placeholder="MATH" />
      </Field>

      <Field label="Subject type" error={(errors as Record<string, { message?: string }>).isCore?.message} required>
        <div className="flex gap-4 mt-1">
          {[
            { value: "true",  label: "Core subject",    desc: "Required for all students" },
            { value: "false", label: "Elective subject", desc: "Programme-specific" },
          ].map(opt => (
            <label key={opt.value}
              className="flex-1 flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 transition-colors">
              <input {...register("isCore", { setValueAs: v => v === "true" })}
                type="radio" value={opt.value}
                className="mt-0.5 text-teal-600 focus:ring-teal-500" />
              <div>
                <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className={cn("inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-teal-700 text-white hover:bg-teal-600 disabled:opacity-60")}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Creating…" : "Create subject"}
        </button>
      </div>
    </form>
  );
}

// ── Edit ──────────────────────────────────────────────────────

export function EditSubjectForm({ subject, onSuccess }: { subject: SubjectDTO; onSuccess: () => void }) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } =
    useForm<UpdateSubjectInput>({
      resolver: zodResolver(updateSubjectSchema),
      defaultValues: { name: subject.name, code: subject.code, isCore: subject.isCore },
    });

  useEffect(() => {
    reset({ name: subject.name, code: subject.code, isCore: subject.isCore });
  }, [subject, reset]);

  async function onSubmit(data: UpdateSubjectInput) {
    const res = await fetch(`/api/v1/subjects/${subject.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setError("root", { message: json.error ?? "Update failed." }); return; }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {"root" in errors && (errors as Record<string, { message?: string }>).root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(errors as Record<string, { message?: string }>).root?.message}
        </div>
      )}

      <Field label="Subject name" error={errors.name?.message} required>
        <input {...register("name")} className={inputClass(!!errors.name)} />
      </Field>

      <Field label="Subject code" error={errors.code?.message} required>
        <input {...register("code")} className={cn(inputClass(!!errors.code), "font-mono uppercase")} />
      </Field>

      <Field label="Core subject">
        <label className="flex items-center gap-3 cursor-pointer">
          <input {...register("isCore")} type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-sm text-slate-700">This is a core subject (required for all students)</span>
        </label>
      </Field>

      <div className="flex justify-end pt-2 border-t border-slate-200">
        <button type="submit" disabled={isSubmitting || !isDirty}
          className={cn("inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-teal-700 text-white hover:bg-teal-600 disabled:opacity-60")}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
