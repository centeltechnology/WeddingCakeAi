import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChefHat, CheckCircle, XCircle, Mail, Clock, ArrowLeft, Home, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-orange-50 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Modern Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/50 backdrop-blur-sm">
                <ChefHat className="h-10 w-10 text-white drop-shadow-sm" />
              </div>
              {verificationState === 'success' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg animate-bounce">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
              {verificationState === 'loading' && (
                <div className="absolute inset-0 rounded-3xl border-4 border-pink-200 border-t-pink-500 animate-spin" />
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-pink-100">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">Bakewise Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-serif font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Email Verification
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {verificationState === 'loading' && "Verifying your account with Bakewise"}
              {verificationState === 'success' && "Welcome to the Bakewise community!"}
              {verificationState === 'expired' && "Let's get you verified"}
              {verificationState === 'error' && "Having trouble? We're here to help"}
            </p>
          </div>
        </div>

        {/* Enhanced Verification Status Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl ring-1 ring-black/5 overflow-hidden">
          {/* Status indicator bar */}
          <div className={`h-2 transition-all duration-1000 ${
            verificationState === 'loading' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
            verificationState === 'success' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
            verificationState === 'expired' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
            'bg-gradient-to-r from-red-400 to-red-600'
          }`} />

          <CardHeader className="text-center px-8 py-8">
            {verificationState === 'loading' && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="flex justify-center">
                  <div className="relative">
                    <Clock className="h-16 w-16 text-blue-500" />
                    <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-serif text-blue-700 mb-2">Verifying your email</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Please wait while we securely verify your account
                  </CardDescription>
                  <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-700 border-blue-200">
                    Processing...
                  </Badge>
                </div>
              </div>
            )}

            {verificationState === 'success' && (
              <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-emerald-200/50 rounded-full animate-ping" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-serif text-emerald-700 mb-2">
                    🎉 Email verified successfully!
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mb-4">
                    {verificationResult?.baker?.name && (
                      <span className="block text-lg font-medium text-emerald-600 mb-2">
                        Welcome, {verificationResult.baker.name}!
                      </span>
                    )}
                    Your Bakewise account is now active and ready to use. You can start building your bakery business right away.
                  </CardDescription>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Account Active
                  </Badge>
                </div>
              </div>
            )}

            {verificationState === 'expired' && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-10 w-10 text-amber-500" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-serif text-amber-700 mb-2">Verification link expired</CardTitle>
                  <CardDescription className="text-base text-gray-600 mb-4">
                    Don't worry! Verification links expire for security. We can send you a fresh one right away.
                  </CardDescription>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Action Required
                  </Badge>
                </div>
              </div>
            )}

            {verificationState === 'error' && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-serif text-red-700 mb-2">Verification failed</CardTitle>
                  <CardDescription className="text-base text-gray-600 mb-4">
                    We couldn't verify your email address. This might be due to an invalid or expired link.
                  </CardDescription>
                  <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Verification Error
                  </Badge>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-6">
            {verificationResult?.message && verificationState !== 'loading' && (
              <Alert variant={verificationState === 'success' ? 'default' : 'destructive'} 
                    className={`border-l-4 ${
                      verificationState === 'success' ? 'border-l-emerald-500 bg-emerald-50/50' :
                      verificationState === 'expired' ? 'border-l-amber-500 bg-amber-50/50' :
                      'border-l-red-500 bg-red-50/50'
                    }`}>
                <AlertDescription className="text-sm">
                  {verificationResult.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              {verificationState === 'success' && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
                  <Button
                    onClick={redirectToLogin}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    data-testid="button-go-to-login"
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Access Your Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="w-full h-12 hover:bg-gray-50 transition-all duration-200"
                    data-testid="button-back-home"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Explore Platform
                  </Button>
                </div>
              )}

              {verificationState === 'expired' && verificationResult?.baker?.email && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 font-medium"
                    data-testid="button-resend-verification"
                  >
                    {isResending ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending New Link...
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
                    className="w-full h-12 hover:bg-gray-50 transition-all duration-200"
                    data-testid="button-go-to-login-expired"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              )}

              {verificationState === 'error' && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                  <Button
                    onClick={redirectToSignup}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    data-testid="button-try-signup-again"
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Create New Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={redirectToLogin}
                    className="w-full h-12 hover:bg-gray-50 transition-all duration-200"
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              )}

              {verificationState === 'loading' && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Help Section */}
            <div className="border-t border-gray-100 pt-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Questions about your account verification?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <Button variant="link" size="sm" asChild className="text-pink-600 hover:text-pink-700">
                    <a href="mailto:support@bakewiseapp.com">
                      <Mail className="h-3 w-3 mr-1" />
                      Email Support
                    </a>
                  </Button>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <Button variant="link" size="sm" asChild className="text-pink-600 hover:text-pink-700">
                    <Link href="/help">
                      Help Center
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-800 transition-colors" data-testid="button-back-home-footer">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bakewise Platform
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}