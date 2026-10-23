import Link from "next/link";
import { Suspense } from "react";
import { dashOrders, dashProducts, requireDash, viewsSince } from "@/lib/dashboard";
import { dashboardFr, orderStatusLabelFr } from "@/lib/dashboard/fr";
import { OverviewChart } from "./OverviewChart";
import { AnalyticsWindowLinks, type AnalyticsWindow } from "./_components/AnalyticsWindowLinks";

const WINDOW_DAYS: Record<AnalyticsWindow, number> = { today: 1, week: 7, month: 30 };

function parseWindow(value: string | undefined): AnalyticsWindow {
  return value === "today" || value === "month" ? value : "week";
}

function Card({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="font-display text-4xl tracking-wider mt-2">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="border border-[var(--border)] p-4 hover:border-[var(--fg)]">
      {body}
    </Link>
  ) : (
    <article className="border border-[var(--border)] p-4">{body}</article>
  );
}

export default async function DashboardOverviewPage({ searchParams }: { searchParams: { window?: string } }) {
  const ctx = await requireDash();
  const window = parseWindow(searchParams.window);
  const days = WINDOW_DAYS[window];
  const [products, orders] = await Promise.all([dashProducts(ctx), dashOrders(ctx)]);

  const published = products.filter((p) => p.status === "published");
  const lowStock = published.filter((p) => p.stock <= 2);
  const pending = orders.filter((o) => o.status === "pending");
  const viewed = products
    .map((p) => ({ p, views: viewsSince(p, days) }))
    .filter((x) => x.views > 0)
    .sort((a, b) => b.views - a.views);
  const windowViews = viewed.reduce((n, x) => n + x.views, 0);
  const allTime = products.reduce((n, p) => n + p.views, 0);
  const windowLabel = dashboardFr.overview.window[window];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">{dashboardFr.overview.accent}</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{dashboardFr.overview.title}</h2>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{dashboardFr.overview.window.label}</p>
          <Suspense fallback={null}>
            <AnalyticsWindowLinks />
          </Suspense>
        </div>
      </div>

      <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card label={dashboardFr.overview.cards.products} value={products.length} href="/dashboard/products" />
        <Card label={dashboardFr.overview.cards.published} value={published.length} />
        <Card label={dashboardFr.overview.cards.lowStock} value={lowStock.length} href="/dashboard/products?sort=stock&dir=asc" />
        <Card label={dashboardFr.overview.cards.pendingOrders} value={pending.length} href="/dashboard/orders" />
        <Card label={`${dashboardFr.overview.cards.views} (${windowLabel})`} value={windowViews} />
      </section>

      <OverviewChart data={viewed.slice(0, 10).map((x) => ({ label: x.p.name.fr, views: x.views }))} />
      <p className="text-xs text-[var(--muted)]">
        {dashboardFr.overview.allTimeViews} : {allTime.toLocaleString("fr-FR")}
      </p>

      {lowStock.length > 0 ? (
        <section className="border border-[var(--border)] p-4">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-4">{dashboardFr.overview.cards.lowStock}</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {lowStock.slice(0, 12).map((p) => (
              <li key={p.sssId}>
                <Link href={`/dashboard/products/${p.sssId}`} className="flex justify-between gap-2 border border-[var(--border)]/60 px-3 py-2 hover:border-[var(--fg)]">
                  <span className="truncate">{p.name.fr}</span>
                  <span className="font-display">{p.stock}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border border-[var(--border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)]">{dashboardFr.overview.recentOrders}</p>
          <Link href="/dashboard/orders" className="text-xs underline underline-offset-4">
            {dashboardFr.overview.allOrders}
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{dashboardFr.orders.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-b border-[var(--border)]/60 last:border-0">
                    <td className="py-2 pr-4 font-medium">{o.ref}</td>
                    <td className="py-2 pr-4">{o.name || dashboardFr.overview.emptyValue}</td>
                    <td className="py-2 pr-4">{o.total ? `${o.total.toLocaleString("fr-FR")} ${o.currency}` : dashboardFr.products.onRequest}</td>
                    <td className="py-2 pr-4">{orderStatusLabelFr(o.status)}</td>
                    <td className="py-2">{o.at ? new Date(o.at).toLocaleString("fr-FR", { timeZone: "Africa/Douala" }) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
