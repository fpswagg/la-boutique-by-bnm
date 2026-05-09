# Sawabo API (`/sawabo`)

This route exposes **product snapshots** (catalog + extra metadata) and a **request queue** you can use for bots or automation (e.g. poll pending submissions, approve them, later sync into `data/products.json`).

**Implementation:** `src/app/sawabo/route.ts`  
**Storage logic:** `src/lib/sawabo.ts`  
**Persisted file:** `data/sawabo.json` (created/updated at runtime)

---

## Base URL

In development:

```text
http://localhost:3000/sawabo
```

In production, replace the host with your deployed domain:

```text
https://your-domain.com/sawabo
```

All responses are **JSON**. Send **`Content-Type: application/json`** for `POST` and `PATCH`.

---

## What the API does (high level)

| Concern | Source |
|--------|--------|
| Product **names, prices, images, categories** | `data/products.json` (read via `src/lib/products.ts`) |
| Extra **postedAt, updatedAt, tags, status, views** | `data/sawabo.json` → `productMeta` (auto-filled for each product id when missing) |
| **Incoming work** (submissions, updates, deletes) | `POST /sawabo` → appended to `requests` in `data/sawabo.json` |
| **Human/bot review** | `PATCH /sawabo` → sets `approved` / `rejected` on a request |

**Note:** Approving a request in Sawabo does **not** automatically edit `data/products.json` today. That step is for your bot or a future script.

---

## `GET /sawabo`

Returns catalog-derived products (with Sawabo metadata) and/or the request list.

### Query parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `section` | `all`, `products`, `requests` | `all` | Which payload keys to return |
| `requestStatus` | `pending`, `approved`, `rejected` | *(none)* | Filter **requests only** (products list is unchanged) |
| `limit` | positive integer | *(none)* | Max items **per list** returned (`products` slice and `requests` slice after filter) |

### Response shape (section `all`)

Top-level fields:

- **`metadata`**
  - `generatedAt` — ISO 8601 timestamp when the response was built
  - `productCount` — number of products (full catalog count, not affected by `limit`)
  - `requestCount` — number of requests **after** `requestStatus` filter (not affected by `limit`)

