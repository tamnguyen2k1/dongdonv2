import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE =
  process.env.NEXT_PUBLIC_MAINTENANCE === "true";

export default function proxy(
  req: NextRequest
) {
  const { pathname } = req.nextUrl;

  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (isAsset) {
    return NextResponse.next();
  }

  // Đang bảo trì
  if (MAINTENANCE) {
    if (pathname === "/maintenance") {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/maintenance", req.url)
    );
  }

  // Hết bảo trì
  if (
    !MAINTENANCE &&
    pathname === "/maintenance"
  ) {
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};