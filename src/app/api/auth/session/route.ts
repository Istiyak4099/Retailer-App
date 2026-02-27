import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SessionData } from '@/lib/types';

/**
 * API route to retrieve the current session data.
 * 
 * - UPDATED FOR TESTING: Returns a mock session if the auth cookie is missing.
 */

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');

    if (!sessionCookie) {
      // Return a mock session for testing purposes
      const mockSession: SessionData = {
        userId: 'default-user',
        mobileNumber: '+8801700000000',
        name: 'Test Dealer',
        role: 'Retailer',
        shopName: 'Test Gadget Store',
        dealerCode: 'TEST001',
      };
      return NextResponse.json(mockSession, { status: 200 });
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
