
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase-client';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  
  // State management
  const [step, setStep] = useState<1 | 2>(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Refs for Firebase objects
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Handle resend countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0 && step === 2) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendCountdown, step]);

  // Focus OTP input on step 2 mount
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Step 1: Verify credentials and send OTP
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mobileNumber || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify with Site A
      const verifyRes = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, password }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid credentials');
      }

      // 2. Initialize Recaptcha
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      // 3. Send OTP via Firebase
      const confirmation = await signInWithPhoneNumber(
        auth,
        mobileNumber,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmation;
      setStep(2);
      setResendCountdown(30);
      setCanResend(false);
    } catch (err: any) {
      console.error('Step 1 Error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create session
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!confirmationResultRef.current) {
      setError('Session expired. Please go back and try again.');
      return;
    }

    setLoading(true);

    try {
      // 1. Confirm OTP with Firebase
      const result = await confirmationResultRef.current.confirm(otpCode);
      
      // 2. Get Firebase ID Token
      const firebaseToken = await result.user.getIdToken();

      // 3. Create Session Cookie on Site B
      const sessionRes = await fetch('/api/auth/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken, mobileNumber }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok) {
        throw new Error(sessionData.error || 'Failed to create session');
      }

      // 4. Success! Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Step 2 Error:', err);
      setError('Invalid or expired OTP. Please try again.');
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Re-verify with Site A (or just re-trigger Firebase if trusted)
      // Here we re-trigger the whole check to ensure consistency
      const verifyRes = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, password }),
      });

      if (!verifyRes.ok) throw new Error('Verification failed');

      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        mobileNumber,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmation;
      setResendCountdown(30);
      setCanResend(false);
      setSuccessMessage('Code resent!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setError(null);
    setSuccessMessage(null);
    setOtpCode('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div id="recaptcha-container" className="hidden"></div>
      
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step {step} of 2
            </span>
            {step === 2 && (
              <button 
                onClick={goBack}
                className="flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </button>
            )}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 1 ? 'Welcome Back' : 'Check your phone'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 
              ? 'Enter your mobile number and password to continue.' 
              : `A 6-digit code was sent to ${mobileNumber}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="py-2 border-green-500 text-green-600 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+880XXXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="flex justify-center py-2">
                <Input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full max-w-[200px] text-center text-3xl font-bold tracking-[0.5em] h-14"
                  required
                />
              </div>
              <div className="space-y-4">
                <Button type="submit" className="w-full h-11 text-base" disabled={loading || otpCode.length !== 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>
                
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend in {resendCountdown}s...
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 border-t flex justify-center">
          <p className="text-xs text-center text-muted-foreground max-w-[280px]">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
