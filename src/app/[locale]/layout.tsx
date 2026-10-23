import type { Metadata } from "next";
import { locales, type Locale } from "../../../middleware";
import { getDictionary } from "@/lib/i18n";
import { getAssistant, getStoreConfig } from "@/lib/sss";
import { config } from "@/lib/config";
import { Assistant } from "@/components/ui/Assistant";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LangSetter } from "@/components/ui/LangSetter";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: {
      default: "La Boutique by BNM",
      template: "%s | La Boutique by BNM",
    },
    description: dict.home.hero_sub,
    icons: {
      icon: "/logo-light.png",
      apple: "/logo-light.png",
    },
    openGraph: {
      title: "La Boutique by BNM",
      description: dict.home.hero_sub,
      images: ["/logo-dark.png"],
      locale: params.locale,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const [storeConfig, assistant] = await Promise.all([getStoreConfig(), getAssistant()]);
  const dict = getDictionary(locale);
  const footerStore = storeConfig;

  return (
    <>
      <LangSetter locale={locale} />
      <Providers>
        <Navbar dict={dict} locale={locale} />
        <main className="min-h-screen">{children}</main>
        <Footer dict={dict} locale={locale} store={footerStore} />
        {assistant ? <Assistant apiUrl={config.apiUrl} assistant={assistant} dict={dict} /> : null}
      </Providers>
    </>
  );
}
