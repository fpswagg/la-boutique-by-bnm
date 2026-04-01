import { STORE } from "../constant";
import type { CartItem } from "../context/CartContext";
import { getProduct, getProductName, formatPrice } from "./products";
import type { Locale } from "../../middleware";

const rawPhone = STORE.phone.replace(/\s+/g, "");

export function buildWhatsAppOrderUrl(
  items: CartItem[],
  locale: Locale,
  dict: { order_message: string; order_suffix: string }
): string {
  const lines = items
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) return null;
      const name = getProductName(product, locale);
      const price = formatPrice(product.price, product.currency);
      return `- ${name} x${item.qty}${price ? ` (${price})` : ""}`;
    })
    .filter(Boolean)
    .join("\n");

  const message = `${dict.order_message}${lines}${dict.order_suffix}`;
  return `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppContactUrl(message?: string): string {
  const text = message ?? "Bonjour, j'aimerais avoir des informations.";
  return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
}
