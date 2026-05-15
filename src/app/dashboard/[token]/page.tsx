import { Suspense } from "react";
import { getAnalyticsSummary, type AnalyticsWindow } from "@/lib/db/analytics";
import { analyticsEventLabelFr, dashboardFr, localeLabelFr } from "@/lib/dashboard/fr";
import { clearAnalyticsAction } from "./actions";
import { ClearAnalyticsForm } from "./_components/ClearAnalyticsForm";
import { OverviewChart } from "./OverviewChart";
import { AnalyticsWindowLinks } from "./_components/AnalyticsWindowLinks";

function parseWindow(value: string | undefined): AnalyticsWindow {
  if (value === "week" || value === "month") return value;
  return "today";
}

export default async function DashboardOverviewPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { window?: string };
}) {
  const token = params.token;
  const window = parseWindow(searchParams.window);
  const summary = await getAnalyticsSummary(window);

  const windowLabel =
    window === "today"
      ? dashboardFr.overview.window.today
      : window === "week"
        ? dashboardFr.overview.window.week
        : dashboardFr.overview.window.month;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
            {dashboardFr.overview.accent}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">
            {dashboardFr.overview.title}
          </h2>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {dashboardFr.overview.window.label}
          </p>
          <Suspense fallback={null}>
            <AnalyticsWindowLinks />
          </Suspense>
        </div>
      </div>

      <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <article className="border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {dashboardFr.overview.cards.products}
          </p>
          <p className="font-display text-4xl tracking-wider mt-2">{summary.cards.totalProducts}</p>
        </article>
        <article className="border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {dashboardFr.overview.cards.published}
          </p>
          <p className="font-display text-4xl tracking-wider mt-2">
            {summary.cards.publishedProducts}
          </p>
        </article>
        <article className="border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {dashboardFr.overview.cards.lowStock}
          </p>
          <p className="font-display text-4xl tracking-wider mt-2">
            {summary.cards.lowStockProducts}
          </p>
        </article>
        <article className="border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {dashboardFr.overview.cards.orders}
          </p>
          <p className="font-display text-4xl tracking-wider mt-2">{summary.cards.totalOrders}</p>
        </article>
        <article className="border border-[var(--border)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {dashboardFr.overview.cards.eventsToday} ({windowLabel})
          </p>
          <p className="font-display text-4xl tracking-wider mt-2">
            {summary.cards.eventsInWindow}
          </p>
        </article>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <OverviewChart data={summary.topViewed} />
        </div>
        <ClearAnalyticsForm action={clearAnalyticsAction.bind(null, token)} />
      </div>

      {summary.groupedEvents.length > 0 ? (
        <section className="border border-[var(--border)] p-4">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-4">
            {dashboardFr.overview.groupedEvents} ({windowLabel})
          </p>
          <ul className="grid sm:grid-cols-3 gap-3 text-sm">
            {summary.groupedEvents.map((row) => (
              <li
                key={row.event}
                className="border border-[var(--border)]/60 px-3 py-2 flex justify-between gap-2"
              >
                <span>{analyticsEventLabelFr(row.event)}</span>
                <span className="font-display text-lg">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border border-[var(--border)] p-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-4">
          {dashboardFr.overview.recentEvents}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left border-b border-[var(--border)]">
                <th className="py-2 pr-4">{dashboardFr.overview.event}</th>
                <th className="py-2 pr-4">{dashboardFr.overview.article}</th>
                <th className="py-2 pr-4">{dashboardFr.overview.locale}</th>
                <th className="py-2">{dashboardFr.overview.time}</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <td className="py-2 pr-4">{analyticsEventLabelFr(event.event)}</td>
                  <td className="py-2 pr-4 align-top">
                    {event.productNameFr ? (
                      <div>
                        <p className="font-medium">{event.productNameFr}</p>
                        {event.productId ? (
                          <p className="text-xs text-[var(--muted)] mt-0.5">{event.productId}</p>
                        ) : null}
                      </div>
                    ) : (
                      dashboardFr.overview.emptyValue
                    )}
                  </td>
                  <td className="py-2 pr-4">{localeLabelFr(event.locale)}</td>
                  <td className="py-2">{new Date(event.createdAt).toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
