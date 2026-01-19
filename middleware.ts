import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  const token = req.cookies.get("sky_admin_session")?.value;
  if (!token) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
