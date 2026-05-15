import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "../../../middleware";

interface FooterStoreContent {
  description: { fr: string; en: string; tr: string };
  location: { display: { fr: string; en: string; tr: string } };
  email: string;
  phone: string;
}

interface FooterProps {
  dict: Dictionary;
  locale: Locale;
  store: FooterStoreContent;
}

export function Footer({ dict, locale, store }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <p className="font-display text-2xl tracking-wider mb-3">LA BOUTIQUE</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {store.description[locale]}
          </p>
        </div>

        {/* Nav */}
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--muted)] mb-4">
            Navigation
          </p>
          <ul className="space-y-2">
            {[
              { href: `/${locale}`, label: dict.nav.home },
              { href: `/${locale}/products`, label: dict.nav.products },
              { href: `/${locale}/cart`, label: dict.nav.cart },
              { href: `/${locale}/contact`, label: dict.nav.contact },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--muted)] mb-4">
            {dict.contact.location_title}
          </p>
          <p className="text-sm mb-2">{store.location.display[locale]}</p>
          <a
            href={`mailto:${store.email}`}
            className="text-sm hover:opacity-60 transition-opacity block mb-1"
          >
            {store.email}
          </a>
          <a
            href={`tel:${store.phone}`}
            className="text-sm hover:opacity-60 transition-opacity block"
          >
            {store.phone}
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--border)] mx-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} La Boutique by BNM. All rights reserved.
        </p>
        <p className="text-xs text-[var(--muted)]">Yaoundé, Cameroun</p>
      </div>
    </footer>
  );
}
