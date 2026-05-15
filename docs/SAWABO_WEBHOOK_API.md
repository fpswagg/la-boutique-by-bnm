# Sawabo Webhook API — External Implementer Spec

This document describes everything your external Sawabo API must do to send commands to the Sawabo bot and receive results back. The bot listens on a dedicated webhook endpoint. You sign every request with a shared secret; the bot verifies it, executes the action, and either returns the result inline or POSTs a callback to your configured URL.

---

## 1. Overview

```
Your Sawabo API
     │
     │  POST /api/webhook/sawabo/<sessionKey>
     │  Content-Type: application/json
     │  X-Sawabo-Signature: sha256=<hmac-sha256>
     │  body: { "action": "...", "data": {...}, "requestId": "..." }
     │
     ▼
Sawabo Bot (this bot)
     │  verify HMAC, rate-limit, log, dispatch
     │
     ├─ sync actions → HTTP 200 { ok, result }
     └─ async actions → HTTP 202 { ok, requestId, status:"accepted" }
          │
          └─► POST <callbackUrl> { requestId, status:"done"|"failed", result? }
```

**Base URL:** wherever the bot is deployed, e.g. `https://yourbot.example.com`  
**Endpoint:** `POST /api/webhook/sawabo/<sessionKey>`  
**`sessionKey`:** the internal identifier of the WhatsApp session (shown in the bot's admin dashboard → Behaviours → Sawabo API panel).

---

## 2. Authentication — HMAC-SHA256

Every request **must** carry a signature header. The bot rejects requests with a missing or invalid signature with `401`.

### Header

```
X-Sawabo-Signature: sha256=<hex-encoded HMAC>
```

### Signing algorithm

1. Take the **raw request body** as a UTF-8 byte string (before any JSON parsing).
2. Compute `HMAC-SHA256(secret, rawBody)`.
3. Hex-encode the digest.
4. Prefix with `sha256=`.

**Secret:** the 64-character hex string shown in the admin panel under "Sawabo API → Webhook Secret". Treat it like a password.

### Node.js example

```js
const crypto = require("crypto");

function signBody(secret, bodyString) {
  return "sha256=" + crypto.createHmac("sha256", secret).update(bodyString).digest("hex");
}

const body = JSON.stringify({ action: "ping", data: {}, requestId: "req-001" });
const sig = signBody(process.env.SAWABO_WEBHOOK_SECRET, body);

await fetch(`${BOT_BASE_URL}/api/webhook/sawabo/${SESSION_KEY}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Sawabo-Signature": sig,
  },
  body,
});
```

### Python example

```python
import hmac, hashlib, json, os, requests

def sign_body(secret: str, body: str) -> str:
    mac = hmac.new(secret.encode(), body.encode(), hashlib.sha256)
    return "sha256=" + mac.hexdigest()

body = json.dumps({"action": "ping", "data": {}, "requestId": "req-001"})
sig = sign_body(os.environ["SAWABO_WEBHOOK_SECRET"], body)

