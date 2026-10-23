import "server-only";
import { cache } from "react";
import { config, SSS_TAG } from "./config";
import { STORE } from "@/constant";
import type { Locale } from "../../middleware";

/**
 * Everything the shop shows comes from SSS (business "la-boutique-by-bnm"):
 * the public showcase for the storefront, the business API key for website
 * orders and view counters. No database, no file storage of its own.
 */

export type Raw = Record<string, unknown>;
export const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
export const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export interface TranslatableField {
  en: string;
  fr: string;
  tr: string;
}

export type ProductStatus = "published" | "archived";

export interface ProductRecord {
  /** The SSS sku: also the URL id (/products/<id>), kept from the old site. */
  id: string;
  /** SSS product id. */
  sssId: string;
  name: TranslatableField;
  category: TranslatableField;
  description: TranslatableField;
  price: number | null;
  currency: string;
  images: string[];
  status: ProductStatus;
  tags: string[];
  stock: number;
  views: number;
  featured: boolean;
  badge: string;
  order: number;
  postedAt: Date;
  updatedAt: Date;
}

export interface StoreConfigRecord {
  id: string;
  name: TranslatableField;
  category: TranslatableField;
  description: TranslatableField;
  location: { city: string; country: string; display: TranslatableField };
  email: string;
  phone: string;
}

export interface OpeningHourRecord {
  day: string;
  order: number;
  label: TranslatableField;
  /** ms after midnight; opensAt === closesAt means closed that day. */
  opensAt: number;
  closesAt: number;
}

export class SssUnavailableError extends Error {
  constructor(
    message: string,
    readonly status = 503
  ) {
    super(message);
  }
}

// ── Reading the showcase ─────────────────────────────────────────────────────

type Showcase = { store: Raw; products: Raw[]; business: Raw; links: Raw[]; chatbot: Raw | null };

async function fetchShowcase(): Promise<Showcase | null> {
  try {
    const res = await fetch(`${config.apiUrl}/api/v1/stores/${encodeURIComponent(config.storeSlug)}/showcase`, {
      headers: { accept: "application/json" },
      next: { revalidate: config.revalidate, tags: [SSS_TAG] },
    });
    if (!res.ok) {
      console.error(`[sss] showcase answered ${res.status}`);
      return null;
    }
    const data = obj(obj(await res.json()).data);
    return {
      store: obj(data.store),
      products: arr(data.products).map(obj),
      business: obj(data.business),
      links: arr(data.links).map(obj),
      chatbot: data.chatbot ? obj(data.chatbot) : null,
    };
  } catch (err) {
    console.error("[sss] showcase unreachable", err);
    return null;
  }
}

const getShowcase = cache(fetchShowcase);

function tri(fr: string, meta: Raw, key: string): TranslatableField {
  const i18n = obj(meta.i18n);
  return {
    fr,
    en: str(obj(i18n.en)[key]) || fr,
    tr: str(obj(i18n.tr)[key]) || fr,
  };
}

