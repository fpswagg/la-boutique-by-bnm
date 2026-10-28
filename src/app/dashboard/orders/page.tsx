import { dashOrders, ORDER_STATUSES, requireDash } from "@/lib/dashboard";
import { dashboardFr, orderStatusLabelFr } from "@/lib/dashboard/fr";
import { setOrderStatus } from "../actions";
import { DashboardForm } from "../_components/DashboardForm";
import { DashboardSubmitButton } from "../_components/DashboardSubmitButton";

function waLink(phone: string, ref: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  const full = digits.length === 9 ? `237${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(`Bonjour, au sujet de votre commande ${ref} chez La Boutique By BNM :`)}`;
}

export default async function DashboardOrdersPage({ searchParams: _searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await _searchParams;
  const ctx = await requireDash();
  const all = await dashOrders(ctx);
  const filter = searchParams.status && (ORDER_STATUSES as readonly string[]).includes(searchParams.status) ? searchParams.status : "";
  const orders = filter ? all.filter((o) => o.status === filter) : all;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">{dashboardFr.orders.accent}</p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{dashboardFr.orders.title}</h2>
        <p className="text-sm text-[var(--muted)] mt-3 max-w-2xl">{dashboardFr.orders.hint}</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wider">
        {["", ...ORDER_STATUSES].map((s) => {
          const count = s ? all.filter((o) => o.status === s).length : all.length;
          const active = s === filter;
          return (
            <a
              key={s || "all"}
              href={s ? `?status=${s}` : "?"}
              className={`border px-3 py-1.5 ${active ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--fg)]"}`}
            >
              {s ? orderStatusLabelFr(s) : "Toutes"} ({count})
            </a>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)] border border-[var(--border)] p-4">{dashboardFr.orders.empty}</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => {
            const wa = waLink(o.phone, o.ref);
            return (
              <article key={o.id} className="border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl tracking-wider">{o.ref}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {o.at ? new Date(o.at).toLocaleString("fr-FR", { timeZone: "Africa/Douala" }) : ""} ·{" "}
                      {dashboardFr.orders.sources[o.source as keyof typeof dashboardFr.orders.sources] ?? o.source}
                    </p>
                  </div>
                  <span className="px-2 py-1 border border-[var(--border)] text-xs uppercase tracking-wider">{orderStatusLabelFr(o.status)}</span>
                </div>
                <p className="text-sm">
                  {o.name || "—"}
                  {o.phone ? ` · ${o.phone}` : ""}
                  {wa ? (
                    <>
                      {" · "}
                      <a href={wa} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        {dashboardFr.orders.whatsapp}
                      </a>
                    </>
                  ) : null}
                </p>
                <ul className="text-sm space-y-1">
                  {o.lines.map((l, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>
                        {l.qty} × {l.name}
                      </span>
                      <span className="text-[var(--muted)]">
                        {l.priceOnRequest ? dashboardFr.products.onRequest : `${(l.unitPrice * l.qty).toLocaleString("fr-FR")} ${o.currency}`}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[var(--border)]/60 pt-3">
                  <p className="text-sm">
                    {dashboardFr.orders.total} : <strong>{o.total ? `${o.total.toLocaleString("fr-FR")} ${o.currency}` : dashboardFr.products.onRequest}</strong>
                    {o.lines.some((l) => l.priceOnRequest) && o.total ? ` + ${dashboardFr.products.onRequest.toLowerCase()}` : ""}
                  </p>
                  {ctx.canWrite ? (
                    <DashboardForm action={setOrderStatus.bind(null, o.id)} className="flex items-center gap-2">
                      <select name="status" defaultValue={o.status} className="min-h-10 px-2 border border-[var(--border)] bg-[var(--bg)] text-sm">
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {orderStatusLabelFr(s)}
                          </option>
                        ))}
                      </select>
                      <DashboardSubmitButton label={dashboardFr.orders.change} pendingLabel={dashboardFr.loading.saving} variant="compact" />
                    </DashboardForm>
                  ) : null}
                </div>
                {o.notes ? <p className="text-xs text-[var(--muted)] whitespace-pre-line">{o.notes}</p> : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
