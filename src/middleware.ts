import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes based on the "auth_session" cookie.
 * 
 * - Checks for the existence of the session cookie.
 * - Redirects to /login if the cookie is missing.
 * - Allows access to the requested route if the cookie is present.
 */

export function middleware(request: NextRequest) {
  const session = request.cookies.get('auth_session');

  // 1. Check if the session cookie exists
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    
    // Optional: Store the intended destination to redirect back after login
    // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 2. Allow the request to proceed
  return NextResponse.next();
}

// 3. Configure the routes that this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
