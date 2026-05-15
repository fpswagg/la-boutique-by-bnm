"use server";

import { revalidatePath } from "next/cache";
import { dashboardFr } from "@/lib/dashboard/fr";
import {
  executeSawaboShortcut,
  executeSawaboAction,
  getOrCreateSawaboConfig,
  toSawaboConfigView,
  updateSawaboConfig,
} from "@/lib/sawabo/service";
import type { SawaboShortcutKey } from "@/lib/sawabo/service";

function assertToken(token: string) {
  const secret = process.env.DASHBOARD_PASSWORD;
  if (!secret || token !== secret) {
    throw new Error(dashboardFr.errors.unauthorized);
  }
}

function revalidateSawabo(token: string) {
  revalidatePath(`/dashboard/${token}/integrations/sawabo`);
  revalidatePath(`/dashboard/${token}`);
}

export async function updateSawaboConfigAction(token: string, formData: FormData) {
  assertToken(token);

  const defaultGroupIds = String(formData.get("defaultGroupIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedActions = String(formData.get("allowedActions") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await updateSawaboConfig({
    sessionKey: String(formData.get("sessionKey") ?? "").trim() || undefined,
    botBaseUrl: String(formData.get("botBaseUrl") ?? "").trim() || undefined,
    webhookSecret: String(formData.get("webhookSecret") ?? "").trim() || undefined,
    callbackUrl: String(formData.get("callbackUrl") ?? "").trim() || null,
    callbackSecret: String(formData.get("callbackSecret") ?? "").trim() || null,
    enabled: formData.get("enabled") === "on",
    maxRequestsPerHour: Number(formData.get("maxRequestsPerHour") ?? 60) || 60,
    defaultGroupIds,
    allowedActions,
  });

  revalidateSawabo(token);
}

export async function dispatchSawaboWebhookAction(token: string, formData: FormData) {
  assertToken(token);

  const action = String(formData.get("action") ?? "").trim();
  const requestId = String(formData.get("requestId") ?? "").trim() || undefined;
  const payloadRaw = String(formData.get("payload") ?? "{}").trim();

  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(payloadRaw) as Record<string, unknown>;
  } catch {
    throw new Error(dashboardFr.sawabo.errors.invalidJson);
  }

  const result = await executeSawaboAction({ action, data, requestId });
  revalidateSawabo(token);

  return {
    reused: result.reused,
    requestId: result.request.requestId,
    status: result.request.status,
    httpStatus: ("httpStatus" in result ? result.httpStatus : null) ?? null,
    body: ("body" in result ? result.body : null) ?? null,
  };
}

export async function quickSawaboPingAction(token: string) {
  assertToken(token);
  const result = await executeSawaboAction({ action: "ping", data: {} });
  revalidateSawabo(token);
  return { requestId: result.request.requestId, status: result.request.status };
}

export async function getSawaboConfigSnapshotAction(token: string) {
  assertToken(token);
  const row = await getOrCreateSawaboConfig();
  return toSawaboConfigView(row);
}

export async function runSawaboShortcutAction(
  token: string,
  shortcut: SawaboShortcutKey,
  productId?: string,
) {
  assertToken(token);
  const result = await executeSawaboShortcut({ shortcut, productId });
  revalidateSawabo(token);
  return {
    requestId: result.request.requestId,
    status: result.request.status,
    reused: result.reused,
    httpStatus: ("httpStatus" in result ? result.httpStatus : null) ?? null,
  };
}
