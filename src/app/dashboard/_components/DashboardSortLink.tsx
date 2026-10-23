"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DashboardSpinner } from "./DashboardSpinner";

type DashboardSortLinkProps = {
  href: string;
  label: string;
  active: boolean;
};

export function DashboardSortLink({ href, label, active }: DashboardSortLinkProps) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isNavigating = isPending && pendingHref === href;

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        setPendingHref(href);
        startTransition(() => {
          router.push(href);
        });
      }}
      aria-busy={isNavigating}
      className={`inline-flex items-center gap-1.5 px-3 py-1 border text-xs uppercase tracking-widest transition-opacity ${
        active ? "border-[var(--fg)]" : "border-[var(--border)]"
      } ${isNavigating ? "opacity-60" : ""}`}
    >
      {isNavigating ? <DashboardSpinner size="sm" /> : null}
      <span>{label}</span>
    </Link>
  );
}