- **`products`** — array of product detail objects (see [Product object](#product-object-in-get-responses))

- **`requests`** — array of request objects (see [Request object](#request-object))

### Examples

**Everything (default):**

```bash
curl -s "http://localhost:3000/sawabo"
```

**Products only:**

```bash
curl -s "http://localhost:3000/sawabo?section=products"
```

**Pending requests only (typical bot poll):**

```bash
curl -s "http://localhost:3000/sawabo?section=requests&requestStatus=pending"
```

**First 20 products and first 20 matching requests:**

```bash
curl -s "http://localhost:3000/sawabo?limit=20"
```

**First 50 pending requests:**

```bash
curl -s "http://localhost:3000/sawabo?section=requests&requestStatus=pending&limit=50"
```

---

## `POST /sawabo`

Creates a **new request** and stores it in `data/sawabo.json`. Returns **201** with the created request.

### Body (JSON object)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `type` | **yes** | string | One of: `product_submission`, `product_update`, `product_delete`, `general` |
| `priority` | no | string | `low`, `normal`, `high` (default **normal** if omitted) |
| `requestedBy` | no | object | Optional actor info |
| `requestedBy.name` | no | string \| null | Display name |
| `requestedBy.contact` | no | string \| null | Email, phone, handle, etc. |
| `requestedBy.channel` | no | string \| null | e.g. `whatsapp`, `telegram`, `internal` |
| `payload` | no | object | **Your** structured data (free-form). Put proposed product fields here. |

The server always sets:

- `id` — unique request id  
- `status` — `pending`  
- `requestedAt` — ISO timestamp  
- `reviewedAt` — `null`  
- `reviewNote` — `null`  

### Example: propose a new product (bot submission)

```bash
curl -s -X POST "http://localhost:3000/sawabo" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "product_submission",
    "priority": "high",
    "requestedBy": {
      "name": "Catalog Bot",
      "contact": "bot@example.com",
      "channel": "internal"
    },
    "payload": {
      "product": {
        "id": "new-gadget-001",
        "name": {
          "fr": "Nouveau gadget",
          "en": "New gadget",
          "tr": "Yeni gadget"
        },
        "category": {
          "fr": "Accessoires",
          "en": "Accessories",
          "tr": "Aksesuarlar"
        },
        "price": 25000,
        "currency": "FCFA",
        "images": ["/products/new-gadget-001_01.PNG"]
      },
      "notes": "Images already uploaded to public/products"
    }
  }'
```

### Example: ask to remove a product

```bash
curl -s -X POST "http://localhost:3000/sawabo" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "product_delete",
    "priority": "normal",
    "payload": {
      "productId": "apple-watch-serie-10",
      "reason": "Discontinued"
    }
  }'
```

### Success response (201)

```json
{
  "message": "Request stored successfully.",
  "request": {
    "id": "req_1715280000000_ab12cd34",
    "type": "product_submission",
    "status": "pending",
    "priority": "high",
    "requestedAt": "2026-05-09T21:45:00.000Z",
    "reviewedAt": null,
    "reviewNote": null,
    "requestedBy": {
      "name": "Catalog Bot",
      "contact": "bot@example.com",
      "channel": "internal"
    },
    "payload": { }
  }
}
```

### Error responses (400)

| Situation | Example body |
|-----------|----------------|
| Invalid JSON | `{ "error": "Invalid JSON body." }` |
| Body not an object | `{ "error": "Body must be an object." }` |
| Invalid `type` | `{ "error": "Invalid request type. Use one of: ..." }` |
| Invalid `priority` | `{ "error": "Invalid priority. Use one of: low, normal, high." }` |

---

## `PATCH /sawabo`

Marks a request as **approved** or **rejected** (review step). Returns **200** with the updated request, **404** if `requestId` is unknown.

### Body (JSON object)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `requestId` | **yes** | string | Value returned in `POST` as `request.id` |
| `status` | **yes** | string | `approved` or `rejected` |
| `reviewNote` | no | string | Optional note (stored on the request) |

### Example: approve a request

```bash
curl -s -X PATCH "http://localhost:3000/sawabo" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "req_1715280000000_ab12cd34",
    "status": "approved",
    "reviewNote": "Synced to catalog manually"
  }'
```

### Example: reject a request

```bash
curl -s -X PATCH "http://localhost:3000/sawabo" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "req_1715280000000_ab12cd34",
    "status": "rejected",
    "reviewNote": "Duplicate SKU"
  }'
```

### Success response (200)

```json
{
  "message": "Request reviewed successfully.",
  "request": {
    "id": "req_1715280000000_ab12cd34",
    "status": "approved",
    "reviewedAt": "2026-05-09T22:00:00.000Z",
    "reviewNote": "Synced to catalog manually"
  }
}
```

*(Other fields on `request` are unchanged except those listed.)*

### Error responses

| HTTP | Body |
|------|------|
| 400 | `{ "error": "Invalid JSON body." }` |
| 400 | `{ "error": "requestId is required." }` |
| 400 | `{ "error": "status must be approved or rejected." }` |
| 404 | `{ "error": "Request not found." }` |

---

## Reference: shapes

### Product object (in `GET` responses)

Each item includes catalog fields plus Sawabo metadata:

| Field | Meaning |
|-------|---------|
| `id` | Product id (same as URL slug under `/[locale]/products/[id]`) |
| `slug` | Same as `id` today |
| `name` | `{ en, fr, tr }` |
| `category` | `{ en, fr, tr }` |
| `price` | Number or `null` |
| `currency` | e.g. `FCFA` |
| `images` | Array of paths under `public/` |
| `primaryImage` | First image path or `null` |
| `imageCount` | Length of `images` |
| `hasPrice` | `price !== null` |
| `postedAt`, `updatedAt` | ISO timestamps from Sawabo meta |
| `status` | `published` or `archived` |
| `tags` | String array |
| `views` | Number (reserved for future use; starts at `0`) |

### Request object

| Field | Meaning |
|-------|---------|
| `id` | Unique id (`req_...`) |
| `type` | `product_submission` \| `product_update` \| `product_delete` \| `general` |
| `status` | `pending` \| `approved` \| `rejected` |
| `priority` | `low` \| `normal` \| `high` |
| `requestedAt`, `reviewedAt` | ISO timestamps |
| `reviewNote` | String or `null` |
| `requestedBy` | `{ name, contact, channel }` (each nullable) |
| `payload` | Arbitrary JSON object you sent |

---

## Suggested bot workflow

1. **Poll** `GET /sawabo?section=requests&requestStatus=pending&limit=50`.
2. For each request, read `type` and `payload`.
3. If your policy requires approval, wait until a human (or admin tool) calls **`PATCH`** — or auto-approve in your own service.
4. When you actually publish to the storefront, edit **`data/products.json`** (and add files under **`public/products/`**) — then redeploy or reload as you usually do.
5. Optionally call **`PATCH`** with `approved` and a note when done.

---

## Operations checklist

| Task | How |
|------|-----|
| Back up Sawabo data | Copy `data/sawabo.json` |
| Reset requests only | Edit `data/sawabo.json` → set `"requests": []` (keep `productMeta` if you want) |
| Full reset | Delete `data/sawabo.json`; it will be recreated with empty meta (product meta will be regenerated on next access) |

---

## Security note

These routes are **unauthenticated** in the current codebase. If you expose them publicly, add authentication (e.g. shared secret header, API key, or IP allowlist) before production use.
