/**
 * Legacy compatibility layer for /sawabo route.
 * Runtime state is stored in Prisma (see @/lib/sawabo/service).
 */
import {
  createExternalRequest,
  getPublishedProductsForSawabo,
  listExternalRequests,
  updateExternalRequestStatus,
} from "@/lib/sawabo/service";

export type SawaboRequestType =
  | "product_submission"
  | "product_update"
  | "product_delete"
  | "general";

export type SawaboRequestStatus = "pending" | "approved" | "rejected";
export type SawaboPriority = "low" | "normal" | "high";

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

export interface SawaboProductDetails {
  id: string;
  slug: string;
  name: { fr: string; en: string; tr: string };
  category: { fr: string; en: string; tr: string };
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

function mapExternalRequest(row: Awaited<ReturnType<typeof listExternalRequests>>[number]): SawaboRequest {
  const requestedBy = (row.requestedBy ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    type: row.type as SawaboRequestType,
    status: row.status as SawaboRequestStatus,
    priority: row.priority as SawaboPriority,
    requestedAt: row.requestedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewNote: row.reviewNote,
    requestedBy: {
      name: typeof requestedBy.name === "string" ? requestedBy.name : null,
      contact: typeof requestedBy.contact === "string" ? requestedBy.contact : null,
      channel: typeof requestedBy.channel === "string" ? requestedBy.channel : null,
    },
    payload: (row.payload ?? {}) as Record<string, unknown>,
  };
}

export async function listSawaboProducts(): Promise<SawaboProductDetails[]> {
  const rows = await getPublishedProductsForSawabo();
  const now = new Date().toISOString();

  return rows.map((product) => ({
    id: product.id,
    slug: product.id,
    name: { fr: product.nameFr, en: product.nameFr, tr: product.nameFr },
    category: { fr: "", en: "", tr: "" },
    price: product.price,
    currency: product.currency,
    images: product.images,
    primaryImage: product.images[0] ?? null,
    imageCount: product.images.length,
    hasPrice: product.price !== null,
    postedAt: now,
    updatedAt: now,
    status: "published",
    tags: product.tags,
    views: 0,
  }));
}

export async function listSawaboRequests(): Promise<SawaboRequest[]> {
  const rows = await listExternalRequests();
  return rows.map(mapExternalRequest);
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
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const row = await createExternalRequest({
    id,
    type: input.type,
    priority: input.priority,
    requestedBy: input.requestedBy,
    payload: input.payload,
  });
  return mapExternalRequest(row);
}

export async function reviewSawaboRequest(input: {
  requestId: string;
  status: Extract<SawaboRequestStatus, "approved" | "rejected">;
  reviewNote?: string | null;
}): Promise<SawaboRequest | null> {
  try {
    const row = await updateExternalRequestStatus({
      id: input.requestId,
      status: input.status,
      reviewNote: input.reviewNote ?? undefined,
    });
    return mapExternalRequest(row);
  } catch {
    return null;
  }
}
