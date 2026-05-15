"use client";

import { useTransition } from "react";
import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardSpinner } from "./DashboardSpinner";

type ClearAnalyticsFormProps = {
  action: () => void | Promise<void>;
};

export function ClearAnalyticsForm({ action }: ClearAnalyticsFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!window.confirm(dashboardFr.overview.clearAnalyticsConfirm)) {
          return;
        }
        startTransition(async () => {
          await action();
        });
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase tracking-widest transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <DashboardSpinner size="sm" /> : null}
        <span>{isPending ? dashboardFr.loading.clearingAnalytics : dashboardFr.overview.clearAnalytics}</span>
      </button>
    </form>
  );
}
