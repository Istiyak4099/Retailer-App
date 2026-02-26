import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API route to securely log out the user.
 * 
 * - Clears the "auth_session" httpOnly cookie.
 */

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie by setting maxAge to 0
    cookieStore.set('auth_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout' },
      { status: 500 }
    );
  }
}
