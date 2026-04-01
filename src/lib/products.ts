import type { Locale } from "../../middleware";
import rawProducts from "../../data/products.json";

export interface TranslatableField {
  en: string;
  fr: string;
  tr: string;
}

export interface Product {
  id: string;
  name: TranslatableField;
  price: number | null;
  currency: string;
  images: string[];
  category: TranslatableField;
}

export const products: Product[] = rawProducts as Product[];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductName(product: Product, locale: Locale): string {
  return product.name[locale] ?? product.name.fr;
}

export function getProductCategory(product: Product, locale: Locale): string {
  return product.category[locale] ?? product.category.fr;
}

export function getRelatedProducts(product: Product, locale: Locale): Product[] {
  const cat = product.category[locale] ?? product.category.fr;
  return products.filter(
    (p) => p.id !== product.id && (p.category[locale] ?? p.category.fr) === cat
  );
}

export function groupByCategory(
  productList: Product[],
  locale: Locale
): Record<string, Product[]> {
  return productList.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category[locale] ?? p.category.fr;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
}

export function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}
