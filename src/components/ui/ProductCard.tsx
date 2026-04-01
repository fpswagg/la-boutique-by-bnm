"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LikeButton } from "./LikeButton";
import { CartButton } from "./CartButton";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/products";
import type { Locale } from "../../../middleware";
import type { Dictionary } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}

export function ProductCard({ product, locale, dict }: ProductCardProps) {
  const name = product.name[locale] ?? product.name.fr;
  const priceStr = product.price !== null
    ? formatPrice(product.price, product.currency)
    : dict.products.price_on_request;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative"
    >
      <Link href={`/${locale}/products/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[var(--fg)]/0 group-hover:bg-[var(--fg)]/10 transition-all duration-300 flex items-center justify-center">
            <span className="text-xs font-medium tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--bg)] text-[var(--fg)] px-4 py-2">
              {dict.products.view}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1">
          <p className="text-sm font-medium tracking-wide leading-snug">{name}</p>
          <p className={`text-sm mt-0.5 ${product.price === null ? "text-[var(--muted)] text-xs tracking-wider" : "font-medium"}`}>
            {priceStr}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between mt-2">
        <CartButton
          productId={product.id}
          label={dict.products.cart}
          addedLabel={dict.product.added}
          variant="secondary"
          size="sm"
        />
        <LikeButton productId={product.id} size="sm" />
      </div>
    </motion.div>
  );
}
