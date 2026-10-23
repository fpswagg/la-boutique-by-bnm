"use client";

import type { ReactNode } from "react";
import { useFormPending } from "./FormPendingContext";

type FieldBaseProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

function FieldShell({ label, hint, children }: FieldBaseProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest text-[var(--muted)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

const fieldClassName =
  "min-h-11 px-3 py-2 border border-[var(--border)] bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity";

type DashboardTextFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | number;
  type?: "text" | "number" | "email" | "tel";
  placeholder?: string;
  hint?: string;
};

export function DashboardTextField({
  label,
  name,
  required = true,
  defaultValue,
  type = "text",
  placeholder,
  hint,
}: DashboardTextFieldProps) {
  const pending = useFormPending();

  return (
    <FieldShell label={label} hint={hint}>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        type={type}
        placeholder={placeholder}
        disabled={pending}
        className={fieldClassName}
      />
    </FieldShell>
  );
}

type DashboardTextareaProps = {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
};

export function DashboardTextarea({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
}: DashboardTextareaProps) {
  const pending = useFormPending();

  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        disabled={pending}
        className="px-3 py-2 border border-[var(--border)] bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      />
    </FieldShell>
  );
}

type Option = {
  value: string;
  label: string;
};

type DashboardSelectProps = {
  label: string;
  name: string;
  options: Option[];
  defaultValue?: string;
  hint?: string;
};

export function DashboardSelect({
  label,
  name,
  options,
  defaultValue,
  hint,
}: DashboardSelectProps) {
  const pending = useFormPending();

  return (
    <FieldShell label={label} hint={hint}>
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={pending}
        className={fieldClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
