import { notFound } from "next/navigation";
import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardNavLink } from "./_components/DashboardNavLink";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  const secret = process.env.DASHBOARD_PASSWORD;
  const token = params.token;

  if (!secret || token !== secret) {
    notFound();
  }

  const links = [
    { href: `/dashboard/${token}`, label: dashboardFr.nav.overview, match: "exact" as const },
    { href: `/dashboard/${token}/products`, label: dashboardFr.nav.products, match: "prefix" as const },
    {
      href: `/dashboard/${token}/products/new`,
      label: dashboardFr.nav.createProduct,
      match: "prefix" as const,
    },
    { href: `/dashboard/${token}/store`, label: dashboardFr.nav.storeConfig, match: "prefix" as const },
  ];

  return (
    <div lang="fr" className="dark min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
        <aside className="border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 h-fit lg:sticky lg:top-8 min-w-0">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
            {dashboardFr.nav.accent}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-4 sm:mb-6">{dashboardFr.nav.brand}</h1>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:flex-nowrap overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0">
            {links.map((item) => (
              <DashboardNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                match={item.match}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
