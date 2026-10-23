import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "./config";
import { getAccessToken, getSession, safeNext, type SssBusiness, type SssSession } from "./sss-auth";
import { arr, DAYS, hoursFromProfile, obj, str, toProductRecord, today, type OpeningHourRecord, type ProductRecord, type Raw } from "./sss";

/**
 * Team dashboard (/dashboard). Read and written with the signed-in person's own SSS
 * access (Sign in with SSS), never with SSS_API_KEY: what they can do is what their
 * role in the business allows in SSS.
 */

const EARLY_REFRESH_MS = 60_000;

/** Did this person connect THIS business? */
export function dashboardBusiness(session: SssSession | null): SssBusiness | null {
  const b = session?.user.business;
  if (!b) return null;
  return b.id === config.storeSlug || b.slug === config.storeSlug ? b : null;
}

/** Edits need the "business" scope (read and write), not "business:read". */
export function canWrite(session: SssSession | null) {
  return Boolean(session?.scope.split(/\s+/).includes("business"));
}

export type DashContext = {
  session: SssSession;
  business: SssBusiness;
  base: string;
  token: string;
  canWrite: boolean;
};

export type DashState =
  | { kind: "ok"; ctx: DashContext }
  | { kind: "signed_out" }
  | { kind: "wrong_business"; session: SssSession };

/**
 * For pages (Server Components, read-only cookies): the live session, or why not.
 * An expired token goes through /auth/sss/refresh, which saves the new pair and comes back.
 */
export async function dashState(): Promise<DashState> {
  const session = await getSession();
  if (!session) return { kind: "signed_out" };
  const business = dashboardBusiness(session);
  if (!business) return { kind: "wrong_business", session };
  if (session.expiresAt - EARLY_REFRESH_MS <= Date.now()) {
    const here = headers().get("x-pathname");
    redirect(`/auth/sss/refresh?next=${encodeURIComponent(safeNext(here))}`);
  }
  return {
    kind: "ok",
    ctx: {
      session,
      business,
      base: `/api/v1/stores/${encodeURIComponent(business.id)}`,
      token: session.accessToken,
      canWrite: canWrite(session),
    },
  };
}

/** The page context, or back to the sign-in screen (the layout shows it). */
export async function requireDash(): Promise<DashContext> {
  const state = await dashState();
  if (state.kind !== "ok") redirect("/dashboard");
  return state.ctx;
}

/** For server actions: may refresh the token (cookies are writable there). */
export async function actionDash(): Promise<DashContext> {
  const session = await getSession();
  const business = dashboardBusiness(session);
  const token = await getAccessToken();
  if (!session || !business || !token) throw new Error("Session expirée : reconnectez-vous avec SSS.");
  if (!canWrite(session)) throw new Error("Votre accès SSS est en lecture seule.");
  return { session, business, base: `/api/v1/stores/${encodeURIComponent(business.id)}`, token, canWrite: true };
}

export async function api(ctx: DashContext, path: string, init: RequestInit = {}): Promise<unknown> {
  const h = new Headers(init.headers);
  h.set("Authorization", `Bearer ${ctx.token}`);
  h.set("Accept", "application/json");
  if (init.body && !h.has("Content-Type")) h.set("Content-Type", "application/json");
  const res = await fetch(`${config.apiUrl}${ctx.base}${path}`, { ...init, headers: h, cache: "no-store" });
  const body = (await res.json().catch(() => null)) as { data?: unknown; error?: { message?: string } } | null;
  if (!res.ok) throw new Error(body?.error?.message || `SSS a répondu ${res.status}`);
  return body?.data ?? null;
}

const safe = (ctx: DashContext, path: string) => api(ctx, path).catch(() => null);
const list = (v: unknown) => (Array.isArray(v) ? v : arr(obj(v).items)).map(obj);