function date(v: unknown): Date {
  const d = new Date(typeof v === "string" || typeof v === "number" ? v : Date.now());
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function toProductRecord(p: Raw): ProductRecord {
  const meta = obj(p.metadata);
  const priceOnRequest = meta.priceOnRequest === true;
  const price = Number(p.price);
  return {
    id: str(p.sku) || str(p.id),
    sssId: str(p.id),
    name: tri(str(p.name), meta, "name"),
    category: tri(str(p.category), meta, "category"),
    description: tri(str(p.description), meta, "description"),
    price: priceOnRequest || !Number.isFinite(price) ? null : price,
    currency: str(p.currency) || "FCFA",
    images: arr(p.images)
      .map((img) => (typeof img === "string" ? img : str(obj(img).url)))
      .filter(Boolean),
    status: p.active === false ? "archived" : "published",
    tags: arr(p.tags).filter((t): t is string => typeof t === "string"),
    stock: p.unlimitedStock === true ? 99 : Math.max(0, Number(p.quantity) || 0),
    views: Math.max(0, Number(meta.views) || 0),
    featured: meta.featured === true,
    badge: str(meta.badge),
    order: Number(meta.order) || 999,
    postedAt: date(meta.postedAt ?? p.createdAt),
    updatedAt: date(p.updatedAt ?? meta.postedAt),
  };
}

export function sortProducts(list: ProductRecord[]): ProductRecord[] {
  return [...list].sort((a, b) => a.order - b.order || b.postedAt.getTime() - a.postedAt.getTime());
}

export async function getAllProducts(): Promise<ProductRecord[]> {
  const site = await getShowcase();
  return sortProducts((site?.products ?? []).map(toProductRecord));
}

export async function getFeaturedProducts(limit = 6): Promise<ProductRecord[]> {
  const all = await getAllProducts();
  const featured = all.filter((p) => p.featured);
  return [...featured, ...all.filter((p) => !p.featured)].slice(0, limit);
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  const key = decodeURIComponent(id).toLowerCase();
  const all = await getAllProducts();
  return all.find((p) => p.id.toLowerCase() === key || p.sssId === id) ?? null;
}

export async function getRelatedProducts(productId: string, locale: Locale): Promise<ProductRecord[]> {
  const all = await getAllProducts();
  const product = all.find((p) => p.id === productId);
  if (!product) return [];
  const cat = product.category[locale] ?? product.category.fr;
  const same = all.filter((p) => p.id !== productId && (p.category[locale] ?? p.category.fr) === cat);
  const others = all.filter((p) => p.id !== productId && !same.includes(p));
  return [...same, ...others].slice(0, 4);
}

export function getLocalizedField(field: TranslatableField, locale: Locale): string {
  return field[locale] ?? field.fr;
}

const FALLBACK_STORE: StoreConfigRecord = {
  id: "main",
  name: { ...STORE.name },
  category: { ...STORE.category },
  description: { ...STORE.description },
  location: { city: STORE.location.city, country: STORE.location.country, display: { ...STORE.location.display } },
  email: STORE.email,
  phone: STORE.phone,
};

export async function getStoreConfig(): Promise<StoreConfigRecord> {
  const site = await getShowcase();
  if (!site) return FALLBACK_STORE;
  const s = site.store;
  const meta = obj(s.metadata);
  const name = str(s.name) || FALLBACK_STORE.name.fr;
  const category = str(meta.category) || FALLBACK_STORE.category.fr;
  const display = str(meta.locationDisplay) || FALLBACK_STORE.location.display.fr;
  return {
    id: "main",
    name: { fr: name, en: name, tr: name },
    category: tri(category, meta, "category"),
    description: tri(str(s.description) || FALLBACK_STORE.description.fr, meta, "description"),
    location: {
      city: str(s.city) || FALLBACK_STORE.location.city,
      country: str(s.country) || FALLBACK_STORE.location.country,
      display: tri(display, meta, "location"),
    },
    email: str(s.email) || FALLBACK_STORE.email,
    phone: str(s.whatsapp) || str(s.phone) || FALLBACK_STORE.phone,
  };
}

export const DAYS = [
  { key: "mon", day: "monday", label: { fr: "Lundi", en: "Monday", tr: "Pazartesi" } },
  { key: "tue", day: "tuesday", label: { fr: "Mardi", en: "Tuesday", tr: "Salı" } },
  { key: "wed", day: "wednesday", label: { fr: "Mercredi", en: "Wednesday", tr: "Çarşamba" } },
  { key: "thu", day: "thursday", label: { fr: "Jeudi", en: "Thursday", tr: "Perşembe" } },
  { key: "fri", day: "friday", label: { fr: "Vendredi", en: "Friday", tr: "Cuma" } },
  { key: "sat", day: "saturday", label: { fr: "Samedi", en: "Saturday", tr: "Cumartesi" } },
  { key: "sun", day: "sunday", label: { fr: "Dimanche", en: "Sunday", tr: "Pazar" } },
] as const;

export function hhmmToMs(v: unknown): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(str(v));
  return m ? (Number(m[1]) * 60 + Number(m[2])) * 60_000 : 0;
}

export function hoursFromProfile(days: Raw): OpeningHourRecord[] {
  return DAYS.map((d, order) => {
    const slots = arr(days[d.key]).map(obj);
    const first = slots[0];
    const last = slots[slots.length - 1];
    return {
      day: d.day,
      order,
      label: { ...d.label },
      opensAt: first ? hhmmToMs(first.from) : 0,
      closesAt: last ? hhmmToMs(last.to) : 0,
    };
  });
}

export async function getOpeningHours(): Promise<OpeningHourRecord[]> {
  const site = await getShowcase();
  const days = obj(obj(site?.business.hours).days);
  if (!Object.keys(days).length) {
    return STORE.openingHours.map((slot, order) => ({ day: slot.day, order, label: { ...slot.label }, opensAt: slot.opensAt, closesAt: slot.closesAt }));
  }
  return hoursFromProfile(days);
}

/** Delivery text for the product page and contact page, per language (SSS business metadata). */
export async function getDeliveryText(): Promise<TranslatableField | null> {
  const site = await getShowcase();
  const meta = obj(site?.store.metadata);
  const fr = str(meta.delivery);
  return fr ? tri(fr, meta, "delivery") : null;
}

