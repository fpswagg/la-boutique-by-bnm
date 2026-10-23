"use client";

type DashboardSpinnerProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-3 w-3 border",
  md: "h-4 w-4 border-2",
};

export function DashboardSpinner({ size = "md", className = "" }: DashboardSpinnerProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full border-[var(--border)] border-t-[var(--fg)] animate-spin ${sizeClasses[size]} ${className}`}
    />
  );
}
