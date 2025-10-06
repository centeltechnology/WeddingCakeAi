import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface EmailVerificationBannerProps {
  userEmail: string;
  userName?: string;
  onDismiss?: () => void;
  className?: string;
}

export function EmailVerificationBanner({ 
  userEmail, 
  userName, 
  onDismiss,
  className = "" 
}: EmailVerificationBannerProps) {
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bakers/resend-verification', {
        email: userEmail
      });
      return await response.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Verification email sent!",
          description: "Please check your email for the verification link.",
          duration: 5000,
        });
      } else {
        throw new Error(response.message || 'Failed to send verification email');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification email",
        description: error.message || "Please try again later or contact support.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleResendVerification = () => {
    resendMutation.mutate();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert 
      className={`border-amber-200 bg-amber-50 text-amber-800 ${className}`}
      data-testid="alert-email-verification"
    >
      <Mail className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <AlertDescription className="flex-1 pr-4">
          <span className="font-medium">Please verify your email address</span>
          <br />
          We sent a verification link to <strong>{userEmail}</strong>. 
          Check your email and click the link to activate your account.
        </AlertDescription>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            onClick={handleResendVerification}
            disabled={resendMutation.isPending}
            variant="outline"
            size="sm"
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
            data-testid="button-resend-verification-banner"
          >
            {resendMutation.isPending ? (
              <div className="flex items-center">
                <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-1" />
                Sending...
              </div>
            ) : (
              'Resend'
            )}
          </Button>
          
          {onDismiss && (
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-amber-700 hover:bg-amber-100"
              data-testid="button-dismiss-verification-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

// Success version for when email has been sent
export function EmailVerificationSuccessBanner({ 
  userEmail, 
  onDismiss,
  className = "" 
}: Omit<EmailVerificationBannerProps, 'userName'>) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert 
      className={`border-emerald-200 bg-emerald-50 text-emerald-800 ${className}`}
      data-testid="alert-email-verification-success"
    >
      <CheckCircle className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <AlertDescription className="flex-1 pr-4">
          <span className="font-medium">Verification email sent!</span>
          <br />
          We've sent a new verification link to <strong>{userEmail}</strong>. 
          Please check your email and click the link to verify your account.
        </AlertDescription>
        
        {onDismiss && (
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-100 flex-shrink-0"
            data-testid="button-dismiss-success-banner"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}