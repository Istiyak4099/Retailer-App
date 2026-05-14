
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { SessionData } from '@/lib/types';

/**
 * API route to create a secure session.
 * 
 * - Supports traditional Firebase Token verification.
 * - Supports 'bypassToken' mode for Spark plan testing (OTP terminated).
 */

export async function POST(request: NextRequest) {
  try {
    const { firebaseToken, mobileNumber, bypassToken } = await request.json();

    // 1. Validation
    if (!mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // 2. Verify Identity (Token or Bypass)
    if (!bypassToken) {
        if (!firebaseToken) {
            return NextResponse.json({ error: 'Firebase token is required' }, { status: 400 });
        }
        try {
            const decodedToken = await adminAuth.verifyIdToken(firebaseToken);
            if (decodedToken.phone_number !== mobileNumber && !decodedToken.phone_number?.endsWith(mobileNumber)) {
                return NextResponse.json({ error: 'Token mismatch' }, { status: 401 });
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
        }
    }

    // 3. Lookup user in Firestore "Dealers" collection
    const dealersRef = db.collection('Dealers');
    const querySnapshot = await dealersRef.where('mobileNumber', '==', mobileNumber).limit(1).get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'No account found for this mobile number.' },
        { status: 404 }
      );
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data();

    // 4. Prepare Session Data
    const sessionData: SessionData = {
      userId: doc.id,
      mobileNumber: userData.mobileNumber,
      name: userData.name,
      role: userData.role,
      shopName: userData.shopName,
      dealerCode: userData.dealerCode,
    };

    // 5. Set httpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // 6. Success Response
    return NextResponse.json(
      {
        message: 'Login successful',
        ...sessionData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create Session Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during session creation' },
      { status: 500 }
    );
  }
}
