import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createRequestId } from "@/lib/sawabo/crypto";
import { dispatchSawaboWebhook } from "@/lib/sawabo/webhook-client";
import {
  isSawaboWebhookAction,
  type SawaboRequestStatus,
  type SawaboWebhookAction,
  type SawaboWebhookEnvelope,
  type SawaboWebhookResponse,
} from "@/lib/sawabo/types";

export type SawaboSessionConfigView = {
  id: string;
  sessionKey: string;
  botBaseUrl: string;
  webhookSecretMasked: string;
  callbackUrl: string | null;
  callbackSecretMasked: string | null;
  enabled: boolean;
  maxRequestsPerHour: number;
  defaultGroupIds: string[];
  allowedActions: string[];
  updatedAt: string;
};

function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}…${value.slice(-2)}`;
}

function envConfigSeed() {
  return {
    sessionKey: process.env.SAWABO_SESSION_KEY ?? "",
    botBaseUrl: process.env.SAWABO_BOT_BASE_URL ?? process.env.SAWABO_WEBHOOK_BASE_URL ?? "",
    webhookSecret: process.env.SAWABO_WEBHOOK_SECRET ?? "",
    callbackUrl:
      process.env.SAWABO_CALLBACK_URL ??
      (process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/sawabo/callback`
        : null),
    callbackSecret: process.env.SAWABO_CALLBACK_SECRET ?? process.env.SAWABO_WEBHOOK_SECRET ?? null,
    enabled: process.env.SAWABO_ENABLED !== "false",
    maxRequestsPerHour: Number(process.env.SAWABO_MAX_REQUESTS_PER_HOUR ?? 60),
    defaultGroupIds: (process.env.SAWABO_DEFAULT_GROUP_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    allowedActions: [] as string[],
  };
}

export async function getOrCreateSawaboConfig() {
  const existing = await db.sawaboSessionConfig.findUnique({ where: { id: "default" } });
  if (existing) return existing;

  const seed = envConfigSeed();
  return db.sawaboSessionConfig.create({
    data: {
      id: "default",
      sessionKey: seed.sessionKey || "default-session",
      botBaseUrl: seed.botBaseUrl || "http://localhost:3001",
      webhookSecret: seed.webhookSecret || "change-me",
      callbackUrl: seed.callbackUrl,
      callbackSecret: seed.callbackSecret,
      enabled: seed.enabled,
      maxRequestsPerHour: seed.maxRequestsPerHour,
      defaultGroupIds: seed.defaultGroupIds,
      allowedActions: seed.allowedActions,
    },
  });
}

