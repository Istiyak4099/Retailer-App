import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SessionData } from '@/lib/types';

/**
 * API route to retrieve the current session data from the httpOnly cookie.
 */

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sessionData: SessionData = JSON.parse(sessionCookie.value);

    return NextResponse.json(sessionData, { status: 200 });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
