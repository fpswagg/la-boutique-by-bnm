"use client";

import { DashboardSpinner } from "./DashboardSpinner";
import { useFormPending } from "./FormPendingContext";

type DashboardSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "compact";
};

const variantClasses = {
  primary:
    "justify-self-start px-6 py-3 border border-[var(--fg)] text-sm uppercase tracking-widest hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity",
  compact:
    "px-2 py-1 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-opacity",
};

export function DashboardSubmitButton({
  label,
  pendingLabel,
  className = "",
  variant = "primary",
}: DashboardSubmitButtonProps) {
  const isPending = useFormPending();

  return (
    <button
      type="submit"
      disabled={isPending}
      aria-disabled={isPending}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${className}`}
    >
      {isPending ? (
        <>
          <DashboardSpinner size="sm" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
