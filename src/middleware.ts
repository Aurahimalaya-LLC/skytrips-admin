import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(req: NextRequest) {
  // Only apply to API v1 routes
  if (req.nextUrl.pathname.startsWith('/api/v1')) {
    
    // CORS Headers
    const res = NextResponse.next();
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { headers: res.headers });
    }

    // Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const limit = rateLimit(ip, 100, 60 * 1000); // 100 requests per minute

    if (!limit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'Too many requests' 
          } 
        },
        { status: 429, headers: res.headers }
      );
    }

    res.headers.set('X-RateLimit-Limit', '100');
    res.headers.set('X-RateLimit-Remaining', limit.remaining.toString());
    res.headers.set('X-RateLimit-Reset', limit.reset.toString());

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
