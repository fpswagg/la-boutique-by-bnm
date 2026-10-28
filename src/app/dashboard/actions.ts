"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { SSS_TAG } from "@/lib/config";
import { dashboardFr } from "@/lib/dashboard/fr";
import { actionDash, api, ORDER_STATUSES, type DashContext } from "@/lib/dashboard";
import { arr, DAYS, obj, str, type Raw } from "@/lib/sss";

/**
 * Dashboard edits, sent to SSS with the signed-in person's own access (Sign in with
 * SSS, scope "business"). Each one clears the site's SSS cache so the shop updates at once.
 */

const MAX_IMAGES = 12;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function text(formData: FormData, key: string, max = 200): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function int(formData: FormData, key: string): number | null {
  const v = text(formData, key, 20);
  if (!v) return null;
  const n = Number.parseInt(v.replace(/[\s.]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function refreshShop() {
  revalidateTag(SSS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

async function getProduct(ctx: DashContext, id: string): Promise<Raw> {
  const p = obj(await api(ctx, `/products/${encodeURIComponent(id)}`));
  if (!str(p.id)) throw new Error(dashboardFr.errors.productNotFound);
  return p;
}

/** Uploads pictures to the business's SSS storage; returns SSS image objects. */
async function uploadImages(ctx: DashContext, sku: string, files: File[], alt: string) {
  const out: Array<{ url: string; key?: string; alt: string }> = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${dashboardFr.errors.uploadFailed} : ${file.name} (JPG, PNG ou WEBP)`);
    if (file.size > MAX_IMAGE_BYTES) throw new Error(`${dashboardFr.errors.uploadFailed} : ${file.name} dépasse 3 Mo`);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const name = `${sku}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const data = obj(
      await api(ctx, "/files", json({ name, mediaType: file.type, dataBase64: Buffer.from(await file.arrayBuffer()).toString("base64") }), ).catch(
        (err: unknown) => {
          throw new Error(`${dashboardFr.errors.uploadFailed} : ${err instanceof Error ? err.message : "erreur"}`);
        }
      )
    );
    if (str(data.url)) out.push({ url: str(data.url), ...(str(data.key) ? { key: str(data.key) } : {}), alt });
  }
  return out;
}

/** The SSS category with that name (created when missing), for the SSS app filters. */
async function categoryId(ctx: DashContext, name: string): Promise<string | null> {
  if (!name) return null;
  const list = arr(await api(ctx, "/categories").catch(() => [])).map(obj);
  const found = list.find((c) => str(c.name).toLowerCase() === name.toLowerCase());
  if (found) return str(found.id);
  const created = obj(await api(ctx, "/categories", { method: "POST", ...json({ name }) }).catch(() => null));
  return str(created.id) || null;
}

function readForm(formData: FormData) {
  const name = { fr: text(formData, "nameFr", 160), en: text(formData, "nameEn", 160), tr: text(formData, "nameTr", 160) };
  const category = { fr: text(formData, "categoryFr", 80), en: text(formData, "categoryEn", 80), tr: text(formData, "categoryTr", 80) };
  const description = {
    fr: text(formData, "descriptionFr", 2000),
    en: text(formData, "descriptionEn", 2000),
    tr: text(formData, "descriptionTr", 2000),
  };
  if (!name.fr) throw new Error(dashboardFr.errors.nameRequired);
  if (!category.fr) throw new Error(dashboardFr.errors.categoryRequired);
  const tags = text(formData, "tags", 800)
    .split(",")
    .map((t) => t.trim().toLowerCase().slice(0, 40))
    .filter(Boolean)
    .slice(0, 20);
  return {
    sku: toSlug(text(formData, "id", 64)) || toSlug(name.fr) || `produit-${Date.now().toString(36)}`,
    name,
    category,
    description,
    price: int(formData, "price"),
    stock: Math.max(0, int(formData, "stock") ?? 0),
    currency: text(formData, "currency", 8) || "FCFA",
    active: text(formData, "status", 20) !== "archived",
    tags,
    featured: formData.get("featured") === "on",
    badge: text(formData, "badge", 30),
    order: int(formData, "order"),
  };
}

type FormProduct = ReturnType<typeof readForm>;

/** Translations and site options in metadata; everything else already there is kept. */
function productMeta(input: FormProduct, previous: Raw): Raw {
  const meta: Raw = { ...previous };
  const i18n = { ...obj(meta.i18n) };
  for (const lang of ["en", "tr"] as const) {
    const entry: Raw = { ...obj(i18n[lang]) };
    const put = (key: string, v: string) => {
      if (v) entry[key] = v;
      else delete entry[key];
    };
    put("name", input.name[lang]);
    put("category", input.category[lang]);
    put("description", input.description[lang]);
    i18n[lang] = entry;
  }
  meta.i18n = i18n;
  if (input.price === null) meta.priceOnRequest = true;
  else delete meta.priceOnRequest;
  if (input.featured) meta.featured = true;
  else delete meta.featured;
  if (input.badge) meta.badge = input.badge;
  else delete meta.badge;
  if (input.order !== null) meta.order = input.order;
  if (!meta.postedAt) meta.postedAt = new Date().toISOString();
  return meta;
}

async function productBody(ctx: DashContext, input: FormProduct, previous: Raw) {
  const catId = await categoryId(ctx, input.category.fr);
  return {
    sku: input.sku,
    name: input.name.fr,
    price: input.price ?? 0,
    currency: input.currency,
    quantity: input.stock,
    // Owner rule: every product in stock is unlimited; 0 = out of stock.
    unlimitedStock: input.stock > 0,
    description: input.description.fr,
    category: input.category.fr,
    ...(catId ? { categoryIds: [catId] } : {}),
    tags: input.tags,
    active: input.active,
    metadata: productMeta(input, obj(previous.metadata)),
  };
}

const files = (formData: FormData, key = "images") => formData.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);

/* ── Products ─────────────────────────────────────────────────────────────── */

export async function createProduct(formData: FormData) {
  const ctx = await actionDash();
  const input = readForm(formData);
  const images = await uploadImages(ctx, input.sku, files(formData).slice(0, MAX_IMAGES), input.name.fr);
  const body = await productBody(ctx, input, {});
  const saved = obj(await api(ctx, "/products", { method: "POST", ...json({ ...body, unit: "pièce", images }) }));
  refreshShop();
  redirect(`/dashboard/products/${encodeURIComponent(str(saved.id))}?saved=1`);
}

export async function updateProduct(id: string, formData: FormData) {
  const ctx = await actionDash();
  const current = await getProduct(ctx, id);
  const input = readForm(formData);
  const keep = new Set(formData.getAll("keepImages").filter((v): v is string => typeof v === "string"));
  const kept = arr(current.images)
    .map(obj)
    .filter((img) => keep.has(str(img.url)));
  const added = await uploadImages(ctx, input.sku, files(formData).slice(0, Math.max(0, MAX_IMAGES - kept.length)), input.name.fr);
  const body = await productBody(ctx, input, current);
  await api(ctx, `/products/${encodeURIComponent(id)}`, { method: "PATCH", ...json({ ...body, images: [...kept, ...added] }) });
  refreshShop();
  redirect(`/dashboard/products/${encodeURIComponent(id)}?saved=1`);
}

export async function duplicateProduct(id: string) {
  const ctx = await actionDash();
  const src = await getProduct(ctx, id);
  const meta = { ...obj(src.metadata) };
  for (const k of ["views", "daily", "viewsByLocale", "legacyId", "featured"]) delete meta[k];
  meta.postedAt = new Date().toISOString();
  const i18n = obj(meta.i18n);
  meta.i18n = Object.fromEntries(
    Object.entries(i18n).map(([lang, v]) => {
      const e = { ...obj(v) };
      if (str(e.name)) e.name = `${str(e.name)} (copie)`;
      return [lang, e];
    })
  );
  const saved = obj(
    await api(ctx, "/products", {
      method: "POST",
      ...json({
        sku: `${str(src.sku) || "produit"}-copie-${Date.now().toString(36).slice(-4)}`.slice(0, 64),
        name: `${str(src.name)} (copie)`.slice(0, 160),
        price: Number(src.price) || 0,
        currency: str(src.currency) || "FCFA",
        quantity: Number(src.quantity) || 0,
        unlimitedStock: src.unlimitedStock === true,
        description: str(src.description),
        category: str(src.category),
        categoryIds: arr(src.categoryIds).filter((v): v is string => typeof v === "string"),
        tags: arr(src.tags).filter((v): v is string => typeof v === "string"),
        unit: str(src.unit) || "pièce",
        active: false,
        images: arr(src.images).map(obj),
        metadata: meta,
      }),
    })
  );
  refreshShop();
  redirect(`/dashboard/products/${encodeURIComponent(str(saved.id))}`);
}

export async function deleteProduct(id: string) {
  const ctx = await actionDash();
  await api(ctx, `/products/${encodeURIComponent(id)}`, { method: "DELETE" });
  refreshShop();
  redirect("/dashboard/products");
}

export async function setProductStockFromForm(id: string, formData: FormData) {
  const ctx = await actionDash();
  const current = await getProduct(ctx, id);
  const wanted = int(formData, "stock") ?? 0;
  // "En stock" brings back the previous quantity (or 1); "Rupture" sets 0.
  const meta = { ...obj(current.metadata) };
  let quantity = 0;
  if (wanted > 0) quantity = Math.max(1, Number(meta.lastStock) || Number(current.quantity) || 1);
  else if ((Number(current.quantity) || 0) > 0) meta.lastStock = Number(current.quantity);
  await api(ctx, `/products/${encodeURIComponent(id)}`, { method: "PATCH", ...json({ quantity, unlimitedStock: wanted > 0, metadata: meta }) });
  refreshShop();
  revalidatePath("/dashboard/products");
}

export async function deleteImage(productId: string, imageUrl: string) {
  const ctx = await actionDash();
  const current = await getProduct(ctx, productId);
  const images = arr(current.images).map(obj);
  const gone = images.find((img) => str(img.url) === imageUrl);
  await api(ctx, `/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    ...json({ images: images.filter((img) => str(img.url) !== imageUrl) }),
  });
  // The file itself, when it lives in this business's storage and nothing else uses it.
  const key = str(gone?.key);
  if (key) await api(ctx, `/files?key=${encodeURIComponent(key)}`, { method: "DELETE" }).catch(() => undefined);
  refreshShop();
  revalidatePath(`/dashboard/products/${productId}`);
}

/* ── Orders ───────────────────────────────────────────────────────────────── */

export async function setOrderStatus(id: string, formData: FormData) {
  const ctx = await actionDash();
  const status = text(formData, "status", 30);
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) throw new Error("Statut inconnu.");
  const rec = obj(await api(ctx, `/sasto/order/${encodeURIComponent(id)}`));
  const data = obj(rec.data);
  const meta = obj(rec.metadata);
  await api(ctx, `/sasto/order/${encodeURIComponent(id)}`, { method: "PATCH", ...json({ data: { ...data, status } }) });
  // Delivered: SSS takes the items out of stock and writes the invoice (once).
  if (status === "delivered" && !meta.fulfilledAt) {
    const ok = await api(ctx, `/sasto/order/${encodeURIComponent(id)}/fulfil`, { method: "POST", ...json({ createInvoice: true }) })
      .then(() => true)
      .catch(() => false);
    if (ok)
      await api(ctx, `/sasto/order/${encodeURIComponent(id)}`, {
        method: "PATCH",
        ...json({ metadata: { ...meta, fulfilledAt: new Date().toISOString() } }),
      }).catch(() => undefined);
  }
  refreshShop();
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

/* ── Store ────────────────────────────────────────────────────────────────── */

function hhmm(ms: number): string {
  const total = Math.max(0, Math.min(24 * 60 - 1, Math.round(ms / 60_000)));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export async function updateStoreConfigAction(formData: FormData) {
  const ctx = await actionDash();
  const store = obj(await api(ctx, ""));
  const meta: Raw = { ...obj(store.metadata) };
  const i18n = { ...obj(meta.i18n) };
  const put = (target: Raw, key: string, v: string) => {
    if (v) target[key] = v;
    else delete target[key];
  };
  put(meta, "category", text(formData, "categoryFr", 120));
  put(meta, "locationDisplay", text(formData, "locationFr", 160));
  put(meta, "delivery", text(formData, "deliveryFr", 600));
  for (const lang of ["en", "tr"] as const) {
    const L = lang === "en" ? "En" : "Tr";
    const entry: Raw = { ...obj(i18n[lang]) };
    put(entry, "category", text(formData, `category${L}`, 120));
    put(entry, "location", text(formData, `location${L}`, 160));
    put(entry, "description", text(formData, `description${L}`, 1200));
    put(entry, "delivery", text(formData, `delivery${L}`, 600));
    i18n[lang] = entry;
  }
  meta.i18n = i18n;

  await api(ctx, "", {
    method: "PATCH",
    ...json({
      name: text(formData, "nameFr", 120) || str(store.name),
      description: text(formData, "descriptionFr", 600) || null,
      email: text(formData, "email", 120) || null,
      phone: text(formData, "phone", 30) || null,
      whatsapp: text(formData, "whatsapp", 30) || null,
      city: text(formData, "locationCity", 80) || null,
      country: text(formData, "locationCountry", 80) || null,
      metadata: meta,
    }),
  });

  // Opening hours → SSS business profile (the SSS assistant and the site both read them).
  const answer = obj(await api(ctx, "/profile"));
  const previous = obj(obj(answer.profile ?? answer).hours);
  const days: Record<string, Array<{ from: string; to: string }>> = {};
  const dayKeys = formData.getAll("openingDay").map(String);
  const opens = formData.getAll("openingOpens").map((v) => Number(v));
  const closes = formData.getAll("openingCloses").map((v) => Number(v));
  dayKeys.forEach((day, index) => {
    const key = DAYS.find((d) => d.day === day)?.key;
    const o = opens[index];
    const c = closes[index];
    if (!key || !Number.isFinite(o) || !Number.isFinite(c) || o === c) return;
    days[key] = [{ from: hhmm(o), to: hhmm(c) }];
  });
  await api(ctx, "/profile", {
    method: "PUT",
    ...json({ hours: { ...previous, days, exceptions: arr(previous.exceptions) } }),
  });

  refreshShop();
  redirect("/dashboard/store?saved=1");
}

/** "Traduire" button: the French name, category and description in English and Turkish. */
export async function translateProductAction(input: { name: string; category: string; description: string }) {
  await actionDash();
  const { translateFromFrench } = await import("@/lib/translate");
  const src = [input.name, input.category, input.description].map((s) => String(s ?? "").slice(0, 2000));
  try {
    const [en, tr] = await Promise.all([translateFromFrench(src, "en"), translateFromFrench(src, "tr")]);
    return { ok: true as const, en: { name: en[0], category: en[1], description: en[2] }, tr: { name: tr[0], category: tr[1], description: tr[2] } };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Traduction impossible." };
  }
}
