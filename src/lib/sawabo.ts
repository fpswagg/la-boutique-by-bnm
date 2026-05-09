import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { products, type Product } from "@/lib/products";

export type SawaboRequestType =
  | "product_submission"
  | "product_update"
  | "product_delete"
  | "general";

export type SawaboRequestStatus = "pending" | "approved" | "rejected";
export type SawaboPriority = "low" | "normal" | "high";

export interface SawaboProductMeta {
  postedAt: string;
  updatedAt: string;
  status: "published" | "archived";
  tags: string[];
  views: number;
}

export interface SawaboRequest {
  id: string;
  type: SawaboRequestType;
  status: SawaboRequestStatus;
  priority: SawaboPriority;
  requestedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  requestedBy: {
    name: string | null;
    contact: string | null;
    channel: string | null;
  };
  payload: Record<string, unknown>;
}

interface SawaboStore {
  version: number;
  productMeta: Record<string, SawaboProductMeta>;
  requests: SawaboRequest[];
}

export interface SawaboProductDetails {
  id: string;
  slug: string;
  name: Product["name"];
  category: Product["category"];
  price: number | null;
  currency: string;
  images: string[];
  primaryImage: string | null;
  imageCount: number;
  hasPrice: boolean;
  postedAt: string;
  updatedAt: string;
  status: "published" | "archived";
  tags: string[];
  views: number;
}

/**
 * Serverless runtimes (e.g. Vercel, AWS Lambda) mount the deployment at a read-only path
 * (`/var/task/...`). Only `/tmp` is writable. Local/dev uses `data/sawabo.json`.
 *
 * Override with absolute path: `SAWABO_STORE_PATH=/path/to/sawabo.json`
 */
function computeStorePath(): string {
  const override = process.env.SAWABO_STORE_PATH?.trim();
  if (override) {
    return path.isAbsolute(override)
      ? override
      : path.join(process.cwd(), override);
  }

  const serverless =
    process.env.VERCEL === "1" ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.AWS_EXECUTION_ENV;

  if (serverless) {
    return path.join("/tmp", "sawabo.json");
  }

  return path.join(process.cwd(), "data", "sawabo.json");
}

const STORE_PATH = computeStorePath();
const STORE_DIR = path.dirname(STORE_PATH);

function defaultStore(): SawaboStore {
  return {
    version: 1,
    productMeta: {},
    requests: [],
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeRequestId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `req_${Date.now()}_${random}`;
}

function buildDefaultMeta(product: Product): SawaboProductMeta {
  const timestamp = nowIso();
  const seedTags = [
    product.category.fr,
    product.category.en,
    product.category.tr,
  ].map((tag) => tag.toLowerCase());

  return {
    postedAt: timestamp,
    updatedAt: timestamp,
    status: "published",
    tags: Array.from(new Set(seedTags)),
    views: 0,
  };
}

async function ensureStoreFile(): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(defaultStore(), null, 2), "utf8");
  }
}

function normalizeStore(raw: unknown): SawaboStore {
  if (!raw || typeof raw !== "object") return defaultStore();

  const candidate = raw as Partial<SawaboStore>;
  return {
    version: typeof candidate.version === "number" ? candidate.version : 1,
    productMeta:
      candidate.productMeta && typeof candidate.productMeta === "object"
        ? (candidate.productMeta as Record<string, SawaboProductMeta>)
        : {},
    requests: Array.isArray(candidate.requests)
      ? (candidate.requests as SawaboRequest[])
      : [],
  };
}

async function saveStore(store: SawaboStore): Promise<void> {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function readSawaboStore(): Promise<SawaboStore> {
  await ensureStoreFile();
  const content = await readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(content);
  const store = normalizeStore(parsed);

  let changed = false;
  for (const product of products) {
    if (!store.productMeta[product.id]) {
      store.productMeta[product.id] = buildDefaultMeta(product);
      changed = true;
    }
  }

  if (changed) {
    await saveStore(store);
  }

  return store;
}

export async function listSawaboProducts(): Promise<SawaboProductDetails[]> {
  const store = await readSawaboStore();

  return products.map((product) => {
    const meta = store.productMeta[product.id] ?? buildDefaultMeta(product);
    return {
      id: product.id,
      slug: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      currency: product.currency,
      images: product.images,
      primaryImage: product.images[0] ?? null,
      imageCount: product.images.length,
      hasPrice: product.price !== null,
      postedAt: meta.postedAt,
      updatedAt: meta.updatedAt,
      status: meta.status,
      tags: meta.tags,
      views: meta.views,
    };
  });
}

export async function listSawaboRequests(): Promise<SawaboRequest[]> {
  const store = await readSawaboStore();
  return store.requests;
}

export async function createSawaboRequest(input: {
  type: SawaboRequestType;
  priority?: SawaboPriority;
  requestedBy?: {
    name?: string | null;
    contact?: string | null;
    channel?: string | null;
  };
  payload?: Record<string, unknown>;
}): Promise<SawaboRequest> {
  const store = await readSawaboStore();

  const request: SawaboRequest = {
    id: makeRequestId(),
    type: input.type,
    status: "pending",
    priority: input.priority ?? "normal",
    requestedAt: nowIso(),
    reviewedAt: null,
    reviewNote: null,
    requestedBy: {
      name: input.requestedBy?.name ?? null,
      contact: input.requestedBy?.contact ?? null,
      channel: input.requestedBy?.channel ?? null,
    },
    payload: input.payload ?? {},
  };

  store.requests.unshift(request);
  await saveStore(store);
  return request;
}

export async function reviewSawaboRequest(input: {
  requestId: string;
  status: Extract<SawaboRequestStatus, "approved" | "rejected">;
  reviewNote?: string | null;
}): Promise<SawaboRequest | null> {
  const store = await readSawaboStore();
  const request = store.requests.find((item) => item.id === input.requestId);
  if (!request) return null;

  request.status = input.status;
  request.reviewNote = input.reviewNote ?? null;
  request.reviewedAt = nowIso();

  await saveStore(store);
  return request;
}
