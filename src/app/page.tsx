import { redirect } from 'next/navigation';

/**
 * Root page redirect gate - UPDATED FOR TESTING BYPASS.
 * 
 * - Directly redirects to /dashboard to bypass login during testing.
 */
export default async function HomePage() {
  redirect('/dashboard');
}
