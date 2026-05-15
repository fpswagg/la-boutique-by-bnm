import { dashboardFr } from "@/lib/dashboard/fr";
import {
  getOrCreateSawaboConfig,
  getPublishedProductsForSawabo,
  getSawaboOperationalStats,
  listSawaboCallbacks,
  listSawaboRequests,
  toSawaboConfigView,
} from "@/lib/sawabo/service";
import { SawaboIntegration } from "../../_components/SawaboIntegration";
import {
  dispatchSawaboWebhookAction,
  quickSawaboPingAction,
  runSawaboShortcutAction,
  updateSawaboConfigAction,
} from "./actions";

export default async function SawaboIntegrationPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;
  const [configRow, requests, callbacks, stats, products] = await Promise.all([
    getOrCreateSawaboConfig(),
    listSawaboRequests({ limit: 40 }),
    listSawaboCallbacks(40),
    getSawaboOperationalStats(24),
    getPublishedProductsForSawabo(),
  ]);

  const config = toSawaboConfigView(configRow);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
          {dashboardFr.sawabo.accent}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl tracking-wider">{dashboardFr.sawabo.title}</h2>
        <p className="text-sm text-[var(--muted)] mt-2">{dashboardFr.sawabo.subtitle}</p>
      </div>

      <SawaboIntegration
        token={token}
        config={config}
        requests={requests.map((row) => ({
          requestId: row.requestId,
          action: row.action,
          status: row.status,
          httpStatus: row.httpStatus,
          execution: row.execution,
          createdAt: row.createdAt.toISOString(),
          completedAt: row.completedAt?.toISOString() ?? null,
        }))}
        callbacks={callbacks.map((row) => ({
          requestId: row.requestId,
          action: row.action,
          status: row.status,
          signatureValid: row.signatureValid,
          createdAt: row.createdAt.toISOString(),
        }))}
        stats={stats}
        products={products.map((p) => ({ id: p.id, nameFr: p.nameFr }))}
        updateConfigAction={updateSawaboConfigAction.bind(null, token)}
        dispatchAction={dispatchSawaboWebhookAction.bind(null, token)}
        quickPingAction={quickSawaboPingAction.bind(null, token)}
        runShortcutAction={runSawaboShortcutAction.bind(null, token)}
      />
    </div>
  );
}
