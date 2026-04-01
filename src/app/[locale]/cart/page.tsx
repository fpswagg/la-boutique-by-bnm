import { getDictionary } from "@/lib/i18n";
import { CartClient } from "@/components/sections/CartClient";
import type { Locale } from "../../../../middleware";
import type { Metadata } from "next";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return { title: dict.cart.title };
}

export default function CartPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
            {dict.cart.accent}
          </p>
          <h1 className="font-display text-5xl md:text-7xl tracking-wider">
            {dict.cart.title}
          </h1>
        </div>

        <CartClient dict={dict} locale={locale} />
      </div>
    </div>
  );
}
