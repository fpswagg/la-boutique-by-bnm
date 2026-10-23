import { NextResponse } from "next/server";
import { createWebOrder, findOrCreateClient, getAllProducts, getStoreConfig, sendContact, writesEnabled, type OrderLine } from "@/lib/sss";
import { formatPrice } from "@/lib/products";

/**
 * Cart → SSS, just before WhatsApp opens. The cart is checked against the live
 * catalogue (prices are never taken from the browser). The order lands in
 * SSS → Commandes (status pending) and the team gets a message in SSS.
 * The reply carries the order number added to the WhatsApp message.
 */

const WINDOW_MS = 10 * 60_000;
const LIMIT = 6;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

function orderRef(): string {
  const tail = (Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4)).toUpperCase();
  return `BNM-${tail}`;
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "local";
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = (key: string, max: number) => (typeof body?.[key] === "string" ? (body[key] as string).trim().slice(0, max) : "");

  if (text("website", 200)) return NextResponse.json({ ref: null }); // honeypot
  if (limited(ip)) return NextResponse.json({ error: "Trop de commandes, réessayez dans quelques minutes." }, { status: 429 });

  const locale = ["fr", "en", "tr"].includes(text("locale", 5)) ? text("locale", 5) : "fr";
  const name = text("name", 120);
  const phone = text("phone", 30);
  const raw = Array.isArray(body?.items) ? (body.items as Array<{ id?: unknown; qty?: unknown }>).slice(0, 40) : [];
  const catalogue = await getAllProducts();

  const lines: OrderLine[] = [];
  for (const item of raw) {
    if (typeof item?.id !== "string") continue;
    const p = catalogue.find((x) => x.id === item.id);
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
    lines.push({ productId: p.sssId, sku: p.id, name: p.name.fr, qty, unitPrice: p.price ?? 0, currency: p.currency, ...(p.price === null ? { priceOnRequest: true } : {}) });
  }
  if (!lines.length) return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  if (!writesEnabled()) return NextResponse.json({ ref: null });

  const total = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  const currency = lines[0]!.currency;
  const ref = orderRef();
  const clientName = name || "Client du site web";
  const message = [
    `Commande ${ref} (site web, ${locale.toUpperCase()})`,
    "",
    ...lines.map((l) => `• ${l.name} × ${l.qty} — ${l.priceOnRequest ? "prix sur demande" : formatPrice(l.unitPrice * l.qty, l.currency)}`),
    "",
    `Total : ${total > 0 ? formatPrice(total, currency) : "à confirmer"}${lines.some((l) => l.priceOnRequest) ? " (+ articles sur demande)" : ""}`,
    phone ? `WhatsApp : ${phone}` : "Le client finit la commande sur WhatsApp.",
  ].join("\n");

  try {
    const client = name || phone ? await findOrCreateClient({ name: clientName, phone, notes: "Client du site web" }) : null;
    await createWebOrder({ ref, client, clientName, lines, total, currency, notes: phone ? `WhatsApp : ${phone}` : "", metadata: { locale } });
    const store = await getStoreConfig();
    await sendContact({ name: clientName, phone: phone || undefined, message, createClient: false }).catch(() => undefined);
    return NextResponse.json({ ref, phone: store.phone });
  } catch (err) {
    console.error("[order]", err);
    // WhatsApp still opens: the order is never lost for the customer.
    return NextResponse.json({ ref: null });
  }
}
