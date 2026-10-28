import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { config, SSS_TAG } from "@/lib/config";

/**
 * POST /api/revalidate?secret=REVALIDATE_SECRET: fresh SSS data on the next visit
 * (after editing products or the business in the SSS app).
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret") ?? request.headers.get("x-revalidate-secret") ?? "";
  if (!config.revalidateSecret || secret !== config.revalidateSecret) {
    return NextResponse.json({ error: "Wrong or missing secret" }, { status: 401 });
  }
  revalidateTag(SSS_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
