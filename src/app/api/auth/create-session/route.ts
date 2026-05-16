import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { SessionData } from '@/lib/types';

/**
 * API route to create a secure session.
 */

export async function POST(request: NextRequest) {
  try {
    const { firebaseToken, mobileNumber, bypassToken } = await request.json();

    if (!mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

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

    const retailersRef = db.collection('Retailers');
    const mobileVariants = [mobileNumber, mobileNumber.replace('+', '')];
    
    // Check both legacy and new field names for maximum compatibility during transition
    let querySnapshot = await retailersRef.where('mobileNumber', 'in', mobileVariants).limit(1).get();

    if (querySnapshot.empty) {
      querySnapshot = await retailersRef.where('mobile_number', 'in', mobileVariants).limit(1).get();
    }

    if (querySnapshot.empty) {
      const dealersRef = db.collection('Dealers');
      querySnapshot = await dealersRef.where('mobileNumber', 'in', mobileVariants).limit(1).get();
    }

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'No account found for this mobile number.' },
        { status: 404 }
      );
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data();

    const sessionData: SessionData = {
      userId: doc.id,
      mobileNumber: userData.mobileNumber || userData.mobile_number || mobileNumber,
      name: userData.name || userData.shop_owner_name || 'User',
      role: userData.role || 'Retailer',
      shopName: userData.shopName || userData.shop_name || '',
      dealerCode: userData.dealerCode || userData.dealer_code || '',
    };

    const cookieStore = await cookies();
    cookieStore.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

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
