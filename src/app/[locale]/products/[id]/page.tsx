import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { getProductName, formatPrice } from "@/lib/products";
import {
  getAllProducts,
  getDeliveryText,
  getAssistant,
  getProductById,
  getRelatedProducts,
} from "@/lib/sss";
import { ViewBeacon } from "@/components/ui/ViewBeacon";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { LikeButton } from "@/components/ui/LikeButton";
import { CartButton } from "@/components/ui/CartButton";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { AskAssistantButton } from "@/components/ui/Assistant";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Locale } from "../../../../../middleware";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params: _params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}): Promise<Metadata>{
  const params = await _params;
  const product = await getProductById(params.id);
  if (!product) return {};
  const dict = getDictionary(params.locale);
  const name = getProductName(product, params.locale);
  return {
    title: name,
    description: product.description[params.locale] || (product.price !== null
      ? `${name} — ${formatPrice(product.price, product.currency)}`
      : `${name} — ${dict.product.price_on_request}`),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params: _params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const params = await _params;
  const { locale, id } = params;
  const product = await getProductById(id);
  if (!product) notFound();

  const dict = getDictionary(locale);
  const name = getProductName(product, locale);
  const category = product.category[locale] ?? product.category.fr;
  const priceStr = product.price !== null
    ? formatPrice(product.price, product.currency)
    : null;
  const [relatedAll, delivery, assistant] = await Promise.all([
    getRelatedProducts(product.id, locale),
    getDeliveryText(),
    getAssistant(),
  ]);
  const related = relatedAll.slice(0, 4);
  const description = product.description[locale] || product.description.fr;

  return (
    <div className="pt-24">
      <ViewBeacon productId={product.id} locale={locale} />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Back */}
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          {dict.product.back}
        </Link>

        {/* Product grid */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Gallery */}
          <ImageGallery images={product.images} alt={name} />

          {/* Details */}
          <div className="flex flex-col">
            {/* Category breadcrumb */}
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-4">
              {category}
            </p>

            {/* Name */}
            <h1 className="font-display text-4xl md:text-5xl tracking-wider leading-tight mb-6">
              {name}
            </h1>

            {product.badge ? (
              <p className="inline-flex self-start text-[10px] font-medium tracking-widest uppercase px-2 py-1 bg-[var(--fg)] text-[var(--bg)] mb-6">
                {product.badge}
              </p>
            ) : null}

            {/* Price */}
            {priceStr ? (
              <p className="text-2xl font-medium tracking-wide mb-8">{priceStr}</p>
            ) : (
              <p className="text-sm tracking-widest uppercase text-[var(--muted)] mb-8">
                {dict.product.price_on_request}
              </p>
            )}

            {description ? (
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-8 whitespace-pre-line">
                {description}
              </p>
            ) : null}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <CartButton
                productId={product.id}
                label={dict.product.add_to_cart}
                addedLabel={dict.product.added}
                variant="primary"
              />
              <LikeButton productId={product.id} />
              <ShareDialog dict={dict} title={name} />
            </div>

            {assistant ? (
              <AskAssistantButton
                label={dict.assistant.ask_product}
                prefill={dict.assistant.ask_product_prefill.replace("{name}", name)}
                className="self-start flex items-center gap-2 text-sm underline underline-offset-4 decoration-[var(--border)] hover:decoration-[var(--fg)] mb-8 -mt-2"
              />
            ) : null}

            {/* Divider */}
            <div className="border-t border-[var(--border)] pt-6">
              <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
                {dict.contact.delivery_title}
              </p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {delivery?.[locale] || dict.contact.delivery_body}
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="border-t border-[var(--border)] pt-16">
            <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-10">
              {dict.product.related_title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
