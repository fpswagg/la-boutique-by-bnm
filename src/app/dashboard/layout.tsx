import type { Metadata } from "next";
import { config } from "@/lib/config";
import { dashState } from "@/lib/dashboard";
import { dashboardFr } from "@/lib/dashboard/fr";
import { authProblem } from "@/lib/sss-auth";
import { DashboardNavLink } from "./_components/DashboardNavLink";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div lang="fr" className="dark min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {children}
    </div>
  );
}

function SignIn() {
  const problem = authProblem();
  return (
    <Shell>
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-5">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)]">{dashboardFr.nav.accent}</p>
          <h1 className="font-display text-3xl tracking-wider">{dashboardFr.nav.brand}</h1>
          <p className="text-sm text-[var(--muted)]">{dashboardFr.auth.intro}</p>
          {problem ? (
            <p className="text-sm text-[var(--muted)]">{dashboardFr.auth.off}</p>
          ) : (
            <a
              href="/auth/sss?next=/dashboard"
              className="block text-center px-4 py-3 bg-[var(--fg)] text-[var(--bg)] uppercase tracking-widest text-sm"
            >
              {dashboardFr.auth.signIn}
            </a>
          )}
        </div>
      </div>
    </Shell>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const state = await dashState();

  if (state.kind === "signed_out") return <SignIn />;
  if (state.kind === "wrong_business") {
    return (
      <Shell>
        <div className="mx-auto max-w-md px-4 py-20 space-y-4">
          <SignInWrong name={state.session.user.business?.name ?? ""} />
        </div>
      </Shell>
    );
  }

  const { session, canWrite } = state.ctx;
  const links = [
    { href: "/dashboard", label: dashboardFr.nav.overview, match: "exact" as const },
    { href: "/dashboard/orders", label: dashboardFr.nav.orders, match: "prefix" as const },
    { href: "/dashboard/products", label: dashboardFr.nav.products, match: "exact" as const },
    { href: "/dashboard/products/new", label: dashboardFr.nav.createProduct, match: "prefix" as const },
    { href: "/dashboard/store", label: dashboardFr.nav.storeConfig, match: "prefix" as const },
  ];

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
        <aside className="border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 h-fit lg:sticky lg:top-8 min-w-0">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">{dashboardFr.nav.accent}</p>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-4 sm:mb-6">{dashboardFr.nav.brand}</h1>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:flex-nowrap overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0">
            {links.map((item) => (
              <DashboardNavLink key={item.href} href={item.href} label={item.label} match={item.match} />
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-3 text-xs">
            <p className="text-[var(--muted)]">
              {session.user.name ?? session.user.email ?? ""}
              {canWrite ? "" : ` · ${dashboardFr.auth.readOnly}`}
            </p>
            <a href={config.appUrl} target="_blank" rel="noreferrer" className="block underline underline-offset-4">
              {dashboardFr.auth.openSss}
            </a>
            <a href="/" className="block underline underline-offset-4">
              {dashboardFr.auth.viewShop}
            </a>
            <form action="/auth/sss/sign-out" method="post">
              <button type="submit" className="underline underline-offset-4">
                {dashboardFr.auth.signOut}
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </Shell>
  );
}

function SignInWrong({ name }: { name: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
      <p className="text-sm">
        {dashboardFr.auth.wrongBusiness}
        {name ? ` (${name})` : ""}
      </p>
      <form action="/auth/sss/sign-out" method="post">
        <button type="submit" className="px-4 py-2 border border-[var(--border)] uppercase tracking-widest text-xs">
          {dashboardFr.auth.switchAccount}
        </button>
      </form>
    </div>
  );
}

