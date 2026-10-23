import { NextResponse, type NextRequest } from "next/server";

/** Tells the dashboard layout which page is open (to come back after a token refresh). */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/dashboard", "/dashboard/:path*"] };
