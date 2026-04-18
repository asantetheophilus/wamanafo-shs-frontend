// ============================================================
// Wamanafo SHS — Student Form
// Used for both creating and editing students.
// ============================================================

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createStudentSchema } from "@/lib/validators/student";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import type { StudentDTO } from "@/types/student";

// Extend base schema with password for create; optional for edit
const createFormSchema = createStudentSchema.extend({
  password: z
    .string({ required_error: "Initial password is required." })
    .min(8, "Password must be at least 8 characters.")
    .max(128),
});

const editFormSchema = createStudentSchema.partial().extend({
  status: z
    .enum(["ACTIVE", "WITHDRAWN", "GRADUATED", "SUSPENDED"])
    .optional(),
});

type CreateFormValues = z.infer<typeof createFormSchema>;
type EditFormValues   = z.infer<typeof editFormSchema>;

// ── Field component ───────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
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

interface CreateStudentFormProps {
  onSuccess: (studentId: string) => void;
  classOptions?: Array<{ value: string; label: string; yearId?: string; yearLabel?: string }>;
  yearOptions?: Array<{ value: string; label: string }>;
}

export function CreateStudentForm({
  onSuccess,
  classOptions = [],
  yearOptions = [],
}: CreateStudentFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
  });

  const selectedClassId = watch("classId");
  const selectedYearId = watch("yearId");
  const selectedClass = classOptions.find((option) => option.value === selectedClassId);
  const filteredYearOptions = selectedClass?.yearId
    ? yearOptions.filter((option) => option.value === selectedClass.yearId)
    : yearOptions;

  useEffect(() => {
    if (!selectedClass) return;
    if (selectedClass.yearId && selectedYearId !== selectedClass.yearId) {
      setValue("yearId", selectedClass.yearId, { shouldValidate: true, shouldDirty: true });
    }
    clearErrors("yearId");
  }, [selectedClass, selectedYearId, setValue, clearErrors]);

  async function onSubmit(data: CreateFormValues) {
    if (data.classId && !data.yearId) {
      setError("yearId", { message: "Select the academic year for the chosen class." });
      return;
    }

    if (selectedClass?.yearId && data.yearId && selectedClass.yearId !== data.yearId) {
      setError("yearId", {
        message: `Selected class belongs to ${selectedClass.yearLabel ?? "a different academic year"}.`,
      });
      return;
    }

    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth || undefined,
      classId: data.classId || undefined,
      yearId: data.yearId || undefined,
      gender: data.gender || undefined,
    };

    const res = await apiFetch<{ id: string }>("/api/v1/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.success) {
      setError("root", { message: res.error ?? "Unable to create the student right now." });
      return;
    }

    onSuccess(res.data.id);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errors.root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" error={errors.firstName?.message} required>
          <input
            {...register("firstName")}
            className={inputClass(!!errors.firstName)}
            placeholder="Kwame"
          />
        </Field>

        <Field label="Last name" error={errors.lastName?.message} required>
          <input
            {...register("lastName")}
            className={inputClass(!!errors.lastName)}
            placeholder="Mensah"
          />
        </Field>
      </div>

      <Field label="Email address" error={errors.email?.message} required>
        <input
          {...register("email")}
          type="email"
          className={cn(inputClass(!!errors.email), "font-mono")}
          placeholder="k.mensah@school.edu.gh"
        />
      </Field>

      <Field label="Index number" error={errors.indexNumber?.message} required>
        <input
          {...register("indexNumber")}
          className={cn(inputClass(!!errors.indexNumber), "font-mono")}
          placeholder="0123456789"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of birth" error={errors.dateOfBirth?.message}>
          <input
            {...register("dateOfBirth")}
            type="date"
            className={inputClass(!!errors.dateOfBirth)}
          />
        </Field>

        <Field label="Gender" error={errors.gender?.message}>
          <select {...register("gender")} className={inputClass(!!errors.gender)}>
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>
      </div>

      {classOptions.length > 0 && yearOptions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Enrol in class" error={errors.classId?.message}>
            <select {...register("classId")} className={inputClass(!!errors.classId)}>
              <option value="">No class yet</option>
              {classOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Academic year" error={errors.yearId?.message}>
            <select {...register("yearId")} className={inputClass(!!errors.yearId)}>
              <option value="">Select year…</option>
              {filteredYearOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {selectedClass?.yearLabel && (
              <p className="mt-1.5 text-xs text-slate-500">Chosen class belongs to {selectedClass.yearLabel}.</p>
            )}
          </Field>
        </div>
      )}

      <Field label="Initial password" error={errors.password?.message} required>
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
          {isSubmitting ? "Creating…" : "Create student"}
        </button>
      </div>
    </form>
  );
}

// ── Edit form ─────────────────────────────────────────────────


interface EditStudentFormProps {
  student: StudentDTO;
  onSuccess: () => void;
}

export function EditStudentForm({ student, onSuccess }: EditStudentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      firstName:   student.user.firstName,
      lastName:    student.user.lastName,
      email:       student.user.email,
      indexNumber: student.indexNumber,
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.split("T")[0]
        : undefined,
      gender: (student.gender as "Male" | "Female" | "Other") ?? undefined,
      status: student.status,
    },
  });

  // Reset when student prop changes
  useEffect(() => {
    reset({
      firstName:   student.user.firstName,
      lastName:    student.user.lastName,
      email:       student.user.email,
      indexNumber: student.indexNumber,
      dateOfBirth: student.dateOfBirth?.split("T")[0] ?? undefined,
      gender:      (student.gender as "Male" | "Female" | "Other") ?? undefined,
      status:      student.status,
    });
  }, [student, reset]);

  async function onSubmit(data: EditFormValues) {
    // Strip empty optional strings before sending
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth || undefined,
      gender:      data.gender      || undefined,
    };

    const res = await apiFetch(`/api/v1/students/${student.id}`, {
      method: "PATCH",
      body:   JSON.stringify(payload),
    });

    if (!res.success) {
      setError("root", { message: res.error ?? "Update failed." });
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errors.root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
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

      <Field label="Index number" error={errors.indexNumber?.message} required>
        <input
          {...register("indexNumber")}
          className={cn(inputClass(!!errors.indexNumber), "font-mono")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date of birth" error={errors.dateOfBirth?.message}>
          <input {...register("dateOfBirth")} type="date" className={inputClass(!!errors.dateOfBirth)} />
        </Field>
        <Field label="Gender" error={errors.gender?.message}>
          <select {...register("gender")} className={inputClass(!!errors.gender)}>
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Status" error={errors.status?.message} required>
        <select {...register("status")} className={inputClass(!!errors.status)}>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="WITHDRAWN">Withdrawn</option>
          <option value="GRADUATED">Graduated</option>
        </select>
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
