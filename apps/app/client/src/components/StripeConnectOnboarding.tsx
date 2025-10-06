import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';

interface StripeConnectOnboardingProps {
  bakerId: string;
}

interface ConnectAccountStatus {
  status: 'not_started' | 'pending' | 'complete' | 'restricted';
  onboardingCompleted: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirements?: any;
}

export function StripeConnectOnboarding({ bakerId }: StripeConnectOnboardingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false);

  // Fetch Stripe Connect account status
  const { data: accountStatus, isLoading, error } = useQuery<ConnectAccountStatus>({
    queryKey: ['/api/bakers', bakerId, 'stripe-connect', 'status'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/stripe-connect/status`);
      if (!response.ok) {
        // Return default status instead of throwing
        return { 
          status: 'not_started' as const, 
          onboardingCompleted: false 
        };
      }
      return response.json();
    },
    retry: false,
  });

  // Start Stripe Connect onboarding
  const startOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/stripe-connect/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start onboarding');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Add a small delay and smooth redirect to prevent page jumping
      toast({
        title: 'Redirecting to Stripe',
        description: 'Setting up your payment account...',
      });
      
      // Use a timeout to ensure the state is properly set before redirect
      setTimeout(() => {
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
        } else {
          throw new Error('No onboarding URL received');
        }
      }, 500);
    },
    onError: (error: any) => {
      console.error('Stripe onboarding error:', error);
      
      // Handle specific error types with better user feedback
      if (error.message?.includes('Platform Configuration Required')) {
        toast({
          title: 'Platform Setup Needed',
          description: 'The payment system requires initial setup by the platform administrator. This is a one-time configuration.',
          variant: 'destructive',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('mailto:support@bakeriq.app?subject=Stripe Connect Setup Required', '_blank')}
            >
              Contact Support
            </Button>
          ),
          duration: 10000,
        });
      } else if (error.message?.includes('Stripe Account Verification Required')) {
        toast({
          title: 'Account Verification Required',
          description: 'Please verify your Stripe account identity before setting up payments.',
          variant: 'destructive',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://dashboard.stripe.com/connect/accounts/overview', '_blank')}
            >
              Verify Account
            </Button>
          ),
          duration: 10000,
        });
      } else if (error.message?.includes('HTTPS')) {
        toast({
          title: 'Secure Connection Required',
          description: 'Please access this site using https:// instead of http:// to set up payments.',
          variant: 'destructive',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const currentUrl = window.location.href;
                const httpsUrl = currentUrl.replace('http://', 'https://');
                window.location.href = httpsUrl;
              }}
            >
              Switch to HTTPS
            </Button>
          ),
          duration: 10000,
        });
      } else {
        toast({
          title: 'Setup Failed',
          description: `${error.message || 'Failed to start account setup.'} Please try again or contact support if the issue persists.`,
          variant: 'destructive',
          duration: 8000,
        });
      }
      setIsStartingOnboarding(false);
    },
  });

  const handleStartOnboarding = () => {
    if (isStartingOnboarding || startOnboardingMutation.isPending) {
      return; // Prevent double clicks
    }
    
    setIsStartingOnboarding(true);
    startOnboardingMutation.mutate();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'restricted':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Action Required</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="stripe-connect-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Account Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state with setup button if API fails  
  if (error) {
    return (
      <Card data-testid="stripe-connect-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Account Setup
          </CardTitle>
          <CardDescription>
            Set up your Stripe account to receive payments directly from customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {(error as any)?.supportMessage ? (
                <>
                  <strong>Platform Configuration Needed:</strong><br/>
                  {(error as any)?.supportMessage} Please contact our support team for assistance.
                </>
              ) : (
                <>
                  You need to complete your Stripe account setup to receive payments. 
                  This is a secure process managed by Stripe to verify your business information.
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">What you'll need:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Business information and tax ID</li>
              <li>• Bank account for deposits</li>
              <li>• Personal identification</li>
              <li>• Business website or social media</li>
            </ul>
          </div>

          <Button 
            onClick={handleStartOnboarding}
            disabled={isStartingOnboarding || startOnboardingMutation.isPending}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 text-lg shadow-lg border-0"
            size="lg"
            data-testid="button-start-onboarding"
          >
            {isStartingOnboarding || startOnboardingMutation.isPending ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Setting Up Account...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5 mr-2" />
                Set Up Payment Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="stripe-connect-onboarding">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Account Setup
          </div>
          {getStatusBadge(accountStatus?.status)}
        </CardTitle>
        <CardDescription>
          Set up your Stripe account to receive payments directly from customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(!accountStatus?.onboardingCompleted) ? (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You need to complete your Stripe account setup to receive payments. 
                This is a secure process managed by Stripe to verify your business information.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">What you'll need:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Business information and tax ID</li>
                <li>• Bank account for deposits</li>
                <li>• Personal identification</li>
                <li>• Business website or social media</li>
              </ul>
            </div>

            <Button 
              onClick={handleStartOnboarding}
              disabled={isStartingOnboarding || startOnboardingMutation.isPending}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 text-lg shadow-lg border-0"
              size="lg"
              data-testid="button-start-onboarding-main"
            >
              {isStartingOnboarding || startOnboardingMutation.isPending ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Setting Up Account...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Set Up Payment Account
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4" data-testid="onboarding-complete">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your Stripe account is fully set up! You can now receive payments directly from customers.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Accept Payments</span>
                  {accountStatus?.chargesEnabled ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Receive Payouts</span>
                  {accountStatus?.payoutsEnabled ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Platform fee: 5%</span>
                </div>
                <div className="text-xs text-gray-500">
                  Automatic transfers to your bank account
                </div>
              </div>
            </div>

            {accountStatus?.requirements?.currently_due && accountStatus.requirements.currently_due.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Additional information required. Please complete your account setup.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}