export async function allRawProducts(ctx: DashContext): Promise<Raw[]> {
  const out: Raw[] = [];
  let cursor = "";
  for (let page = 0; page < 20; page++) {
    const raw = await safe(ctx, `/products?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
    out.push(...list(raw));
    cursor = Array.isArray(raw) ? "" : str(obj(raw).nextCursor);
    if (!cursor) break;
  }
  return out;
}

export type DashProduct = ProductRecord & { raw: Raw; daily: Record<string, number> };

export function toDashProduct(p: Raw): DashProduct {
  const daily = obj(obj(p.metadata).daily);
  return {
    ...toProductRecord(p),
    raw: p,
    daily: Object.fromEntries(Object.entries(daily).map(([k, v]) => [k, Number(v) || 0])),
  };
}

export async function dashProducts(ctx: DashContext): Promise<DashProduct[]> {
  return (await allRawProducts(ctx)).map(toDashProduct);
}

/** One product by SSS id, or by sku (the public URL id). */
export async function dashProduct(ctx: DashContext, id: string): Promise<DashProduct | null> {
  const direct = await safe(ctx, `/products/${encodeURIComponent(id)}`);
  if (direct && str(obj(direct).id)) return toDashProduct(obj(direct));
  const all = await dashProducts(ctx);
  return all.find((p) => p.id.toLowerCase() === id.toLowerCase() || p.sssId === id) ?? null;
}

export const ORDER_STATUSES = ["pending", "paid", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type DashOrder = {
  id: string;
  ref: string;
  at: string;
  status: string;
  name: string;
  phone: string;
  lines: Array<{ name: string; sku: string; qty: number; unitPrice: number; priceOnRequest: boolean }>;
  total: number;
  currency: string;
  notes: string;
  source: string;
};

export function toOrder(r: Raw): DashOrder {
  const d = obj(r.data);
  const meta = obj(r.metadata);
  const client = d.clientName ?? d.client;
  return {
    id: str(r.id),
    ref: str(r.name),
    at: str(r.createdAt),
    status: str(d.status) || "pending",
    name: typeof client === "string" ? client : str(obj(client).name),
    phone: str(meta.phone) || str(d.phone),
    lines: arr(d.lines)
      .map(obj)
      .map((l) => ({
        name: str(l.name),
        sku: str(l.sku),
        qty: Number(l.qty) || 1,
        unitPrice: Number(l.unitPrice) || 0,
        priceOnRequest: l.priceOnRequest === true,
      })),
    total: Number(d.total) || 0,
    currency: str(d.currency) || "FCFA",
    notes: str(d.notes),
    source: str(meta.source) || "sss",
  };
}

export async function dashOrders(ctx: DashContext): Promise<DashOrder[]> {
  const raw = await safe(ctx, "/sasto/order?limit=200");
  return list(raw)
    .map(toOrder)
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** Views over the last `days` days (from metadata.daily), today included. */
export function viewsSince(p: DashProduct, days: number): number {
  const end = today();
  const start = new Date(`${end}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const from = start.toISOString().slice(0, 10);
  return Object.entries(p.daily).reduce((n, [day, v]) => (day >= from && day <= end ? n + v : n), 0);
}

export type DashStore = {
  raw: Raw;
  name: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  meta: Raw;
  hours: OpeningHourRecord[];
  profile: Raw;
};

/** GET /profile answers {profile, now, ...}: the editable part is `profile`. */
export async function dashStore(ctx: DashContext): Promise<DashStore> {
  const [store, profile] = await Promise.all([safe(ctx, "").then(obj), safe(ctx, "/profile").then(obj)]);
  const inner = obj(profile.profile ?? profile);
  const days = obj(obj(inner.hours).days);
  return {
    raw: store,
    name: str(store.name),
    description: str(store.description),
    email: str(store.email),
    phone: str(store.phone),
    whatsapp: str(store.whatsapp),
    address: str(store.address),
    city: str(store.city),
    country: str(store.country),
    meta: obj(store.metadata),
    hours: hoursFromProfile(days),
    profile: inner,
  };
}

export { DAYS };
