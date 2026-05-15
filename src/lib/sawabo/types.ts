export const SAWABO_WEBHOOK_ACTIONS = [
  "ping",
  "get_status",
  "get_groups",
  "get_jobs",
  "get_activity",
  "send_text",
  "send_media",
  "post_product",
  "post_products",
  "create_job",
  "cancel_job",
  "pause_job",
  "resume_job",
  "run_job_now",
  "notify_order",
  "notify_restock",
  "notify_custom",
] as const;

export type SawaboWebhookAction = (typeof SAWABO_WEBHOOK_ACTIONS)[number];

export type SawaboRequestStatus = "pending" | "accepted" | "done" | "failed";

export type SawaboWebhookEnvelope = {
  action: string;
  requestId?: string;
  data: Record<string, unknown>;
};

export type SawaboSyncResponse = {
  ok: true;
  requestId?: string;
  action: string;
  status: "done";
  result: unknown;
};

export type SawaboAsyncAccepted = {
  ok: true;
  requestId?: string;
  action: string;
  status: "accepted";
};

export type SawaboErrorResponse = {
  ok: false;
  error: { code: string; message: string };
};

export type SawaboWebhookResponse = SawaboSyncResponse | SawaboAsyncAccepted | SawaboErrorResponse;

export type SawaboCallbackPayload = {
  requestId?: string;
  action: string;
  status: "done" | "failed";
  result?: unknown;
  error?: { code: string; message: string };
};

export function isSawaboWebhookAction(value: string): value is SawaboWebhookAction {
  return (SAWABO_WEBHOOK_ACTIONS as readonly string[]).includes(value);
}

export const SAWABO_ACTION_DEFAULT_DATA: Record<SawaboWebhookAction, Record<string, unknown>> = {
  ping: {},
  get_status: {},
  get_groups: {},
  get_jobs: { limit: 50 },
  get_activity: { limit: 50 },
  send_text: { text: "Bonjour depuis La Boutique", groupIds: [] },
  send_media: { imageUrl: "", caption: "", groupIds: [] },
  post_product: { productId: "", groupIds: [], attachProductUrl: true },
  post_products: { productIds: [], groupIds: [] },
  create_job: { kind: "POST_NOW", productIds: [], groupIds: [] },
  cancel_job: { jobId: "" },
  pause_job: { jobId: "" },
  resume_job: { jobId: "" },
  run_job_now: { jobId: "" },
  notify_order: {
    orderId: "",
    productName: "",
    quantity: 1,
    groupIds: [],
  },
  notify_restock: { productId: "", productName: "", groupIds: [] },
  notify_custom: { template: "Message {{name}}", vars: { name: "Boutique" }, groupIds: [] },
};
