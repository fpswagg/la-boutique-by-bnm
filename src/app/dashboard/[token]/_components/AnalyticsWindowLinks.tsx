"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { dashboardFr } from "@/lib/dashboard/fr";
import type { AnalyticsWindow } from "@/lib/db/analytics";

const WINDOWS: AnalyticsWindow[] = ["today", "week", "month"];

export function AnalyticsWindowLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("window") as AnalyticsWindow) || "today";

  const labels: Record<AnalyticsWindow, string> = {
    today: dashboardFr.overview.window.today,
    week: dashboardFr.overview.window.week,
    month: dashboardFr.overview.window.month,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {WINDOWS.map((window) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("window", window);
        const href = `${pathname}?${params.toString()}`;
        const active = current === window;
        return (
          <Link
            key={window}
            href={href}
            className={`border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
              active
                ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
            }`}
          >
            {labels[window]}
          </Link>
        );
      })}
    </div>
  );
}
