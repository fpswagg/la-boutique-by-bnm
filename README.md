# La Boutique by BNM — Developer guide

This document explains **where to change data** (products, shop info, languages, URLs) without digging through the whole codebase. The app is a Next.js site; most day-to-day edits are JSON or a single TypeScript file.

---

## 1. Products (catalog)

**File:** `data/products.json`

This is the **only place** the product list is defined. The site reads it through `src/lib/products.ts` — you do not need to touch that file for normal catalog updates.

### What each product looks like

| Field | Purpose |
| ----- | ------- |
| `id` | **Stable URL slug.** Used in links like `/fr/products/your-id-here`. Use lowercase, hyphens, no spaces. Changing `id` breaks old links and cart/likes stored in the browser for that id. |
| `name` | Object with `en`, `fr`, `tr` — display name per language. |
| `category` | Same shape — used for grouping on the products page and “related” items. |
| `price` | Number in the store’s currency, or `null` if you want “price on request” style messaging. |
| `currency` | Short code shown with the price (e.g. `FCFA`). |
| `images` | Array of **paths** starting at the site root, e.g. `"/products/my-product_01.PNG"`. Files must live under `public/`. |

### Adding a new product

1. Put image files in `public/products/` (keep names consistent, e.g. `my-gadget_01.PNG`).
2. Add a new object to the **array** in `data/products.json` (same structure as existing entries).
3. Ensure `id` is unique and image paths match real files (case-sensitive on many servers).

### Removing a product

Delete its object from `data/products.json`. Old URLs for that `id` will show the site’s not-found page.

---

## 2. Shop details (contact, hours, WhatsApp)

**File:** `src/constant.ts`

Everything under `STORE` is shop identity and contact data used in the footer, contact page, opening hours, and WhatsApp links.

| Part of `STORE` | What to change |
| --------------- | -------------- |
| `name`, `category`, `description` | Objects with `en`, `fr`, `tr` — branding and long description. |
| `location` | `city` / `country` plus `display.{en,fr,tr}` for the line shown in the UI. |
| `email`, `phone` | Plain strings. **WhatsApp** uses `phone`: spaces are stripped in code; keep a normal readable format if you like. |
| `openingHours` | One entry per day. Each has `day` (internal id), `label.{en,fr,tr}`, `opensAt` / `closesAt` as **milliseconds from midnight** (see comments in the file for examples). |

Changing `phone` here updates WhatsApp order and contact links automatically (`src/lib/whatsapp.ts` reads `STORE.phone`).

---

## 3. UI text (buttons, labels, pages)

**Folder:** `src/dictionaries/`

| File | Language |
| ---- | -------- |
| `fr.json` | French |
| `en.json` | English |
| `tr.json` | Turkish |

These files mirror the same **keys**; only the string values differ. Edit the value you need (e.g. `nav.cart`, `home.featured_title`, `contact.delivery_body`).  

**Rule:** If you add a new key in one file, add it in **all three** with the same key path, or TypeScript may complain and some locales will fall back incorrectly.

**Loading:** Dictionaries are imported in `src/lib/i18n.ts` — you rarely need to change that file unless you add a **new language** (see section 5).

---

## 4. Site URL, favicon, and SEO

Several places use the public site URL or icons. Keep them in sync when you change domain or branding assets.

| What | Where |
| ---- | ----- |
| Default metadata, favicon | `src/app/layout.tsx` — `metadata` (e.g. `metadataBase`, `icons`) |
| Per-locale metadata (Open Graph, etc.) | `src/app/[locale]/layout.tsx` — `generateMetadata` |
| Sitemap URLs | `src/app/sitemap.ts` — constant `BASE_URL` at the top |

Product and page URLs in the sitemap are built from `BASE_URL` + locale + routes; product slugs still come from `data/products.json`.

---

## 5. Languages and default locale

**File:** `middleware.ts` (project root)

| Export / constant | Role |
| ----------------- | ---- |
| `locales` | Supported language codes (e.g. `fr`, `en`, `tr`). |
| `defaultLocale` | Fallback when no cookie and no matching browser language. |
| `getLocale` logic | Cookie `NEXT_LOCALE` first, then `Accept-Language`, then default. |

Adding a new language is a larger change: extend `locales`, add `src/dictionaries/xx.json`, register it in `src/lib/i18n.ts`, and add static params / routes as needed.

---

## 6. Static assets (logos and product photos)

| Asset | Location |
| ----- | -------- |
| Store logos (banner, theme) | `public/logo-dark.png`, `public/logo-light.png` |
| Product images | `public/products/` — paths in JSON must match (including extension case) |

The banner component (`src/components/layout/Banner.tsx`) picks light vs dark logo from the current theme; metadata icons are set in layouts as documented in section 4.

---

## 7. When you need the code (quick map)

| Goal | Likely files |
| ---- | -------------- |
| Change banner height / crop | `src/components/layout/Banner.tsx` |
| Navbar, footer layout | `src/components/layout/Navbar.tsx`, `Footer.tsx` |
| Cart / likes behavior | `src/context/CartContext.tsx`, `LikesContext.tsx` |
| WhatsApp message templates | `src/lib/whatsapp.ts` + dictionary keys `cart.order_message`, `cart.order_suffix`, etc. |
| Global colors / themes | `src/app/globals.css`, `tailwind.config.ts` |

---

## 8. Running the project

From the project folder:

- Install dependencies: `npm install` or `pnpm install` (use what your team standardizes on).
- Development: `npm run dev` or `pnpm dev`.
- Production build: `npm run build` or `pnpm build`.

The app uses locale-prefixed routes (`/fr`, `/en`, `/tr`). The root `/` redirects to the default locale.

---

## Summary checklist

| I want to… | Edit |
| ---------- | ---- |
| Add / edit / remove a product | `data/products.json` + images in `public/products/` |
| Change address, email, phone, hours, descriptions | `src/constant.ts` |
| Change button or page wording | `src/dictionaries/fr.json`, `en.json`, `tr.json` (same keys) |
| Change domain or sitemap base URL | `src/app/sitemap.ts` and metadata in `layout.tsx` files |
| Change default or supported languages | `middleware.ts` (+ full i18n setup for a new language) |

If you keep products and `STORE` in sync with your real inventory and contact details, the storefront, cart WhatsApp messages, and footer will stay aligned without code changes in multiple places.
