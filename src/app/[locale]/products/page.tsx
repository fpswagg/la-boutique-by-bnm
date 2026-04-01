import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { products, groupByCategory } from "@/lib/products";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { ProductsClient } from "@/components/sections/ProductsClient";
import type { Locale } from "../../../../middleware";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: dict.products.title,
    description: dict.products.all_products,
  };
}

export default function ProductsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const grouped = groupByCategory(products, locale);

  return (
    <div className="pt-24">
      {/* Page header */}
      <div className="mx-auto max-w-7xl px-6 py-12 flex items-end justify-between border-b border-[var(--border)]">
        <div>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
            {dict.products.accent}
          </p>
          <h1 className="font-display text-5xl md:text-7xl tracking-wider">
            {dict.products.title}
          </h1>
        </div>
        <div className="hidden md:block">
          <ShareDialog dict={dict} title={dict.products.title} />
        </div>
      </div>

      {/* Client section: liked row + product grid */}
      <ProductsClient
        dict={dict}
        locale={locale}
        grouped={grouped}
        allProducts={products}
      />

      {/* Mobile share */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <ShareDialog dict={dict} title={dict.products.title} variant="floating" />
      </div>
    </div>
  );
}
