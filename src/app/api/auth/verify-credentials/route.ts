import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to verify credentials with Site A.
 * 
 * - Accepts mobileNumber and password.
 * - Proxies the request to Site A's login endpoint.
 * - Returns success if Site A validates the credentials, allowing the client to proceed with Firebase Phone Auth.
 */

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, password } = await request.json();

    // 1. Validate fields
    if (!mobileNumber || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const siteAUrl = process.env.SITE_A_URL;
    if (!siteAUrl) {
      console.error('SITE_A_URL environment variable is not defined');
      return NextResponse.json(
        { error: 'Authentication service configuration error' },
        { status: 500 }
      );
    }

    // 2. Call Site A's API
    let response;
    try {
      response = await fetch(`${siteAUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, password }),
      });
    } catch (networkError) {
      console.error('Network error calling Site A:', networkError);
      return NextResponse.json(
        { error: 'Authentication service is unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const data = await response.json();

    // 3. Handle non-200 responses from Site A
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Invalid credentials' },
        { status: response.status }
      );
    }

    // 4. Success - Extract user data and return to client
    // We don't store Site A's token; we just confirm validity.
    const { userId, role } = data;

    return NextResponse.json(
      {
        message: 'Credentials verified',
        mobileNumber,
        userId,
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify Credentials Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification' },
      { status: 500 }
    );
  }
}
