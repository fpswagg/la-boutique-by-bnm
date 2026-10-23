"use client";

import Link from "next/link";
import { useEffect } from "react";
import { dashboardFr } from "@/lib/dashboard/fr";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div lang="fr" className="dark min-h-[50vh] flex items-center justify-center px-4 bg-[var(--bg)] text-[var(--fg)]">
      <div className="text-center max-w-md">
        <p className="font-display text-[clamp(4rem,15vw,10rem)] leading-none text-[var(--fg)]/10 select-none">
          !
        </p>
        <h1 className="font-display text-2xl sm:text-4xl tracking-wider -mt-2 mb-3">
          {dashboardFr.errors.errorTitle}
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">{dashboardFr.errors.errorHint}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 border border-[var(--fg)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            {dashboardFr.errors.retry}
          </button>
          <Link
            href="/fr"
            className="px-4 py-2 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase tracking-widest transition-colors"
          >
            {dashboardFr.errors.backToStore}
          </Link>
        </div>
      </div>
    </div>
  );
}