requests.post(
    f"{BOT_BASE_URL}/api/webhook/sawabo/{SESSION_KEY}",
    headers={"Content-Type": "application/json", "X-Sawabo-Signature": sig},
    data=body,
)
```

---

## 3. Request Format

All requests use the same top-level envelope:

```json
{
  "action": "<action_name>",
  "requestId": "<your-unique-id>",
  "data": { /* action-specific fields — see section 5 */ }
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | `string` | yes | One of the actions listed in section 5 |
| `requestId` | `string` | recommended | Idempotency key; if a request with this ID was already processed within 24 h the bot returns the cached result without re-executing |
| `data` | `object` | depends | Action-specific payload (see section 5) |

---

## 4. Response Format

### Sync response (HTTP 200)

```json
{
  "ok": true,
  "requestId": "req-001",
  "action": "ping",
  "status": "done",
  "result": { /* action-specific result */ }
}
```

### Async accepted (HTTP 202)

Returned for actions that take time (downloading images, sending to many groups, etc.).

```json
{
  "ok": true,
  "requestId": "req-001",
  "action": "post_product",
  "status": "accepted"
}
```

The final result is delivered via callback (see section 6) when the operation finishes.

### Error (HTTP 4xx / 5xx)

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ACTION",
    "message": "Action 'foo' is not allowed or does not exist"
  }
}
```

| HTTP | Error code | Meaning |
|------|-----------|---------|
| 401 | `WEBHOOK_AUTH_FAILED` | Missing or invalid HMAC signature |
| 403 | `WEBHOOK_DISABLED` | Webhook is disabled for this session |
| 403 | `ACTION_NOT_ALLOWED` | Action not in the allowed-actions list |
| 404 | `SESSION_NOT_FOUND` | `sessionKey` not found |
| 409 | `SESSION_NOT_READY` | WhatsApp is not connected |
| 409 | `DUPLICATE_REQUEST` | (only when idempotency key already `FAILED`) retry allowed |
| 429 | `RATE_LIMITED` | Exceeded `maxRequestsPerHour` |
| 400 | `INVALID_PAYLOAD` | Validation error in `data` |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## 5. Actions

### 5.1 `ping`
**Execution:** sync  
**Description:** Connectivity and auth health-check.

**`data`:** `{}` (empty)

**Result:**
```json
{
  "pong": true,
  "sessionKey": "bot1",
  "ready": true,
  "ts": "2026-05-14T02:00:00.000Z"
}
```

---

### 5.2 `get_status`
**Execution:** sync  
**Description:** Get the WhatsApp session connection status.

**`data`:** `{}` (empty)

**Result:**
```json
{
  "state": "ready",
  "displayName": "My Bot",
  "sessionKey": "bot1"
}
```

---

### 5.3 `get_groups`
**Execution:** sync  
**Description:** List the WhatsApp groups the bot is currently in.

**`data`:** `{}` (empty)

**Result:**
```json
{
  "groups": [
    { "id": "120363123456789012@g.us", "name": "My Store Group", "isGroup": true }
  ]
}
```

---

### 5.4 `get_jobs`
**Execution:** sync  
**Description:** Get the Products2 job queue for this session.

**`data`:** `{ "limit"?: number }` (default 50)

**Result:**
```json
{
  "jobs": [
    {
      "id": "job_abc",
      "kind": "REPEAT",
      "status": "PENDING",
      "nextRunAt": "2026-05-15T06:00:00.000Z",
      "productIds": ["prod_1", "prod_2"],
      "groupIds": ["120363...@g.us"],
      "postedCount": 14,
      "staleCount": 0
    }
  ],
  "total": 1
}
```

---

### 5.5 `get_activity`
**Execution:** sync  
**Description:** Get recent posting activity (tracker rows).

**`data`:** `{ "limit"?: number }` (default 50, max 200)

**Result:**
```json
{
  "activity": [
    {
      "productId": "prod_1",
      "groupId": "120363...@g.us",
      "postedAt": "2026-05-14T01:30:00.000Z",
      "lastMessageId": "true_120363..._3EB0..."
    }
  ]
}
```

---

### 5.6 `send_text`
**Execution:** sync  
**Description:** Send a plain text message to one or more WhatsApp groups.

**`data`:**
```ts
{
  text: string;             // required; the message body (supports *bold* _italic_)
  groupIds?: string[];      // if omitted, falls back to defaultGroupIds in webhook config
}
```

**Result:**
```json
{
  "sent": 2,
  "groupIds": ["120363...@g.us", "120363...@g.us"]
}
```

---

### 5.7 `send_media`
**Execution:** async (202)  
**Description:** Download an image from a URL and send it with a caption to groups.

**`data`:**
```ts
{
  imageUrl: string;         // publicly accessible image URL
  caption?: string;         // message caption (optional)
  groupIds?: string[];
}
```

**Callback result:**
```json
{
  "sent": 2,
  "groupIds": ["..."]
}
```

---

### 5.8 `post_product`
**Execution:** async (202)  
**Description:** Fetch a product from the configured catalog URL and post it to WhatsApp groups with the standard Products2 caption format.

**`data`:**
```ts
{
  productId: string;                            // ID of the product on the Sawabo API
  groupIds?: string[];                          // fallback to webhook defaultGroupIds
  attachProductUrl?: boolean;                   // append the product page URL to caption
  skipAlreadyPostedHere?: boolean;              // skip groups where product was already posted
  productData?: {                               // provide inline to skip API fetch
    name?: { fr?: string; en?: string };
    category?: { fr?: string; en?: string };
    price?: number;
    currency?: string;
    images?: string[];
    status?: string;
    updatedAt?: string;
  };
}
```

**Callback result:**
```json
{
  "posted": 2,
  "stale": 0,
  "groups": ["...@g.us", "...@g.us"],
  "jobId": "job_xyz"
}
```

---

### 5.9 `post_products`
**Execution:** async (202)  
**Description:** Fetch and post multiple products (sequentially, with configured `sendDelayMs`).

**`data`:**
```ts
{
  productIds: string[];     // at least 1, max 100
  groupIds?: string[];
  attachProductUrl?: boolean;
  skipAlreadyPostedHere?: boolean;
}
```

**Callback result:**
```json
{
  "posted": 6,
  "stale": 1,
  "jobId": "job_xyz"
}
```

---

### 5.10 `create_job`
**Execution:** sync  
**Description:** Create a Products2 job (POST_NOW, POST_LATER, or REPEAT). This is the same as calling the bot's admin `/api/behaviours/products2/jobs` endpoint but triggered from the Sawabo API.

**`data`:**
```ts
{
  kind: "POST_NOW" | "POST_LATER" | "REPEAT";
  productIds: string[];             // min 1
  groupIds?: string[];
  title?: string;
  attachProductUrl?: boolean;
  skipAlreadyPostedHere?: boolean;
  runAt?: string;                   // ISO 8601; required for POST_LATER and REPEAT
  repeat?: {
    frequency: "daily" | "weekly";
    interval: number;               // every N days or weeks
    weekdays?: number[];            // 0=Sun … 6=Sat; weekly only
  };
}
```

**Result:**
```json
{
  "jobId": "job_xyz",
  "kind": "POST_LATER",
  "runAt": "2026-05-15T08:00:00.000Z"
}
```

---

### 5.11 `cancel_job`
**Execution:** sync  
**Description:** Cancel a Products2 job.

**`data`:** `{ "jobId": "job_xyz" }`

**Result:** `{ "cancelled": true }`

---

### 5.12 `pause_job`
**Execution:** sync  
**Description:** Pause a PENDING job.

**`data`:** `{ "jobId": "job_xyz" }`

**Result:** `{ "paused": true }`

---

### 5.13 `resume_job`
**Execution:** sync  
**Description:** Resume a PAUSED job.

**`data`:** `{ "jobId": "job_xyz" }`

**Result:** `{ "resumed": true }`

---

### 5.14 `run_job_now`
**Execution:** async (202)  
**Description:** Immediately run a PENDING or PAUSED job regardless of its `nextRunAt`.

**`data`:** `{ "jobId": "job_xyz" }`

**Callback result:**
```json
{
  "posted": 4,
  "stale": 0
}
```

---

### 5.15 `notify_order`
**Execution:** sync  
**Description:** Send a formatted order-confirmation message to WhatsApp groups.

**`data`:**
```ts
{
  orderId: string;
  customerName?: string;
  productName: string;
  quantity?: number;
  price?: number;
  currency?: string;
  extraNote?: string;
  groupIds?: string[];
}
```

**Generated message format:**
```
🛒 *Nouvelle Commande*

