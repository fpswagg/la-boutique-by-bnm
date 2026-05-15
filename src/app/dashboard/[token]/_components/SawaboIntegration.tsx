"use client";

import { useMemo, useState, useTransition } from "react";
import {
  SAWABO_ACTION_DEFAULT_DATA,
  SAWABO_WEBHOOK_ACTIONS,
  type SawaboWebhookAction,
} from "@/lib/sawabo/types";
import { dashboardFr, sawaboStatusLabelFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "./DashboardForm";
import { DashboardSubmitButton } from "./DashboardSubmitButton";

type TabId = "console" | "sessions" | "groups" | "jobs" | "activity";

type ConfigView = {
  sessionKey: string;
  botBaseUrl: string;
  callbackUrl: string | null;
  enabled: boolean;
  maxRequestsPerHour: number;
  defaultGroupIds: string[];
  allowedActions: string[];
  webhookSecretMasked: string;
  callbackSecretMasked: string | null;
};

type RequestRow = {
  requestId: string;
  action: string;
  status: string;
  httpStatus: number | null;
  execution: string;
  createdAt: string;
  completedAt: string | null;
};

type CallbackRow = {
  requestId: string;
  action: string;
  status: string;
  signatureValid: boolean;
  createdAt: string;
};

type ProductOption = { id: string; nameFr: string };

type Stats = {
  total: number;
  done: number;
  failed: number;
  pending: number;
  successRate: number;
  byAction: { action: string; total: number; failed: number }[];
};

type Props = {
  token: string;
  config: ConfigView;
  requests: RequestRow[];
  callbacks: CallbackRow[];
  stats: Stats;
  products: ProductOption[];
  updateConfigAction: (formData: FormData) => Promise<void>;
  dispatchAction: (formData: FormData) => Promise<{
    requestId: string;
    status: string;
    httpStatus?: number | null;
    body?: unknown;
  }>;
  quickPingAction: () => Promise<{ requestId: string; status: string }>;
};

const TAB_ACTIONS: Record<TabId, SawaboWebhookAction[]> = {
  console: [...SAWABO_WEBHOOK_ACTIONS],
  sessions: ["ping", "get_status"],
  groups: ["get_groups", "send_text", "send_media", "post_product", "post_products"],
  jobs: [
    "get_jobs",
    "create_job",
    "pause_job",
    "resume_job",
    "run_job_now",
    "cancel_job",
  ],
  activity: ["get_activity"],
};

export function SawaboIntegration({
  token,
  config,
  requests,
  callbacks,
  stats,
  products,
  updateConfigAction,
  dispatchAction,
  quickPingAction,
}: Props) {
  const [tab, setTab] = useState<TabId>("console");
  const [action, setAction] = useState<SawaboWebhookAction>("ping");
  const [payload, setPayload] = useState(
    JSON.stringify(SAWABO_ACTION_DEFAULT_DATA.ping, null, 2),
  );
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [isPinging, startPing] = useTransition();

  const tabActions = TAB_ACTIONS[tab];

  const statusClass = (status: string) => {
    if (status === "done") return "text-emerald-400";
    if (status === "failed") return "text-red-400";
    if (status === "accepted" || status === "pending") return "text-amber-400";
    return "text-[var(--muted)]";
  };

  const onActionChange = (next: SawaboWebhookAction) => {
    setAction(next);
    setPayload(JSON.stringify(SAWABO_ACTION_DEFAULT_DATA[next], null, 2));
  };

  const bindProduct = (productId: string) => {
    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      if (action === "post_product") {
        parsed.productId = productId;
      } else if (action === "post_products") {
        parsed.productIds = [productId];
      } else if (action === "notify_restock") {
        const product = products.find((p) => p.id === productId);
        parsed.productId = productId;
        if (product) parsed.productName = product.nameFr;
      }
      setPayload(JSON.stringify(parsed, null, 2));
    } catch {
      setPayload(JSON.stringify({ productId }, null, 2));
    }
  };

  const tabs: { id: TabId; label: string }[] = useMemo(
    () => [
      { id: "console", label: dashboardFr.sawabo.tabs.console },
      { id: "sessions", label: dashboardFr.sawabo.tabs.sessions },
      { id: "groups", label: dashboardFr.sawabo.tabs.groups },
      { id: "jobs", label: dashboardFr.sawabo.tabs.jobs },
      { id: "activity", label: dashboardFr.sawabo.tabs.activity },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              const first = TAB_ACTIONS[item.id][0];
              if (first) onActionChange(first);
            }}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
              tab === item.id
                ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--fg)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "sessions" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border border-[var(--border)] p-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
              {dashboardFr.sawabo.sessions.connectivity}
            </p>
            <p className="text-sm text-[var(--muted)]">
              Secret webhook : {config.webhookSecretMasked}
              <br />
              Secret callback : {config.callbackSecretMasked ?? "—"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPinging}
                onClick={() =>
                  startPing(async () => {
                    const res = await quickPingAction();
                    setLastResult(JSON.stringify(res, null, 2));
                  })
                }
                className="border border-[var(--border)] px-3 py-2 text-xs uppercase tracking-wider hover:border-[var(--fg)] disabled:opacity-50"
              >
                {dashboardFr.sawabo.actions.ping}
              </button>
            </div>
          </div>

          <DashboardForm
            action={updateConfigAction}
            className="border border-[var(--border)] p-4 space-y-3"
          >
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
              {dashboardFr.sawabo.sessions.config}
            </p>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.sessionKey}</span>
              <input
                name="sessionKey"
                defaultValue={config.sessionKey}
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.botBaseUrl}</span>
              <input
                name="botBaseUrl"
                defaultValue={config.botBaseUrl}
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.webhookSecret}</span>
              <input
                name="webhookSecret"
                type="password"
                placeholder="Laisser vide pour conserver"
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.callbackUrl}</span>
              <input
                name="callbackUrl"
                defaultValue={config.callbackUrl ?? ""}
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.callbackSecret}</span>
              <input
                name="callbackSecret"
                type="password"
                placeholder="Laisser vide pour conserver"
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="enabled" type="checkbox" defaultChecked={config.enabled} />
              {dashboardFr.sawabo.fields.enabled}
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.maxRequestsPerHour}</span>
              <input
                name="maxRequestsPerHour"
                type="number"
                min={1}
                defaultValue={config.maxRequestsPerHour}
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.defaultGroupIds}</span>
              <input
                name="defaultGroupIds"
                defaultValue={config.defaultGroupIds.join(", ")}
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.allowedActions}</span>
              <input
                name="allowedActions"
                defaultValue={config.allowedActions.join(", ")}
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </label>
            <DashboardSubmitButton
              label={dashboardFr.sawabo.actions.saveConfig}
              pendingLabel={dashboardFr.loading.savingConfig}
            />
          </DashboardForm>
        </section>
      ) : null}

      {tab !== "sessions" && tab !== "activity" ? (
        <DashboardForm
          action={async (formData) => {
            formData.set("action", action);
            formData.set("payload", payload);
            const res = await dispatchAction(formData);
            setLastResult(
              JSON.stringify(
                {
                  requestId: res.requestId,
                  status: res.status,
                  httpStatus: res.httpStatus,
                  body: res.body,
                },
                null,
                2,
              ),
            );
          }}
          className="border border-[var(--border)] p-4 space-y-4"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.action}</span>
              <select
                value={action}
                onChange={(e) => onActionChange(e.target.value as SawaboWebhookAction)}
                className="mt-1 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              >
                {tabActions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.requestId}</span>
              <input
                name="requestId"
                placeholder="optionnel"
                className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
              />
            </label>
          </div>

          {tab === "groups" && products.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--muted)]">{dashboardFr.sawabo.groups.productsHint}</p>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 12).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => bindProduct(product.id)}
                    className="border border-[var(--border)] px-2 py-1 text-xs hover:border-[var(--fg)]"
                  >
                    {product.nameFr}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block text-sm">
            <span className="text-[var(--muted)]">{dashboardFr.sawabo.fields.payload}</span>
            <textarea
              name="payloadEditor"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={12}
              className="mt-1 w-full border border-[var(--border)] bg-transparent px-3 py-2 font-mono text-xs"
            />
          </label>

          <DashboardSubmitButton
            label={dashboardFr.sawabo.actions.send}
            pendingLabel={dashboardFr.loading.sendingWebhook}
          />

          {lastResult ? (
            <div className="border border-[var(--border)]/60 p-3">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
                {dashboardFr.sawabo.console.lastResult}
              </p>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{lastResult}</pre>
            </div>
          ) : null}
        </DashboardForm>
      ) : null}

      {tab === "activity" ? (
        <section className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <article className="border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--muted)]">{dashboardFr.sawabo.activity.successRate}</p>
              <p className="font-display text-3xl mt-2">{stats.successRate}%</p>
            </article>
            <article className="border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--muted)]">{dashboardFr.sawabo.activity.pending}</p>
              <p className="font-display text-3xl mt-2">{stats.pending}</p>
            </article>
            <article className="border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--muted)]">{dashboardFr.sawabo.activity.failures}</p>
              <p className="font-display text-3xl mt-2">{stats.failed}</p>
            </article>
            <article className="border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--muted)]">{dashboardFr.overview.count}</p>
              <p className="font-display text-3xl mt-2">{stats.total}</p>
            </article>
          </div>

          {stats.byAction.length > 0 ? (
            <div className="border border-[var(--border)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">
                {dashboardFr.sawabo.activity.byAction}
              </p>
              <ul className="space-y-2 text-sm">
                {stats.byAction.map((row) => (
                  <li key={row.action} className="flex justify-between gap-4">
                    <span className="font-mono">{row.action}</span>
                    <span className="text-[var(--muted)]">
                      {row.total} · {row.failed} échec(s)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-[var(--border)] p-4 overflow-x-auto">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">
                {dashboardFr.sawabo.activity.requests}
              </p>
              {requests.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{dashboardFr.sawabo.empty}</p>
              ) : (
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-left border-b border-[var(--border)]">
                      <th className="py-2 pr-2">Action</th>
                      <th className="py-2 pr-2">Statut</th>
                      <th className="py-2">Quand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((row) => (
                      <tr key={row.requestId} className="border-b border-[var(--border)]/50">
                        <td className="py-2 pr-2 font-mono text-xs">{row.action}</td>
                        <td className={`py-2 pr-2 ${statusClass(row.status)}`}>
                          {sawaboStatusLabelFr(row.status)}
                        </td>
                        <td className="py-2 text-xs text-[var(--muted)]">
                          {new Date(row.createdAt).toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border border-[var(--border)] p-4 overflow-x-auto">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">
                {dashboardFr.sawabo.activity.callbacks}
              </p>
              {callbacks.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{dashboardFr.sawabo.empty}</p>
              ) : (
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="text-left border-b border-[var(--border)]">
                      <th className="py-2 pr-2">Action</th>
                      <th className="py-2 pr-2">Statut</th>
                      <th className="py-2">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callbacks.map((row, index) => (
                      <tr key={`${row.requestId}-${index}`} className="border-b border-[var(--border)]/50">
                        <td className="py-2 pr-2 font-mono text-xs">{row.action}</td>
                        <td className={`py-2 pr-2 ${statusClass(row.status)}`}>
                          {sawaboStatusLabelFr(row.status)}
                        </td>
                        <td className="py-2 text-xs">
                          {row.signatureValid ? "✓" : "✗"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <DashboardForm
            action={async (formData) => {
              formData.set("action", "get_activity");
              formData.set("payload", JSON.stringify({ limit: 50 }));
              const res = await dispatchAction(formData);
              setLastResult(JSON.stringify(res, null, 2));
            }}
            className="border border-[var(--border)] p-4"
          >
            <DashboardSubmitButton
              label={`${dashboardFr.sawabo.actions.refresh} (get_activity)`}
              pendingLabel={dashboardFr.loading.sendingWebhook}
            />
          </DashboardForm>
        </section>
      ) : null}

      <p className="text-xs text-[var(--muted)]">Token route : /dashboard/{token}/integrations/sawabo</p>
    </div>
  );
}

