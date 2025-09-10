import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChefHat, CheckCircle, XCircle, Mail, Clock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationResult {
  success: boolean;
  message: string;
  requiresNewToken?: boolean;
  baker?: {
    name: string;
    email: string;
    emailVerified: boolean;
  };
}

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setVerificationState('error');
      setVerificationResult({
        success: false,
        message: 'Invalid verification link. Please check the link in your email or request a new one.',
      });
      return;
    }

    // Verify the email with the token
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include',
        });

        const result = await response.json();
        setVerificationResult(result);

        if (result.success) {
          setVerificationState('success');
          toast({
            title: "Email verified successfully!",
            description: "Your account is now active. You can log in to your dashboard.",
          });
        } else if (result.requiresNewToken) {
          setVerificationState('expired');
        } else {
          setVerificationState('error');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationState('error');
        setVerificationResult({
          success: false,
          message: 'An error occurred during verification. Please try again or contact support.',
        });
      }
    };

    verifyEmail();
  }, [toast]);

  const handleResendVerification = async () => {
    if (!verificationResult?.baker?.email) {
      toast({
        title: "Email required",
        description: "Unable to resend verification email. Please try signing up again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/bakers/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: verificationResult.baker.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Verification email sent!",
          description: "Please check your email for the new verification link.",
        });
      } else {
        toast({
          title: "Failed to send email",
          description: result.message || "Unable to resend verification email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const redirectToLogin = () => {
    setLocation('/baker-login');
  };

  const redirectToSignup = () => {
    setLocation('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-lg">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Email Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Verifying your Bakewise account
          </p>
        </div>

        {/* Verification Status Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            {verificationState === 'loading' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Clock className="h-12 w-12 text-blue-500 animate-pulse" />
                </div>
                <CardTitle className="text-xl">Verifying your email...</CardTitle>
                <CardDescription>
                  Please wait while we verify your account
                </CardDescription>
              </div>
            )}

            {verificationState === 'success' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500" />
                </div>
                <CardTitle className="text-xl text-emerald-700">Email verified successfully!</CardTitle>
                <CardDescription>
                  {verificationResult?.baker?.name && (
                    <>Welcome, {verificationResult.baker.name}! </>
                  )}
                  Your account is now active and ready to use.
                </CardDescription>
              </div>
            )}

            {verificationState === 'expired' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <XCircle className="h-12 w-12 text-amber-500" />
                </div>
                <CardTitle className="text-xl text-amber-700">Verification link expired</CardTitle>
                <CardDescription>
                  Your verification link has expired. We can send you a new one.
                </CardDescription>
              </div>
            )}

            {verificationState === 'error' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <CardTitle className="text-xl text-red-700">Verification failed</CardTitle>
                <CardDescription>
                  There was a problem verifying your email address.
                </CardDescription>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {verificationResult?.message && (
              <Alert variant={verificationState === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>{verificationResult.message}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {verificationState === 'success' && (
                <div className="space-y-3">
                  <Button
                    onClick={redirectToLogin}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    data-testid="button-go-to-login"
                  >
                    Go to Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="w-full"
                    data-testid="button-back-home"
                  >
                    Back to Home
                  </Button>
                </div>
              )}

              {verificationState === 'expired' && verificationResult?.baker?.email && (
                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    data-testid="button-resend-verification"
                  >
                    {isResending ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send New Verification Email
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={redirectToLogin}
                    className="w-full"
                    data-testid="button-go-to-login-expired"
                  >
                    Back to Login
                  </Button>
                </div>
              )}

              {verificationState === 'error' && (
                <div className="space-y-3">
                  <Button
                    onClick={redirectToSignup}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    data-testid="button-try-signup-again"
                  >
                    Try Signing Up Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={redirectToLogin}
                    className="w-full"
                    data-testid="button-back-to-login"
                  >
                    Back to Login
                  </Button>
                </div>
              )}

              {verificationState === 'loading' && (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Need help? Contact support at{' '}
                <a href="mailto:support@bakewiseapp.com" className="text-rose-600 hover:underline">
                  support@bakewiseapp.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button variant="ghost" size="sm" asChild data-testid="button-back-home-footer">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bakewise
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}