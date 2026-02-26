import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { SessionData } from '@/lib/types';

/**
 * API route to create a secure session after successful Firebase Phone Auth.
 * 
 * 1. Verifies the Firebase ID token.
 * 2. Matches the phone number.
 * 3. Fetches user data from Firestore "Dealers" collection.
 * 4. Sets a secure httpOnly session cookie.
 */

export async function POST(request: NextRequest) {
  try {
    const { firebaseToken, mobileNumber } = await request.json();

    // 1. Validation
    if (!firebaseToken || !mobileNumber) {
      return NextResponse.json(
        { error: 'Firebase token and mobile number are required' },
        { status: 400 }
      );
    }

    // 2. Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(firebaseToken);
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid session token. Please try again.' },
        { status: 401 }
      );
    }

    // 3. Cross-check phone number
    // Firebase phone numbers are typically in E.164 format (e.g., +1234567890)
    // We compare with the mobileNumber provided by the user.
    if (decodedToken.phone_number !== mobileNumber && !decodedToken.phone_number?.endsWith(mobileNumber)) {
        return NextResponse.json(
            { error: 'Token mismatch. Please try again.' },
            { status: 401 }
        );
    }

    // 4. Lookup user in Firestore "Dealers" collection
    const dealersRef = db.collection('Dealers');
    const querySnapshot = await dealersRef.where('mobileNumber', '==', mobileNumber).limit(1).get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'No account found. Please contact your administrator.' },
        { status: 404 }
      );
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data();

    // 5. Prepare Session Data
    const sessionData: SessionData = {
      userId: doc.id,
      mobileNumber: userData.mobileNumber,
      name: userData.name,
      role: userData.role,
      shopName: userData.shopName,
      dealerCode: userData.dealerCode,
    };

    // 6. Set httpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // 7. Success Response
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
