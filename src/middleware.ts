import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isValidAddress } from "./lib/is-valid-address";

import { REF_COOKIE_EXPIRES, REF_COOKIE_NAME, WALLET_COOKIE_NAME } from "@/constants";

export async function middleware(request: NextRequest) {
  if (request.method !== "GET") return NextResponse.next();

  const refCookie = request.cookies.get(REF_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (/\.[a-zA-Z0-9]+$/.test(pathname) || refCookie) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const userWallet = request.cookies.get(WALLET_COOKIE_NAME)?.value;

  if (url.searchParams.has("refAddr")) {

    const ref = url.searchParams.get("refAddr");
    const valid = isValidAddress(ref);

    if (!request.cookies.has(REF_COOKIE_NAME) && ref && valid && (!userWallet || userWallet !== ref)) {
      // set cookie
      const response = NextResponse.next();

      response.cookies.set(REF_COOKIE_NAME, ref, {
        maxAge: REF_COOKIE_EXPIRES,
        path: "/",
      });

      return response;
    }
  } else if (pathname.includes("/") && pathname.split("/").length === 2) {
    const address = pathname.split("/")[1]?.split("/")[0];

    if (isValidAddress(address) && (!userWallet || userWallet !== address)) {
      if (!request.cookies.has(REF_COOKIE_NAME)) {
        // set cookie
        const response = NextResponse.next();

        response.cookies.set(REF_COOKIE_NAME, address, {
          maxAge: REF_COOKIE_EXPIRES,
          path: "/",
        });

        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)",
  ]
};