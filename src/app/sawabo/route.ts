import { NextResponse } from "next/server";
import {
  createSawaboRequest,
  listSawaboProducts,
  listSawaboRequests,
  reviewSawaboRequest,
  type SawaboPriority,
  type SawaboRequestStatus,
  type SawaboRequestType,
} from "@/lib/sawabo";

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

function isRequestType(value: unknown): value is SawaboRequestType {
  return (
    value === "product_submission" ||
    value === "product_update" ||
    value === "product_delete" ||
    value === "general"
  );
}

function isPriority(value: unknown): value is SawaboPriority {
  return value === "low" || value === "normal" || value === "high";
}

function isReviewStatus(
  value: unknown
): value is Extract<SawaboRequestStatus, "approved" | "rejected"> {
  return value === "approved" || value === "rejected";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") ?? "all";
  const limit = parsePositiveInt(searchParams.get("limit"));
  const requestStatus = searchParams.get("requestStatus");

  const products = await listSawaboProducts();
  const requests = await listSawaboRequests();

  const filteredRequests =
    requestStatus && ["pending", "approved", "rejected"].includes(requestStatus)
      ? requests.filter((item) => item.status === requestStatus)
      : requests;

  const limitedProducts = limit ? products.slice(0, limit) : products;
  const limitedRequests = limit ? filteredRequests.slice(0, limit) : filteredRequests;

  const metadata = {
    generatedAt: new Date().toISOString(),
    productCount: products.length,
    requestCount: filteredRequests.length,
  };

  if (section === "products") {
    return NextResponse.json({ metadata, products: limitedProducts });
  }

  if (section === "requests") {
    return NextResponse.json({ metadata, requests: limitedRequests });
  }

  return NextResponse.json({
    metadata,
    products: limitedProducts,
    requests: limitedRequests,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Body must be an object." },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;

  if (!isRequestType(payload.type)) {
    return NextResponse.json(
      {
        error:
          "Invalid request type. Use one of: product_submission, product_update, product_delete, general.",
      },
      { status: 400 }
    );
  }

  const priority = payload.priority;
  if (priority !== undefined && !isPriority(priority)) {
    return NextResponse.json(
      { error: "Invalid priority. Use one of: low, normal, high." },
      { status: 400 }
    );
  }

  const created = await createSawaboRequest({
    type: payload.type,
    priority: payload.priority as SawaboPriority | undefined,
    requestedBy:
      payload.requestedBy && typeof payload.requestedBy === "object"
        ? (payload.requestedBy as {
            name?: string | null;
            contact?: string | null;
            channel?: string | null;
          })
        : undefined,
    payload:
      payload.payload && typeof payload.payload === "object"
        ? (payload.payload as Record<string, unknown>)
        : {},
  });

  return NextResponse.json(
    {
      message: "Request stored successfully.",
      request: created,
    },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Body must be an object." },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;
  const requestId = payload.requestId;

  if (typeof requestId !== "string" || requestId.trim().length === 0) {
    return NextResponse.json(
      { error: "requestId is required." },
      { status: 400 }
    );
  }

  if (!isReviewStatus(payload.status)) {
    return NextResponse.json(
      { error: "status must be approved or rejected." },
      { status: 400 }
    );
  }

  const updated = await reviewSawaboRequest({
    requestId,
    status: payload.status,
    reviewNote:
      typeof payload.reviewNote === "string" ? payload.reviewNote : null,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Request not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Request reviewed successfully.",
    request: updated,
  });
}
