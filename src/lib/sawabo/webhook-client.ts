import { signSawaboBody } from "@/lib/sawabo/crypto";
import type { SawaboWebhookEnvelope, SawaboWebhookResponse } from "@/lib/sawabo/types";

export type DispatchWebhookInput = {
  botBaseUrl: string;
  sessionKey: string;
  webhookSecret: string;
  envelope: SawaboWebhookEnvelope;
};

export async function dispatchSawaboWebhook(
  input: DispatchWebhookInput,
): Promise<{ httpStatus: number; body: SawaboWebhookResponse | Record<string, unknown>; raw: string }> {
  const base = input.botBaseUrl.replace(/\/$/, "");
  const url = `${base}/api/webhook/sawabo/${encodeURIComponent(input.sessionKey)}`;
  const body = JSON.stringify({
    action: input.envelope.action,
    requestId: input.envelope.requestId,
    data: input.envelope.data ?? {},
  });
  const signature = signSawaboBody(body, input.webhookSecret);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sawabo-Signature": signature,
    },
    body,
    cache: "no-store",
  });

  const raw = await response.text();
  let parsed: SawaboWebhookResponse | Record<string, unknown> = {};
  try {
    parsed = raw ? (JSON.parse(raw) as SawaboWebhookResponse) : {};
  } catch {
    parsed = { ok: false, error: { code: "invalid_json", message: raw.slice(0, 500) } };
  }

  return { httpStatus: response.status, body: parsed, raw };
}
