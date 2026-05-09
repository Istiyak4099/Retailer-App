import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware - Authentication Gate
 * 
 * - RESTORED: Redirects to /login if no valid session cookie is found.
 */

export function middleware(request: NextRequest) {
  const session = request.cookies.get('auth_session');

  // If there's no session and the user is trying to access a protected route
  if (!session) {
    const url = request.nextUrl.clone();
    
    // Skip redirect if already on login or api routes
    if (url.pathname === '/login' || url.pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers/:path*',
    '/balance/:path*',
    '/onboarding/:path*',
    '/install/:path*',
  ],
};
