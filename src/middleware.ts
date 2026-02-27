import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware - UPDATED FOR TESTING BYPASS.
 * 
 * - Currently allows all requests to proceed without checking for a session cookie.
 */

export function middleware(request: NextRequest) {
  // Authentication check is disabled for testing.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
