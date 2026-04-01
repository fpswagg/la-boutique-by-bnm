# SEO — How it is handled

This document describes how search and social previews are implemented for
**La Boutique by BNM** (Next.js 14 App Router).

## Summary

- **Page titles and descriptions** — Next.js `generateMetadata` / `metadata` per
  route.
- **Canonical / absolute URLs** — `metadataBase` on the root layout.
- **Multilingual URLs** — Locale prefix (`/fr`, `/en`, `/tr`) plus
  `alternates.languages` where defined.
- **HTML `lang`** — Set per locale via `LangSetter` (client) on
  `document.documentElement`.
- **Discoverability** — `src/app/sitemap.ts` lists localized routes and product
  URLs.
- **Social sharing** — Open Graph on the locale layout and product pages.

## Canonical site URL (`metadataBase`)

The root layout sets:

- **`metadataBase`**: `https://laboutique-bnm.com`

Relative paths in metadata (icons, OG images) resolve against this base. If the
production domain changes, update `src/app/layout.tsx` and the constant in
`src/app/sitemap.ts` so they stay in sync.

## Per-page metadata

Each important route exports metadata so crawlers get a clear **title** and
**description**:

- **Home** (`src/app/[locale]/page.tsx`) — Title and full store description from
  `STORE` for the active locale; `alternates.languages` points to `/fr`, `/en`,
  `/tr` for the home path.
- **Products listing** (`src/app/[locale]/products/page.tsx`) — Title and
  description from the UI dictionary.
- **Product detail** (`src/app/[locale]/products/[id]/page.tsx`) — Dynamic title
  is the product name; description is name plus price or “price on request”;
  Open Graph image is the first product image when available.
- **Cart** (`src/app/[locale]/cart/page.tsx`) — Title from dictionary.
- **Contact** (`src/app/[locale]/contact/page.tsx`) — Title from dictionary.

The **locale segment layout** (`src/app/[locale]/layout.tsx`) sets site-wide
defaults: title template (`%s | La Boutique by BNM`), default description from
the dictionary hero line, icons, and baseline Open Graph (title, description,
image, locale).

## Language and locale SEO

- URLs are the primary signal: **`/{locale}/...`** for `fr`, `en`, `tr`.
- **Home** exposes **`alternates.languages`** so tools can relate the three home
  URLs.
- **`LangSetter`** (`src/components/ui/LangSetter.tsx`) sets
  **`document.documentElement.lang`** to the active locale after navigation,
  which helps accessibility and matches what many crawlers expect for language.

For deeper hreflang coverage (every page, not only home), extend
`generateMetadata` on other routes with the same `alternates.languages` pattern
using full paths (e.g. `/fr/products/apple-watch-serie-11`).

## Sitemap

`src/app/sitemap.ts` generates a sitemap that includes, for **each locale**:

- Home, products index, cart, contact.
- Every **product detail** URL (`/products/[id]`).

The file uses a fixed **`BASE_URL`** (`https://laboutique-bnm.com`). Keep it
aligned with `metadataBase` and your real deployment URL.

Ensure the host serves the sitemap at **`/sitemap.xml`** (Next.js App Router
default for `sitemap.ts`). Submit that URL in Google Search Console or Bing
Webmaster Tools when the site is live.

## Open Graph and previews

- **Locale layout** — Default OG title, description, image (`/logo-dark.png`),
  and `locale` field.
- **Product pages** — OG **images** use the product’s primary image when
  possible, improving link previews on social apps.

## What is not implemented yet (optional next steps)

- **`robots.ts`** — Add if you need explicit allow/disallow rules or a sitemap
  reference in `robots.txt`.
- **JSON-LD** (e.g. `LocalBusiness`, `Product`, `Organization`) — Not present;
  useful for rich results if you add structured data in layouts or product
  pages.
- **Twitter card** fields — Can be added via the `Metadata` API if you want
  Twitter-specific tags beyond defaults.

## Operational checklist when going live

1. Confirm **`metadataBase`** and **`sitemap.ts` `BASE_URL`** match the real
   HTTPS domain.
2. Submit **`/sitemap.xml`** in search consoles.
3. Verify a few URLs with “Rich Results” or “Sharing Debugger” tools (title,
   description, OG image).
4. After content changes, rebuild/redeploy so static metadata and sitemap stay
   current.
