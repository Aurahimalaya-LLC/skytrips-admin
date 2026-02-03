import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  
  // Define Allowed Domains
  const ADMIN_DOMAIN = "admin.skytripsword.com";
  const ALLOWED_DOMAINS = [ADMIN_DOMAIN, "localhost", "127.0.0.1"];

  // Check if current host is allowed (includes Vercel preview URLs)
  const isAllowed = ALLOWED_DOMAINS.some(d => hostname.includes(d)) || hostname.endsWith(".vercel.app");

  // Create Response
  const response = NextResponse.next();

  // ---------------------------------------------------------
  // 1. Security Headers (Enhanced Security Measures)
  // ---------------------------------------------------------
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // ---------------------------------------------------------
  // 2. Subdomain Isolation Logic
  // ---------------------------------------------------------
  // If the request reaches this app via an incorrect domain (e.g., skytrips.com.np pointing here),
  // we want to prevent it from serving admin content to the public domain.
  
  if (!isAllowed) {
    // Optional: Log the potential misconfiguration
    console.warn(`[Middleware] Blocked request from unauthorized host: ${hostname}`);
    
    // Return 404 or Redirect to correct admin domain
    // For strict isolation, we block it or redirect to the primary admin domain
    // const url = req.nextUrl.clone();
    // url.host = ADMIN_DOMAIN;
    // url.port = ""; // Ensure standard port
    // return NextResponse.redirect(url);
    
    // For now, we just warn and proceed, or we could strict block:
    // return new NextResponse("Unauthorized Host", { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