Produit: *<productName>* × <quantity>
Prix: *<price> <currency>*
Client: <customerName>
Commande n°: <orderId>
<extraNote>
```

**Result:** `{ "sent": 2 }`

---

### 5.16 `notify_restock`
**Execution:** sync  
**Description:** Send a restock / back-in-stock alert for a product.

**`data`:**
```ts
{
  productId: string;
  productName?: string;       // shown in message
  productUrl?: string;
  imageUrl?: string;          // if provided, sends as media (async)
  groupIds?: string[];
}
```

**Generated message format:**
```
🔔 *Retour en stock!*

*<productName>* est de nouveau disponible.
<productUrl>
```

**Execution:** sync if no `imageUrl`, async (202) if `imageUrl` provided.  
**Result (sync):** `{ "sent": 2 }`

---

### 5.17 `notify_custom`
**Execution:** sync  
**Description:** Send a message rendered from a simple named-variable template.

**`data`:**
```ts
{
  template: string;     // message string with {{variable}} placeholders
  vars?: Record<string, string | number>;
  groupIds?: string[];
}
```

**Example:**
```json
{
  "template": "⚡ Promo *{{discount}}%* sur {{product}} jusqu'au {{date}}!",
  "vars": { "discount": 20, "product": "Robe Wax", "date": "20 Mai" },
  "groupIds": ["120363...@g.us"]
}
```

**Result:** `{ "sent": 1 }`

---

## 6. Callbacks

When an async action finishes, the bot POSTs to your configured `callbackUrl`:

```
POST <callbackUrl>
Content-Type: application/json
X-Sawabo-Callback-Signature: sha256=<hmac-sha256>
X-Sawabo-Request-Id: <requestId>