// ── Writing with the business API key (server only) ──────────────────────────

export const writesEnabled = () => Boolean(config.storeSlug && config.apiKey);

export async function adminApi<T = unknown>(path: string, init: RequestInit = {}): Promise<T | null> {
  if (!writesEnabled()) return null;
  const res = await fetch(`${config.apiUrl}/api/v1/stores/${encodeURIComponent(config.storeSlug)}${path}`, {
    ...init,
    headers: { accept: "application/json", "content-type": "application/json", authorization: `Bearer ${config.apiKey}`, ...(init.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as { data?: T; error?: { message?: string } } | null;
  if (!res.ok) throw new SssUnavailableError(body?.error?.message ?? `SSS answered ${res.status}`, res.status);
  return (body?.data ?? null) as T | null;
}

const DAILY_KEEP = 60;

export function today(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Douala" });
}

/**
 * One product page view: total in metadata.views, per day in metadata.daily
 * ({ "2026-10-23": n }, last 60 days) and per language in metadata.viewsByLocale.
 */
export async function recordProductView(sssId: string, locale: string) {
  const product = obj(await adminApi(`/products/${encodeURIComponent(sssId)}`));
  if (!product.id) return;
  const meta = { ...obj(product.metadata) };
  meta.views = (Number(meta.views) || 0) + 1;
  const daily = { ...obj(meta.daily) } as Record<string, number>;
  const day = today();
  daily[day] = (Number(daily[day]) || 0) + 1;
  meta.daily = Object.fromEntries(Object.entries(daily).sort(([a], [b]) => b.localeCompare(a)).slice(0, DAILY_KEEP));
  const byLocale = { ...obj(meta.viewsByLocale) } as Record<string, number>;
  if (["fr", "en", "tr"].includes(locale)) byLocale[locale] = (Number(byLocale[locale]) || 0) + 1;
  meta.viewsByLocale = byLocale;
  await adminApi(`/products/${encodeURIComponent(sssId)}`, { method: "PATCH", body: JSON.stringify({ metadata: meta }) });
}

/** Last 9 digits: "+237 6 55 62 69 52" and "655626952" are the same number. */
const phoneKey = (phone: unknown) => (typeof phone === "string" ? phone.replace(/[^\d]/g, "").slice(-9) : "");

export async function findOrCreateClient(input: { name: string; phone?: string; notes?: string }): Promise<{ id: string; name: string } | null> {
  if (!writesEnabled()) return null;
  const key = phoneKey(input.phone);
  if (key) {
    const data = await adminApi<unknown>("/clients");
    const list = (Array.isArray(data) ? data : arr(obj(data).items)).map(obj);
    const found = list.find((c) => phoneKey(c.phone) === key);
    if (found) return { id: str(found.id), name: str(found.name) || input.name };
  }
  const created = obj(await adminApi("/clients", { method: "POST", body: JSON.stringify({ name: input.name, phone: input.phone || undefined, notes: input.notes }) }));
  return created.id ? { id: str(created.id), name: str(created.name) || input.name } : null;
}

export type OrderLine = { productId: string; sku: string; name: string; qty: number; unitPrice: number; currency: string; priceOnRequest?: boolean };

/** A website order as an SSS order (SASTO → Commandes), status pending. */
export async function createWebOrder(input: { ref: string; client: { id: string; name: string } | null; clientName: string; lines: OrderLine[]; total: number; currency: string; notes: string; metadata: Raw }) {
  const data = {
    clientName: input.client ? { id: input.client.id, name: input.client.name } : input.clientName,
    ...(input.client ? { clientId: input.client.id } : {}),
    status: "pending",
    currency: input.currency,
    lines: input.lines,
    total: input.total,
    notes: input.notes,
  };
  const rec = obj(await adminApi("/sasto/order", { method: "POST", body: JSON.stringify({ name: input.ref, data, metadata: { source: "website", ...input.metadata } }) }));
  return rec.id ? str(rec.id) : null;
}

/** Website message in SSS → Feedback (the team is notified there). */
export async function sendContact(input: { name: string; phone?: string; email?: string; message: string; createClient?: boolean }) {
  const res = await fetch(`${config.apiUrl}/api/v1/stores/${encodeURIComponent(config.storeSlug)}/showcase/contact`, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = obj(await res.json().catch(() => null));
    throw new SssUnavailableError(str(obj(body.error).message) || `SSS answered ${res.status}`, res.status);
  }
}
