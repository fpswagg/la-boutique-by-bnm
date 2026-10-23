import { NextResponse } from "next/server";
import { getProductById, recordProductView, writesEnabled } from "@/lib/sss";

/** A product page was opened (sent once per visit by the page). Counted in SSS product metadata. */
const seen = new Map<string, number>();

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown; locale?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.slice(0, 120) : "";
  const locale = typeof body?.locale === "string" ? body.locale.slice(0, 5) : "fr";
  if (!id || !writesEnabled()) return NextResponse.json({ ok: false });

  // Same visitor + same product within 30 min = one view.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "local";
  const key = `${ip}|${id}`;
  const now = Date.now();
  if (now - (seen.get(key) ?? 0) < 30 * 60_000) return NextResponse.json({ ok: true });
  seen.set(key, now);
  if (seen.size > 5000) seen.clear();

  const product = await getProductById(id);
  if (!product) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    await recordProductView(product.sssId, locale);
  } catch (err) {
    console.error("[view]", err);
  }
  return NextResponse.json({ ok: true });
}
