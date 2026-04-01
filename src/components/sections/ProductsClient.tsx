"use client";

import { useLikes } from "@/context/LikesContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { products as allProductsList } from "@/lib/products";
import type { Product } from "@/lib/products";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "../../../middleware";
import { motion } from "framer-motion";

interface ProductsClientProps {
  dict: Dictionary;
  locale: Locale;
  grouped: Record<string, Product[]>;
  allProducts: Product[];
}

export function ProductsClient({
  dict,
  locale,
  grouped,
}: ProductsClientProps) {
  const { likedIds } = useLikes();
  const likedProducts = likedIds
    .map((id) => allProductsList.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Liked products section */}
      {likedProducts.length > 0 && (
        <section className="py-12 border-b border-[var(--border)]">
          <h2 className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-6">
            {dict.products.liked_section}
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {likedProducts.map((product) => (
              <div key={product.id} className="min-w-[180px] max-w-[180px]">
                <ProductCard product={product} locale={locale} dict={dict} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {Object.entries(grouped).map(([category, categoryProducts]) => (
        <section key={category} className="py-12 border-b border-[var(--border)] last:border-b-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="font-display text-3xl md:text-4xl tracking-wider">
              {category}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                dict={dict}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
