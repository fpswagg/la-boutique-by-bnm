import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { products } from "@/lib/products";
import { STORE } from "@/constant";
import { Banner } from "@/components/layout/Banner";
import { ProductCard } from "@/components/ui/ProductCard";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { HeroSection } from "@/components/sections/HeroSection";
import { OpeningHours } from "@/components/sections/OpeningHours";
import type { Locale } from "../../../middleware";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return {
    title: "La Boutique by BNM",
    description: STORE.description[params.locale],
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
        tr: "/tr",
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const featured = products.slice(0, 6);

  return (
    <div>
      {/* Banner — full bleed from top, transparent navbar floats over it */}
      <Banner />

      {/* Hero */}
      <HeroSection dict={dict} locale={locale} />

      {/* Share button — floating top right */}
      <div className="fixed bottom-6 right-6 z-40">
        <ShareDialog dict={dict} title="La Boutique by BNM" variant="floating" />
      </div>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
              {dict.home.featured_accent}
            </p>
            <h2 className="font-display text-5xl md:text-7xl tracking-wider">
              {dict.home.featured_title}
            </h2>
          </div>
          <Link
            href={`/${locale}/products`}
            className="hidden md:flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:gap-3 transition-all duration-200"
          >
            {dict.home.featured_cta}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              dict={dict}
            />
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href={`/${locale}/products`}
            className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:gap-3 transition-all duration-200"
          >
            {dict.home.featured_cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
              {dict.home.about_accent}
            </p>
            <h2 className="font-display text-5xl md:text-6xl tracking-wider mb-8">
              {dict.home.about_title}
            </h2>
            <p className="text-[var(--muted)] leading-relaxed text-base">
              {STORE.description[locale]}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-[var(--muted)] shrink-0" />
                <span>{STORE.location.display[locale]}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-[var(--muted)] shrink-0" />
                <a
                  href={`mailto:${STORE.email}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {STORE.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-[var(--muted)] shrink-0" />
                <a
                  href={`tel:${STORE.phone}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {STORE.phone}
                </a>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--fg)] text-[var(--bg)] text-sm font-medium tracking-widest uppercase hover:opacity-80 transition-all active:scale-95"
              >
                {dict.contact.whatsapp_cta}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Opening hours */}
          <OpeningHours dict={dict} locale={locale} />
        </div>
      </section>
    </div>
  );
}
