import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isValidAddress } from "./lib/isValidAddress";

import { REF_COOKIE_EXPIRES, REF_COOKIE_NAME } from "@/constants";

export async function middleware(request: NextRequest) {
  if (request.method !== "GET") return NextResponse.next();

  const refCookie = (await cookies()).get(REF_COOKIE_NAME);

  const { pathname } = request.nextUrl;

  if (/\.[a-zA-Z0-9]+$/.test(pathname) || refCookie) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (url.searchParams.has("refAddr")) {

    const ref = url.searchParams.get("refAddr");
    const valid = ref ? await isValidAddress(ref) : false;

    if (!request.cookies.has(REF_COOKIE_NAME) && ref && valid) {
      // set cookie
      const response = NextResponse.next();

      response.cookies.set(REF_COOKIE_NAME, ref, {
        maxAge: REF_COOKIE_EXPIRES,
        path: "/",
      });

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml).*)",
  ]
};