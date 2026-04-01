"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "../../../middleware";

interface LanguageSwitcherProps {
  locale: Locale;
}

const labels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  tr: "TR",
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    // Replace current locale prefix
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`text-xs font-medium tracking-widest uppercase transition-all px-1 py-0.5 rounded
            ${
              loc === locale
                ? "text-[var(--fg)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          aria-label={`Switch to ${loc}`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
