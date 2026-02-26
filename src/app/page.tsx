import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Root page redirect gate.
 * 
 * - Server component that checks for the "auth_session" cookie.
 * - Redirects to /dashboard if authenticated.
 * - Redirects to /login if not authenticated.
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