export function toSawaboConfigView(row: Awaited<ReturnType<typeof getOrCreateSawaboConfig>>): SawaboSessionConfigView {
  return {
    id: row.id,
    sessionKey: row.sessionKey,
    botBaseUrl: row.botBaseUrl,
    webhookSecretMasked: maskSecret(row.webhookSecret) ?? "—",
    callbackUrl: row.callbackUrl,
    callbackSecretMasked: maskSecret(row.callbackSecret),
    enabled: row.enabled,
    maxRequestsPerHour: row.maxRequestsPerHour,
    defaultGroupIds: row.defaultGroupIds,
    allowedActions: row.allowedActions,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateSawaboConfig(input: {
  sessionKey?: string;
  botBaseUrl?: string;
  webhookSecret?: string;
  callbackUrl?: string | null;
  callbackSecret?: string | null;
  enabled?: boolean;
  maxRequestsPerHour?: number;
  defaultGroupIds?: string[];
  allowedActions?: string[];
}) {
  await getOrCreateSawaboConfig();
  const data: Prisma.SawaboSessionConfigUpdateInput = {};
  if (input.sessionKey !== undefined) data.sessionKey = input.sessionKey;
  if (input.botBaseUrl !== undefined) data.botBaseUrl = input.botBaseUrl;
  if (input.webhookSecret !== undefined && input.webhookSecret.trim()) {
    data.webhookSecret = input.webhookSecret.trim();
  }
  if (input.callbackUrl !== undefined) data.callbackUrl = input.callbackUrl;
  if (input.callbackSecret !== undefined) {
    data.callbackSecret = input.callbackSecret?.trim() || null;
  }
  if (input.enabled !== undefined) data.enabled = input.enabled;
  if (input.maxRequestsPerHour !== undefined) data.maxRequestsPerHour = input.maxRequestsPerHour;
  if (input.defaultGroupIds !== undefined) data.defaultGroupIds = input.defaultGroupIds;
  if (input.allowedActions !== undefined) data.allowedActions = input.allowedActions;

  return db.sawaboSessionConfig.update({ where: { id: "default" }, data });
}

async function countRecentRequests(): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  return db.sawaboWebhookRequest.count({ where: { createdAt: { gte: since } } });
}

function normalizeStatus(
  httpStatus: number,
  body: SawaboWebhookResponse | Record<string, unknown>,
): { status: SawaboRequestStatus; execution: "sync" | "async" } {
  if (httpStatus === 202) return { status: "accepted", execution: "async" };
  if (httpStatus >= 200 && httpStatus < 300) {
    const status = (body as { status?: string }).status;
    if (status === "accepted") return { status: "accepted", execution: "async" };
    return { status: "done", execution: "sync" };
  }
  return { status: "failed", execution: "sync" };
}

export async function executeSawaboAction(input: {
  action: string;
  data?: Record<string, unknown>;
  requestId?: string;
  idempotencyKey?: string;
}) {
  const config = await getOrCreateSawaboConfig();
  if (!config.enabled) {
    throw new Error("Sawabo integration is disabled.");
  }
  if (!isSawaboWebhookAction(input.action)) {
    throw new Error(`Unsupported action: ${input.action}`);
  }
  if (
    config.allowedActions.length > 0 &&
    !config.allowedActions.includes(input.action)
  ) {
    throw new Error(`Action not allowed: ${input.action}`);
  }

  const recent = await countRecentRequests();
  if (recent >= config.maxRequestsPerHour) {
    throw new Error("Rate limit exceeded for Sawabo webhook requests.");
  }

  const requestId = input.requestId?.trim() || input.idempotencyKey?.trim() || createRequestId();

  const existing = await db.sawaboWebhookRequest.findUnique({ where: { requestId } });
  if (existing && (existing.status === "done" || existing.status === "accepted")) {
    return {
      reused: true as const,
      request: existing,
    };
  }

  const envelope: SawaboWebhookEnvelope = {
    action: input.action,
    requestId,
    data: input.data ?? {},
  };

  await db.sawaboWebhookRequest.upsert({
    where: { requestId },
    create: {
      requestId,
      action: input.action,
      data: envelope.data as Prisma.InputJsonValue,
      status: "pending",
      execution: "sync",
    },
    update: {
      action: input.action,
      data: envelope.data as Prisma.InputJsonValue,
      status: "pending",
      error: Prisma.DbNull,
      result: Prisma.DbNull,
      completedAt: null,
    },
  });

  let httpStatus = 0;
  let body: SawaboWebhookResponse | Record<string, unknown> = {};
  let raw = "";

  try {
    const dispatch = await dispatchSawaboWebhook({
      botBaseUrl: config.botBaseUrl,
      sessionKey: config.sessionKey,
      webhookSecret: config.webhookSecret,
      envelope,
    });
    httpStatus = dispatch.httpStatus;
    body = dispatch.body;
    raw = dispatch.raw;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dispatch failed";
    const updated = await db.sawaboWebhookRequest.update({
      where: { requestId },
      data: {
        status: "failed",
        httpStatus: 0,
        error: { code: "network_error", message } as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
    return { reused: false as const, request: updated, httpStatus: 0, body: { ok: false, error: { code: "network_error", message } }, raw: "" };
  }

  const { status, execution } = normalizeStatus(httpStatus, body);
  const isOk = (body as { ok?: boolean }).ok !== false && status !== "failed";

  const updated = await db.sawaboWebhookRequest.update({
    where: { requestId },
    data: {
      status: isOk ? status : "failed",
      httpStatus,
      execution,
      result: isOk && "result" in body ? (body.result as Prisma.InputJsonValue) : Prisma.DbNull,
      error:
        !isOk && "error" in body
          ? ((body as { error: unknown }).error as Prisma.InputJsonValue)
          : !isOk
            ? ({ code: "http_error", message: raw.slice(0, 500) } as Prisma.InputJsonValue)
            : Prisma.DbNull,
      completedAt: status === "done" || status === "failed" ? new Date() : null,
    },
  });

  return { reused: false as const, request: updated, httpStatus, body, raw };
}

export async function ingestSawaboCallback(input: {
  rawBody: string;
  signatureHeader: string | null;
  payload: {
    requestId?: string;
    action: string;
    status: "done" | "failed";
    result?: unknown;
    error?: unknown;
  };
  signatureValid: boolean;
}) {
  const requestId = input.payload.requestId;
  if (!requestId) {
    throw new Error("Missing requestId in callback payload.");
  }

  await db.sawaboWebhookCallback.create({
    data: {
      requestId,
      action: input.payload.action,
      status: input.payload.status,
      payload: input.payload as Prisma.InputJsonValue,
      signatureValid: input.signatureValid,
    },
  });

  const requestStatus: SawaboRequestStatus =
    input.payload.status === "done" ? "done" : "failed";

  await db.sawaboWebhookRequest.updateMany({
    where: { requestId },
    data: {
      status: requestStatus,
      result:
        input.payload.status === "done" && input.payload.result !== undefined
          ? (input.payload.result as Prisma.InputJsonValue)
          : undefined,
      error:
        input.payload.status === "failed"
          ? ((input.payload.error ?? { code: "callback_failed", message: "Callback failed" }) as Prisma.InputJsonValue)
          : undefined,
      completedAt: new Date(),
    },
  });
}

export async function listSawaboRequests(options?: {
  limit?: number;
  action?: string;
  status?: string;
}) {
  const limit = options?.limit ?? 50;
  return db.sawaboWebhookRequest.findMany({
    where: {
      ...(options?.action ? { action: options.action } : {}),
      ...(options?.status ? { status: options.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      callbacks: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });
}

export async function listSawaboCallbacks(limit = 50) {
  return db.sawaboWebhookCallback.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getSawaboOperationalStats(windowHours = 24) {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const requests = await db.sawaboWebhookRequest.findMany({
    where: { createdAt: { gte: since } },
    select: { status: true, action: true },
  });

  const total = requests.length;
  const done = requests.filter((r) => r.status === "done").length;
  const failed = requests.filter((r) => r.status === "failed").length;
  const pending = requests.filter((r) => r.status === "pending" || r.status === "accepted").length;

  const byAction = new Map<string, { total: number; failed: number }>();
  for (const row of requests) {
    const current = byAction.get(row.action) ?? { total: 0, failed: 0 };
    current.total += 1;
    if (row.status === "failed") current.failed += 1;
    byAction.set(row.action, current);
  }

  return {
    windowHours,
    total,
    done,
    failed,
    pending,
    successRate: total > 0 ? Math.round((done / total) * 100) : 0,
    byAction: Array.from(byAction.entries())
      .map(([action, stats]) => ({ action, ...stats }))
      .sort((a, b) => b.total - a.total),
  };
}

// Legacy external request queue (replaces data/sawabo.json requests section)
export async function listExternalRequests() {
  return db.sawaboExternalRequest.findMany({ orderBy: { requestedAt: "desc" } });
}

export async function createExternalRequest(input: {
  id: string;
  type: string;
  priority?: string;
  requestedBy?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}) {
  return db.sawaboExternalRequest.create({
    data: {
      id: input.id,
      type: input.type,
      priority: input.priority ?? "normal",
      requestedBy: (input.requestedBy ?? {}) as Prisma.InputJsonValue,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function updateExternalRequestStatus(input: {
  id: string;
  status: string;
  reviewNote?: string;
}) {
  return db.sawaboExternalRequest.update({
    where: { id: input.id },
    data: {
      status: input.status,
      reviewNote: input.reviewNote,
      reviewedAt: new Date(),
    },
  });
}

export async function getPublishedProductsForSawabo() {
  return db.product.findMany({
    where: { status: "published" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      nameFr: true,
      price: true,
      currency: true,
      stock: true,
      images: true,
      tags: true,
    },
  });
}

export type { SawaboWebhookAction };
