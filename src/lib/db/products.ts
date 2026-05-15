import type { Locale } from "../../../middleware";
import { ProductStatus, type Product as PrismaProduct } from "@prisma/client";
import { db } from "@/lib/db";

export interface TranslatableField {
  en: string;
  fr: string;
  tr: string;
}

export interface ProductRecord {
  id: string;
  name: TranslatableField;
  category: TranslatableField;
  price: number | null;
  currency: string;
  images: string[];
  status: ProductStatus;
  tags: string[];
  stock: number;
  views: number;
  postedAt: Date;
  updatedAt: Date;
}

function toRecord(product: PrismaProduct): ProductRecord {
  return {
    id: product.id,
    name: {
      en: product.nameEn,
      fr: product.nameFr,
      tr: product.nameTr,
    },
    category: {
      en: product.categoryEn,
      fr: product.categoryFr,
      tr: product.categoryTr,
    },
    price: product.price,
    currency: product.currency,
    images: product.images,
    status: product.status,
    tags: product.tags,
    stock: product.stock,
    views: product.views,
    postedAt: product.postedAt,
    updatedAt: product.updatedAt,
  };
}

export function getLocalizedField(field: TranslatableField, locale: Locale): string {
  return field[locale] ?? field.fr;
}

export async function getAllProducts(options?: { includeArchived?: boolean }) {
  const rows = await db.product.findMany({
    where: options?.includeArchived ? undefined : { status: ProductStatus.published },
    orderBy: { postedAt: "desc" },
  });
  return rows.map(toRecord);
}

export async function getProductById(id: string) {
  const row = await db.product.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function getRelatedProducts(productId: string, locale: Locale) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return [];

  const categoryLookup =
    locale === "en"
      ? product.categoryEn
      : locale === "tr"
      ? product.categoryTr
      : product.categoryFr;

  const rows = await db.product.findMany({
    where: {
      id: { not: productId },
      status: ProductStatus.published,
      OR: [
        { categoryFr: categoryLookup },
        { categoryEn: categoryLookup },
        { categoryTr: categoryLookup },
      ],
    },
    take: 4,
    orderBy: { postedAt: "desc" },
  });

  return rows.map(toRecord);
}

export function groupByCategory(products: ProductRecord[], locale: Locale) {
  return products.reduce<Record<string, ProductRecord[]>>((acc, product) => {
    const key = getLocalizedField(product.category, locale);
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});
}

export async function incrementProductViews(productId: string) {
  await db.product.update({
    where: { id: productId },
    data: { views: { increment: 1 } },
  });
}

export async function upsertProduct(input: {
  id: string;
  name: TranslatableField;
  category: TranslatableField;
  price: number | null;
  currency: string;
  images: string[];
  status: ProductStatus;
  tags: string[];
  stock: number;
  postedAt?: Date;
}) {
  const data = {
    nameFr: input.name.fr,
    nameEn: input.name.en,
    nameTr: input.name.tr,
    categoryFr: input.category.fr,
    categoryEn: input.category.en,
    categoryTr: input.category.tr,
    price: input.price,
    currency: input.currency,
    images: input.images,
    status: input.status,
    tags: input.tags,
    stock: input.stock,
    ...(input.postedAt ? { postedAt: input.postedAt } : {}),
  };

  const row = await db.product.upsert({
    where: { id: input.id },
    update: data,
    create: {
      id: input.id,
      ...data,
    },
  });

  return toRecord(row);
}
