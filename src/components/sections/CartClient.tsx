"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, MessageCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLikes } from "@/context/LikesContext";
import {
  getProduct,
  getProductName,
  formatPrice,
  products as allProductsList,
} from "@/lib/products";
import type { Product } from "@/lib/products";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "../../../middleware";

interface CartClientProps {
  dict: Dictionary;
  locale: Locale;
}

export function CartClient({ dict, locale }: CartClientProps) {
  const { items, updateQty, removeItem } = useCart();
  const { likedIds } = useLikes();

  const likedProducts = likedIds
    .map((id) => allProductsList.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const cartProducts = items
    .map((item) => ({ item, product: getProduct(item.id) }))
    .filter((x): x is { item: typeof items[0]; product: Product } => !!x.product);

  const total = cartProducts.reduce((sum, { item, product }) => {
    return sum + (product.price ?? 0) * item.qty;
  }, 0);

  const whatsappUrl = buildWhatsAppOrderUrl(items, locale, {
    order_message: dict.cart.order_message,
    order_suffix: dict.cart.order_suffix,
  });

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      {/* Items */}
      <div className="lg:col-span-2">
        <AnimatePresence>
          {cartProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <p className="font-display text-3xl tracking-wider text-[var(--muted)] mb-6">
                {dict.cart.empty}
              </p>
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:gap-3 transition-all"
              >
                {dict.cart.empty_cta}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {cartProducts.map(({ item, product }) => {
                const name = getProductName(product, locale);
                const linePrice =
                  product.price !== null
                    ? formatPrice(product.price * item.qty, product.currency)
                    : dict.product.price_on_request;

                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 py-6"
                  >
                    {/* Image */}
                    <Link
                      href={`/${locale}/products/${product.id}`}
                      className="relative shrink-0 w-24 h-24 bg-[var(--surface)] border border-[var(--border)] overflow-hidden"
                    >
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${locale}/products/${product.id}`}
                        className="font-medium hover:opacity-70 transition-opacity leading-snug block"
                      >
                        {name}
                      </Link>
                      <p className="text-sm text-[var(--muted)] mt-1">{linePrice}</p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs tracking-widest uppercase text-[var(--muted)]">
                          {dict.cart.qty}
                        </span>
                        <div className="flex items-center border border-[var(--border)]">
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="p-2 hover:bg-[var(--surface)] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="p-2 hover:bg-[var(--surface)] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {cartProducts.length > 0 && (
        <div className="lg:col-span-1">
          <div className="border border-[var(--border)] p-6 sticky top-28">
            <h2 className="font-display text-2xl tracking-wider mb-6">
              {dict.cart.total}
            </h2>

            <div className="space-y-3 mb-6">
              {cartProducts.map(({ item, product }) => {
                const name = getProductName(product, locale);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[var(--muted)] truncate pr-4">
                      {name} ×{item.qty}
                    </span>
                    <span className="shrink-0 font-medium">
                      {product.price !== null
                        ? formatPrice(product.price * item.qty, product.currency)
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[var(--border)] pt-4 mb-6 flex justify-between font-medium">
              <span className="tracking-wide">{dict.cart.total}</span>
              <span>{total > 0 ? formatPrice(total, "FCFA") : "—"}</span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full px-5 py-4 bg-[var(--accent)] text-white text-sm font-medium tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all"
            >
              <MessageCircle size={18} />
              {dict.cart.order_whatsapp}
            </a>
          </div>
        </div>
      )}

      {/* Liked products */}
      {likedProducts.length > 0 && (
        <div className="lg:col-span-3 border-t border-[var(--border)] pt-12">
          <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-8">
            {dict.cart.liked_section}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {likedProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                dict={dict}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
