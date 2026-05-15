import Link from "next/link";
import { dashboardFr } from "@/lib/dashboard/fr";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-[clamp(5rem,18vw,12rem)] leading-none text-[var(--fg)]/10 select-none">
          404
        </p>
        <h1 className="font-display text-2xl sm:text-4xl tracking-wider -mt-3 mb-3">
          {dashboardFr.errors.pageNotFoundTitle}
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">{dashboardFr.errors.pageNotFoundHint}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
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
