import { NextRequest, NextResponse } from "next/server";

export const locales = ["fr", "en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

function getLocale(request: NextRequest): Locale {
  // 1. Cookie override
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && locales.includes(cookie as Locale)) {
    return cookie as Locale;
  }

  // 2. Accept-Language header
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang
      .split(",")
      .map((s) => s.split(";")[0].trim().substring(0, 2).toLowerCase());
    for (const lang of preferred) {
      if (locales.includes(lang as Locale)) return lang as Locale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files, API routes, Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if path already has a locale prefix
  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  if (!hasLocale) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
