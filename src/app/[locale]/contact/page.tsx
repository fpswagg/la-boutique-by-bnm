import type { Metadata } from "next";
import { MapPin, Package, Truck } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { STORE } from "@/constant";
import { ContactChat } from "@/components/sections/ContactChat";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";
import type { Locale } from "../../../../middleware";

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return { title: dict.contact.title };
}

export default function ContactPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const whatsappUrl = buildWhatsAppContactUrl(dict.contact.bubble_1);

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
            {dict.contact.accent}
          </p>
          <h1 className="font-display text-5xl md:text-7xl tracking-wider">
            {dict.contact.title}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Chat bubbles + CTA */}
          <div>
            <ContactChat dict={dict} whatsappUrl={whatsappUrl} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-8">
            {/* Opening hours */}
            <OpeningHours dict={dict} locale={locale} />

            {/* Delivery info */}
            <div className="border border-[var(--border)] p-6 bg-[var(--surface)]">
              <h3 className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-6">
                {dict.contact.delivery_title}
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 border border-[var(--border)] flex items-center justify-center">
                    <Truck size={18} className="text-[var(--muted)]" />
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {dict.contact.delivery_body}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 border border-[var(--border)] flex items-center justify-center">
                    <Package size={18} className="text-[var(--muted)]" />
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {locale === "fr"
                      ? "Expédition possible pour toutes les régions. Conditions et tarifs à discuter directement avec le vendeur."
                      : locale === "tr"
                      ? "Tüm bölgelere kargo mümkündür. Koşullar ve fiyatlar doğrudan satıcıyla görüşülür."
                      : "Shipping available to all regions. Conditions and rates to be discussed directly with the seller."}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border border-[var(--border)] p-6 bg-[var(--surface)]">
              <h3 className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-4">
                {dict.contact.location_title}
              </h3>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[var(--muted)] shrink-0" />
                <span className="text-sm">{STORE.location.display[locale]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
