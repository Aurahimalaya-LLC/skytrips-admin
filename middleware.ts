import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for middleware (Edge compatible)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip middleware for static files, API routes, and internal Next.js paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // 2. Fetch Domain Routing Configuration from Supabase
    const { data: settings } = await supabase
      .from("settings")
      .select("domain_routing")
      .single();

    if (settings?.domain_routing?.enabled) {
      const config = settings.domain_routing;
      const currentHost = req.headers.get("host") || "";

      // 0. Check for user preference override (Cookie)
      const preferredDomain = req.cookies.get("preferred_domain")?.value;

      if (preferredDomain) {
        // If user has a preference, enforce it
        if (currentHost !== preferredDomain && !currentHost.includes("localhost")) {
          const url = req.nextUrl.clone();
          url.host = preferredDomain;
          return NextResponse.redirect(url, 302);
        }
        // If we are already on the preferred domain, skip geo-routing
        return NextResponse.next();
      }

      const country = req.headers.get("x-vercel-ip-country") || "Default";

      // Find mapping for the detected country
      const mapping = config.mappings.find(
        (m: any) => m.countryCode.toUpperCase() === country.toUpperCase()
      );

      const targetDomain = mapping ? mapping.domain : config.fallbackDomain;

      // 3. Perform redirection if current host doesn't match target domain
      // Note: We check if targetDomain is set and different from currentHost
      if (targetDomain && currentHost !== targetDomain && !currentHost.includes("localhost")) {
        const url = req.nextUrl.clone();
        url.host = targetDomain;
        
        // Use 302 (Found) for geo-routing as it's temporary based on location
        return NextResponse.redirect(url, 302);
      }
    }
  } catch (error) {
    console.error("Middleware domain routing error:", error);
  }

  // Allow all other routes to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