{
  "requestId": "req-001",
  "action": "post_product",
  "status": "done" | "failed",
  "result": { /* action-specific result, omitted on failure */ },
  "error": { "code": "...", "message": "..." }  /* only on failure */
}
```

### Verifying callback authenticity

Compute `HMAC-SHA256(callbackSecret, rawBody)` and compare to `X-Sawabo-Callback-Signature`.  
If you did not set a `callbackSecret`, the header is omitted — but you should set one.

### Callback retry policy

The bot will retry failed callbacks (non-2xx response) up to **3 times** with exponential backoff (10 s, 60 s, 300 s). After 3 failures, the request is marked `callbackError` in the log and no further retries occur.

### Your callback endpoint requirements

- Accept `POST` with `Content-Type: application/json`.
- Return `2xx` within **10 seconds** (bot times out after 10 s and schedules retry).
- Respond with any body; the content is not parsed.

---

## 7. Rate Limiting

Default: **60 requests per hour per session**.  
When exceeded, the bot returns HTTP `429` with `RATE_LIMITED`.

The limit can be configured in the admin panel (Sawabo API → Rate limit).

---

## 8. Idempotency

- Include a unique `requestId` in every request.
- If the same `requestId` is seen again within **24 hours**, the bot returns the original result immediately without re-executing the action.
- `requestId` should be a UUID v4 or any unique string up to 128 characters.

---

## 9. Quick Setup Checklist (Sawabo API Side)

1. **Bot admin panel** → Behaviours → assign `sawabo-api` to your session → save.
2. **Bot admin panel** → Behaviours → Sawabo API panel → copy the `sessionKey` and `Webhook Secret`.
3. **Your API:** store `SAWABO_WEBHOOK_URL = https://<bot>/api/webhook/sawabo/<sessionKey>` and `SAWABO_WEBHOOK_SECRET = <secret>` in environment.
4. Implement HMAC signing as shown in section 2.
5. **Optionally:** configure `callbackUrl` in the admin panel so async results are pushed back to you.
6. **Test:** send a `ping` action; expect `{ "ok": true, "result": { "pong": true } }`.

---

## 10. Full Action Summary Table

| Action | Sync/Async | Session must be ready? | Min data |
|--------|-----------|------------------------|----------|
| `ping` | sync | no | – |
| `get_status` | sync | no | – |
| `get_groups` | sync | yes | – |
| `get_jobs` | sync | no | – |
| `get_activity` | sync | no | – |
| `send_text` | sync | yes | `text` |
| `send_media` | async | yes | `imageUrl` |
| `post_product` | async | yes | `productId` |
| `post_products` | async | yes | `productIds[]` |
| `create_job` | sync | no | `kind`, `productIds[]` |
| `cancel_job` | sync | no | `jobId` |
| `pause_job` | sync | no | `jobId` |
| `resume_job` | sync | no | `jobId` |
| `run_job_now` | async | yes | `jobId` |
| `notify_order` | sync | yes | `orderId`, `productName` |
| `notify_restock` | sync/async | yes | `productId` |
| `notify_custom` | sync | yes | `template` |

---

## 11. TypeScript Types (for SDK authors)

```ts
// Envelope
type WebhookRequest<A extends string, D> = {
  action: A;
  requestId?: string;
  data: D;
};

// Sync response
type SyncResponse<R> = {
  ok: true;
  requestId?: string;
  action: string;
  status: "done";
  result: R;
};

// Async accepted
type AsyncAccepted = {
  ok: true;
  requestId?: string;
  action: string;
  status: "accepted";
};

// Error response
type ErrorResponse = {
  ok: false;
  error: { code: string; message: string };
};

// Callback payload
type CallbackPayload<R> = {
  requestId?: string;
  action: string;
  status: "done" | "failed";
  result?: R;
  error?: { code: string; message: string };
};
```

---

*This document is generated by the Sawabo implementation plan. Update it whenever new actions are added to `src/behaviour/sawaboApiService.ts`.*
