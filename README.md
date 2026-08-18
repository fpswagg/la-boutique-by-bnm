# La Boutique by BNM — Developer Guide

This project runs with **Prisma + PostgreSQL** and **SA Storage**:

- **Storefront reads from DB** (not from `data/products.json` directly).
- **Admin dashboard lives at a secret URL** (`/dashboard/<DASHBOARD_PASSWORD>`).
- **Images are uploaded as files** to [SA Storage](https://sastorage.fpswagg.site) and old images are cleaned up when removed.

---

## 1) Quick setup

1. Copy `.env.example` to `.env.local`.
2. Fill all variables.
3. Run installs and Prisma:
   - `pnpm install`
   - `npx prisma generate`
   - `npx prisma migrate deploy` (or `npx prisma migrate dev` locally)
   - `npx prisma db seed`
4. Start app: `pnpm dev`

---

## 2) Required environment variables

Defined in `.env.example`:

- `DATABASE_URL` (PostgreSQL URL used by the Next.js app and `prisma/seed.ts`)
- `DIRECT_URL` (PostgreSQL URL used as `datasource.url` in `prisma.config.ts` for Prisma CLI / migrations — v7 removed `directUrl` from config)
- `SA_STORAGE_URL` (default: `https://sastorage.fpswagg.site`)
- `SA_STORAGE_TOKEN` (Bearer token `sa_…` from SA Storage dashboard → API tokens; needs `files:write` and `files:delete`)
- `DASHBOARD_PASSWORD` (secret path token)

---

## 3) Dashboard access (no visible button)

The dashboard is intentionally hidden from public navigation.

- Access pattern: `/dashboard/<DASHBOARD_PASSWORD>`
- Example: `/dashboard/my-very-secret-token`
- Wrong token returns a 404-style response.

Main pages:

- `/dashboard/<token>` → overview + analytics
- `/dashboard/<token>/products` → product CRUD and stock updates
- `/dashboard/<token>/products/new` → create product with file uploads
- `/dashboard/<token>/products/<id>` → edit product, delete image, add images
- `/dashboard/<token>/store` → update store profile and opening hours

---

## 4) Data source of truth

### Runtime source

- Products, stock, analytics, store config, opening hours: **PostgreSQL**
- Product images: **SA Storage** (`https://sastorage.fpswagg.site/files/...`)

### Seed/bootstrap source

- `data/products.json`
- `src/constant.ts`
- `public/products/*`

These files are used by `prisma/seed.ts` to initialize DB/storage. After seeding, storefront uses DB data.

---

## 5) File map (important backend files)

| Purpose | File |
| --- | --- |
| Prisma schema | `prisma/schema.prisma` |
| Prisma config (v7) | `prisma.config.ts` |
| Seed script | `prisma/seed.ts` |
| Prisma singleton | `src/lib/db.ts` |
| SA Storage client | `src/lib/sastorage.ts` |
| DB product helpers | `src/lib/db/products.ts` |
| DB store helpers | `src/lib/db/store.ts` |
| DB analytics helpers | `src/lib/db/analytics.ts` |
| Dashboard actions | `src/app/dashboard/[token]/actions.ts` |

---

## 6) How product CRUD works

### Create

- Form sends translatable fields (`fr/en/tr`), price, stock, status, tags, files.
- Server action uploads files to SA Storage (`POST /api/files`).
- Public URLs (`/files/{key}`) are saved in DB `Product.images`.
- Storefront pages are revalidated.

### Update

- Existing image URLs are kept through hidden fields.
- New files are uploaded and merged.
- Removed old URLs are deleted from SA Storage.
- DB row is updated.
- Storefront revalidated.

### Delete

- Product row is removed from DB.
- All related storage files are removed from SA Storage.

### Stock

- Inline stock update in dashboard list calls a dedicated action.

---

## 7) Analytics behavior

Current analytics model:

- `view` events are recorded from product detail page render path.
- Overview page aggregates:
  - total products
  - published products
  - low-stock products
  - order count
  - events today
  - top viewed products chart
  - recent events table

---

## 8) Storefront DB usage

Storefront product routes now pull from DB:

- home featured products
- products catalog page
- product detail + related products
- cart page product mapping
- sitemap product URLs

---

## 9) Commands reference

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `npx prisma generate` — regenerate client
- `npx prisma migrate dev --name <name>` — local migration creation/application
- `npx prisma migrate deploy` — apply migrations in production
- `npx prisma db seed` — seed DB and attempt storage uploads

---

## 10) Notes and caveats

- Prisma v7 requires `prisma.config.ts`. The CLI uses `datasource.url` only (no `directUrl`); this project sets it to `DIRECT_URL` while the app uses `DATABASE_URL`.
- Seeding storage uploads requires a valid `SA_STORAGE_TOKEN`.
- If storage env vars are missing during seed, image URLs fall back to local paths.
- `DASHBOARD_PASSWORD` is sensitive; keep it out of client code and public docs.
