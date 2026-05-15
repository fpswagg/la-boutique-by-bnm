"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { dashboardFr } from "@/lib/dashboard/fr";
import {
  SUPABASE_STORAGE_BUCKET,
  getStoragePathFromPublicUrl,
  supabaseAdmin,
} from "@/lib/supabase";
import { clearAllAnalytics } from "@/lib/db/analytics";
import { updateStoreConfig, type OpeningHourRecord, type StoreConfigRecord } from "@/lib/db/store";
import { executeSawaboShortcut } from "@/lib/sawabo/service";

function assertToken(token: string) {
  const secret = process.env.DASHBOARD_PASSWORD;
  if (!secret || token !== secret) {
    throw new Error(dashboardFr.errors.unauthorized);
  }
}

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function parseIntField(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function fileExt(name: string, type: string): string {
  const fromName = name.includes(".") ? name.split(".").pop() ?? "" : "";
  if (fromName) return fromName.toLowerCase();
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "bin";
}

async function uploadFiles(productId: string, files: File[]): Promise<string[]> {
  const uploaded: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = fileExt(file.name, file.type);
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const objectPath = `products/${productId}/${safeName}`;

    const { error } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(objectPath, buffer, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      throw new Error(`${dashboardFr.errors.uploadFailed}: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(objectPath);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
}

async function allocateDuplicateProductId(nameFr: string, nameEn: string): Promise<string> {
  const baseRaw = nameFr.trim() || nameEn.trim() || "produit";
  const base = toSlug(baseRaw) || "produit";
  const suffix = "-copie";
  let candidate = `${base}${suffix}`;
  let n = 2;
  while (await db.product.findUnique({ where: { id: candidate } })) {
    candidate = `${base}${suffix}-${n}`;
    n += 1;
  }
  return candidate;
}

async function copyProductImagesToNewFolder(newProductId: string, sourceUrls: string[]): Promise<string[]> {
  const uploaded: string[] = [];

  for (const url of sourceUrls) {
    if (!url || !url.startsWith("http")) continue;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${dashboardFr.errors.imageCopyFailed} (${response.status}).`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const ext = fileExt(url, contentType);
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const objectPath = `products/${newProductId}/${safeName}`;

    const { error } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(objectPath, buffer, {
        upsert: false,
        contentType: contentType || "application/octet-stream",
      });

    if (error) {
      throw new Error(`${dashboardFr.errors.imageCopyFailed}: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(objectPath);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
}

async function deleteStorageUrls(urls: string[]) {
  const paths = urls
    .map((url) => getStoragePathFromPublicUrl(url))
    .filter((value): value is string => !!value);

  if (!paths.length) return;

  const { error } = await supabaseAdmin.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove(paths);

  if (error) {
    console.warn("Impossible de supprimer certains fichiers de stockage :", error.message);
  }
}

function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/fr");
  revalidatePath("/en");
  revalidatePath("/tr");
  revalidatePath("/fr/products");
  revalidatePath("/en/products");
  revalidatePath("/tr/products");
  revalidatePath("/sitemap.xml");
}

function getProductPayload(formData: FormData) {
  const nameFr = parseString(formData.get("nameFr"));
  const nameEn = parseString(formData.get("nameEn"));
  const nameTr = parseString(formData.get("nameTr"));
  const categoryFr = parseString(formData.get("categoryFr"));
  const categoryEn = parseString(formData.get("categoryEn"));
  const categoryTr = parseString(formData.get("categoryTr"));
  const currency = parseString(formData.get("currency")) || "FCFA";
  const statusRaw = parseString(formData.get("status"));
  const tags = parseString(formData.get("tags"))
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  if (!nameFr || !nameEn || !nameTr) {
    throw new Error(dashboardFr.errors.nameRequired);
  }

  if (!categoryFr || !categoryEn || !categoryTr) {
    throw new Error(dashboardFr.errors.categoryRequired);
  }

  return {
    id:
      parseString(formData.get("id")) ||
      toSlug(nameFr || nameEn || nameTr),
    nameFr,
    nameEn,
    nameTr,
    categoryFr,
    categoryEn,
    categoryTr,
    price: parseIntField(formData.get("price")),
    stock: parseIntField(formData.get("stock")) ?? 0,
    currency,
    status:
      statusRaw === ProductStatus.archived
        ? ProductStatus.archived
        : ProductStatus.published,
    tags,
  };
}

export async function createProduct(token: string, formData: FormData) {
  assertToken(token);
  const payload = getProductPayload(formData);
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File);

  const uploadedUrls = await uploadFiles(payload.id, files);

  await db.product.create({
    data: {
      id: payload.id,
      nameFr: payload.nameFr,
      nameEn: payload.nameEn,
      nameTr: payload.nameTr,
      categoryFr: payload.categoryFr,
      categoryEn: payload.categoryEn,
      categoryTr: payload.categoryTr,
      price: payload.price,
      currency: payload.currency,
      images: uploadedUrls,
      status: payload.status,
      tags: payload.tags,
      stock: payload.stock,
      postedAt: new Date(),
    },
  });

  revalidateStorefront();
}

export async function duplicateProduct(token: string, sourceProductId: string) {
  assertToken(token);
  const source = await db.product.findUnique({ where: { id: sourceProductId } });
  if (!source) {
    throw new Error(dashboardFr.errors.productNotFound);
  }

  const newId = await allocateDuplicateProductId(source.nameFr, source.nameEn);
  const newImages = await copyProductImagesToNewFolder(newId, source.images);

  await db.product.create({
    data: {
      id: newId,
      nameFr: source.nameFr,
      nameEn: source.nameEn,
      nameTr: source.nameTr,
      categoryFr: source.categoryFr,
      categoryEn: source.categoryEn,
      categoryTr: source.categoryTr,
      price: source.price,
      currency: source.currency,
      images: newImages,
      status: source.status,
      tags: source.tags,
      stock: source.stock,
      views: 0,
      postedAt: new Date(),
    },
  });

  revalidateStorefront();
  redirect(`/dashboard/${token}/products/${newId}`);
}

export async function updateProduct(token: string, id: string, formData: FormData) {
  assertToken(token);
  const payload = getProductPayload(formData);
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File);
  const keepImages = formData
    .getAll("keepImages")
    .filter((value): value is string => typeof value === "string");

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(dashboardFr.errors.productNotFound);
  }

  const added = await uploadFiles(id, files);
  const mergedImages = Array.from(new Set([...keepImages, ...added]));
  const removed = existing.images.filter((url) => !keepImages.includes(url));

  await db.product.update({
    where: { id },
    data: {
      id: payload.id,
      nameFr: payload.nameFr,
      nameEn: payload.nameEn,
      nameTr: payload.nameTr,
      categoryFr: payload.categoryFr,
      categoryEn: payload.categoryEn,
      categoryTr: payload.categoryTr,
      price: payload.price,
      currency: payload.currency,
      images: mergedImages,
      status: payload.status,
      tags: payload.tags,
      stock: payload.stock,
    },
  });

  await deleteStorageUrls(removed);
  revalidateStorefront();
}

export async function deleteProduct(token: string, id: string) {
  assertToken(token);
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return;

  await db.product.delete({ where: { id } });
  await deleteStorageUrls(existing.images);
  revalidateStorefront();
}

export async function updateStock(token: string, id: string, stock: number) {
  assertToken(token);
  await db.product.update({
    where: { id },
    data: { stock: Math.max(0, stock) },
  });
  revalidateStorefront();
}

export async function updateStockFromForm(token: string, id: string, formData: FormData) {
  const nextStock = Number.parseInt(String(formData.get("stock")), 10);
  await updateStock(token, id, Number.isNaN(nextStock) ? 0 : nextStock);
}

export async function setProductStockFromForm(token: string, id: string, formData: FormData) {
  assertToken(token);
  const nextStock = Number.parseInt(String(formData.get("stock")), 10);
  await updateStock(token, id, nextStock === 1 ? 1 : 0);
}

export async function clearAnalyticsAction(token: string) {
  assertToken(token);
  await clearAllAnalytics();
  revalidatePath(`/dashboard/${token}`);
  revalidateStorefront();
}

export async function deleteImage(token: string, productId: string, imageUrl: string) {
  assertToken(token);
  const existing = await db.product.findUnique({ where: { id: productId } });
  if (!existing) return;

  const images = existing.images.filter((url) => url !== imageUrl);
  await db.product.update({
    where: { id: productId },
    data: { images },
  });
  await deleteStorageUrls([imageUrl]);
  revalidateStorefront();
}

export async function updateStoreConfigAction(token: string, formData: FormData) {
  assertToken(token);

  const config: StoreConfigRecord = {
    id: "main",
    name: {
      fr: parseString(formData.get("nameFr")),
      en: parseString(formData.get("nameEn")),
      tr: parseString(formData.get("nameTr")),
    },
    category: {
      fr: parseString(formData.get("categoryFr")),
      en: parseString(formData.get("categoryEn")),
      tr: parseString(formData.get("categoryTr")),
    },
    description: {
      fr: parseString(formData.get("descriptionFr")),
      en: parseString(formData.get("descriptionEn")),
      tr: parseString(formData.get("descriptionTr")),
    },
    location: {
      city: parseString(formData.get("locationCity")),
      country: parseString(formData.get("locationCountry")),
      display: {
        fr: parseString(formData.get("locationFr")),
        en: parseString(formData.get("locationEn")),
        tr: parseString(formData.get("locationTr")),
      },
    },
    email: parseString(formData.get("email")),
    phone: parseString(formData.get("phone")),
  };

  const days = formData.getAll("openingDay").map(String);
  const opens = formData.getAll("openingOpens").map(String);
  const closes = formData.getAll("openingCloses").map(String);
  const labelFr = formData.getAll("openingLabelFr").map(String);
  const labelEn = formData.getAll("openingLabelEn").map(String);
  const labelTr = formData.getAll("openingLabelTr").map(String);

  const openingHours: OpeningHourRecord[] = days.map((day, index) => ({
    day,
    order: index,
    opensAt: Number.parseInt(opens[index] ?? "0", 10) || 0,
    closesAt: Number.parseInt(closes[index] ?? "0", 10) || 0,
    label: {
      fr: labelFr[index] ?? day,
      en: labelEn[index] ?? day,
      tr: labelTr[index] ?? day,
    },
  }));

  await updateStoreConfig({ config, openingHours });
  revalidateStorefront();
}

export async function postProductToSawaboShortcut(token: string, productId: string) {
  assertToken(token);
  await executeSawaboShortcut({ shortcut: "post_product_now", productId });
  revalidatePath(`/dashboard/${token}/products`);
  revalidatePath(`/dashboard/${token}/integrations/sawabo`);
}

export async function postAllProductsToSawaboShortcut(token: string) {
  assertToken(token);
  await executeSawaboShortcut({ shortcut: "post_all_products" });
  revalidatePath(`/dashboard/${token}/products`);
  revalidatePath(`/dashboard/${token}/integrations/sawabo`);
}
