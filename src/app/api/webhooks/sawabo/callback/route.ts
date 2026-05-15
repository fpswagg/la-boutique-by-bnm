import { NextResponse } from "next/server";
import { verifySawaboSignature } from "@/lib/sawabo/crypto";
import { getOrCreateSawaboConfig, ingestSawaboCallback } from "@/lib/sawabo/service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("X-Sawabo-Callback-Signature");

  let payload: {
    requestId?: string;
    action: string;
    status: "done" | "failed";
    result?: unknown;
    error?: unknown;
  };

  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!payload?.action || (payload.status !== "done" && payload.status !== "failed")) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const config = await getOrCreateSawaboConfig();
  const secret = config.callbackSecret ?? config.webhookSecret;
  const signatureValid = verifySawaboSignature(rawBody, secret, signatureHeader);

  if (!signatureValid) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  try {
    await ingestSawaboCallback({
      rawBody,
      signatureHeader,
      payload,
      signatureValid: true,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "callback_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
