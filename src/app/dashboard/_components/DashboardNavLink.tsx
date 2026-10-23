"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DashboardSpinner } from "./DashboardSpinner";

type DashboardNavLinkProps = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
  className?: string;
};

export function DashboardNavLink({
  href,
  label,
  match = "prefix",
  className = "",
}: DashboardNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isActive =
    match === "exact"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

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
      className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 border text-xs sm:text-sm tracking-wider uppercase transition-opacity whitespace-nowrap ${
        isActive ? "border-[var(--border)]" : "border-transparent hover:border-[var(--border)]"
      } ${isNavigating ? "opacity-60" : ""} ${className}`}
    >
      {isNavigating ? <DashboardSpinner size="sm" /> : null}
      <span>{label}</span>
    </Link>
  );
}
