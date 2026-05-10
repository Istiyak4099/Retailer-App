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
        { error: 'Server configuration error: SITE_A_URL is missing. Please check your .env file.' },
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
          ...(process.env.VERCEL_PROTECTION_BYPASS && {
            'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS
          })
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

    // 3. Safely parse the response — Site A might return HTML on crash
    let data;
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error(
          `Site A returned non-JSON response. Status: ${response.status}, ` +
          `URL: ${siteAUrl}/api/auth/login.\n` +
          `Response Body: ${text.substring(0, 500)}...\n` +
          `This usually means Site A crashed or the SITE_A_URL is wrong.`
        );

        // Specifically check for Vercel Authentication Protection
        if (response.status === 401 && text.includes('Vercel authentication')) {
          return NextResponse.json(
            { error: 'Site A is protected by Vercel Authentication. Please disable it in the Vercel dashboard, or set VERCEL_PROTECTION_BYPASS in the Retailer App.' },
            { status: 502 }
          );
        }

        return NextResponse.json(
          { error: `Authentication service returned an invalid response (Status ${response.status}). Please check Site A logs.` },
          { status: 502 }
        );
      }
    } catch (readError) {
      console.error('Failed to read response from Site A:', readError);
      return NextResponse.json(
        { error: 'Authentication service returned an unreadable response.' },
        { status: 502 }
      );
    }

    // 4. Handle non-200 responses from Site A
    if (!response.ok) {
      console.warn(`Site A rejected credentials. Status: ${response.status}, Error: ${data.error || 'unknown'}`);
      return NextResponse.json(
        { error: data.error || data.message || 'Invalid credentials' },
        { status: response.status }
      );
    }

    // 5. Success — Extract user data and return to client
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
