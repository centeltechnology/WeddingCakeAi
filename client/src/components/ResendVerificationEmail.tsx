import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ResendVerificationEmailProps {
  initialEmail?: string;
  onSuccess?: () => void;
  showAsCard?: boolean;
  className?: string;
}

export function ResendVerificationEmail({ 
  initialEmail = '', 
  onSuccess,
  showAsCard = true,
  className = "" 
}: ResendVerificationEmailProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);

  const resendMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      // Check cooldown (60 seconds)
      const now = Date.now();
      if (lastSentTime && now - lastSentTime < 60000) {
        const remainingTime = Math.ceil((60000 - (now - lastSentTime)) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting another email.`);
      }

      const response = await apiRequest('POST', '/api/bakers/resend-verification', {
        email: emailAddress
      });
      return await response.json();
    },
    onSuccess: (response, emailAddress) => {
      if (response.success) {
        const now = Date.now();
        setLastSentTime(now);
        setCooldownTime(60);
        
        // Start cooldown timer
        const timer = setInterval(() => {
          setCooldownTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: "Verification email sent!",
          description: `We've sent a verification link to ${emailAddress}. Please check your email.`,
          duration: 6000,
        });
        
        onSuccess?.();
      } else {
        throw new Error(response.message || 'Failed to send verification email');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification email",
        description: error.message || "Please check the email address and try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    resendMutation.mutate(email);
  };

  const content = (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@bakery.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={resendMutation.isPending || cooldownTime > 0}
            className="h-11"
            data-testid="input-resend-email"
          />
        </div>

        <Button
          type="submit"
          disabled={resendMutation.isPending || cooldownTime > 0 || !email.trim()}
          className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          data-testid="button-resend-verification-form"
        >
          {resendMutation.isPending ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Sending verification email...
            </div>
          ) : cooldownTime > 0 ? (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Wait {cooldownTime}s before resending
            </div>
          ) : (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Send Verification Email
            </div>
          )}
        </Button>
      </form>

      {resendMutation.isSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800" data-testid="alert-resend-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Verification email sent!</span>
            <br />
            Check your email inbox and spam folder for the verification link.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Make sure to check your spam folder if you don't see the email.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Still having trouble? Contact support at{' '}
          <a href="mailto:support@bakewiseapp.com" className="text-rose-600 hover:underline">
            support@bakewiseapp.com
          </a>
        </p>
      </div>
    </div>
  );

  if (!showAsCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={`border-0 shadow-xl bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-center flex items-center justify-center">
          <Mail className="h-5 w-5 mr-2" />
          Resend Verification Email
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address to receive a new verification link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

// Standalone page version for better UX
export function ResendVerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ResendVerificationEmail showAsCard={true} />
      </div>
    </div>
  );
}