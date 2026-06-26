/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const adminToken = process.env.ADMIN_TOKEN || "admin-secret";
    const headerToken = request.headers.get("x-admin-token");
    const cookieToken = request.cookies.get("admin_token")?.value;

    if (headerToken !== adminToken && cookieToken !== adminToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
