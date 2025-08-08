
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        // Prevent re-running the check
        if (hasChecked.current) return;
        hasChecked.current = true;

        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          router.replace('/dashboard');
        } else {
          router.replace('/onboarding');
        }
      }
    };

    if (!loading && !user) {
        // If not loading and no user, we can safely reset for the next login attempt
        hasChecked.current = false;
    }

    if (!loading) {
      checkOnboarding();
    }
  }, [user, loading, router]);


  if (loading || user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{loading ? "Loading..." : "Redirecting..."}</p>
        </div>
      </div>
    );
  }

  return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <LoginForm />
    </div>
  );
}
