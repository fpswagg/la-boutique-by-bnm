# La Boutique by BNM

Showcase and shop site (Next.js 14, FR / EN / TR) for La Boutique by BNM, Yaoundé.

**No database and no storage of its own: everything lives in [SSS](https://sss.fpswagg.site).**

- **Catalogue, business info and opening hours**: read from SSS with the business API key (`SSS_API_KEY`) and cached for `SSS_REVALIDATE` seconds. Translations live in each product's `metadata.i18n.{en,tr}`. The product URL id is the SSS `sku`.
- **Cart orders**: created in SSS (Sasto `order`), visible in the SSS app and in the dashboard. They are also sent on WhatsApp.
- **Views**: counted in the product metadata (`views`, `daily`).
- **Images**: stored in SSS files (SA Storage behind it).

## Dashboard: `/dashboard`

Sign in with SSS (OAuth + PKCE). Only members of this business get in, with the rights their role gives in SSS (`business:read` = read-only).

- Overview: views (today / week / month), low stock, pending orders.
- Orders: filter by status, change status (delivered = fulfilled in SSS, with invoice), WhatsApp the customer.
- Products: create, edit (FR/EN/TR, badge, featured, order, tags), duplicate, delete, stock, images.
- Business: contact details, descriptions, delivery, opening hours (same profile as SSS).

Saving refreshes the public site at once.

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local` and fill it in. You need an SSS API key and an OAuth app of the business, with redirect `SITE_URL/auth/sss/callback`.
3. `pnpm dev`

`POST /api/revalidate` (header `x-revalidate-secret: REVALIDATE_SECRET`) refreshes the cache, e.g. from an SSS webhook.
