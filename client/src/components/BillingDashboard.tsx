import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Crown, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface BillingInfo {
  subscriptionPlan: string;
  subscriptionStatus: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  nextInvoiceAmount?: number;
  usage?: {
    leads: number;
    leadsLimit: number;
    portfolioImages: number;
    portfolioLimit: number;
  };
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  created: string;
  pdfUrl?: string;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  recommended?: boolean;
  stripePriceId?: string;
}

export function BillingDashboard({ bakerId }: { bakerId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPlanOptions, setShowPlanOptions] = useState(false);

  // Fetch billing information
  const { data: billingInfo, isLoading } = useQuery<BillingInfo>({
    queryKey: ['/api/bakers', bakerId, 'billing']
  });

  // Fetch invoices
  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['/api/bakers', bakerId, 'billing', 'invoices']
  });

  // Fetch available plans
  const { data: availablePlans } = useQuery<PlanOption[]>({
    queryKey: ['/api/billing/plans']
  });

  // Change plan mutation
  const changePlanMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      return await apiRequest('POST', `/api/bakers/${bakerId}/billing/change-plan`, { planId });
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: 'Plan Updated',
          description: 'Your subscription plan has been updated successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'billing'] });
        setShowPlanOptions(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update subscription plan.',
        variant: 'destructive',
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/bakers/${bakerId}/billing/cancel`);
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription will be cancelled at the end of the current billing period.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'billing'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel subscription.',
        variant: 'destructive',
      });
    },
  });

  // Open Stripe customer portal mutation
  const openCustomerPortalMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/bakers/${bakerId}/billing/portal`);
    },
    onSuccess: (data: any) => {
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      } else if (data.fallback) {
        toast({
          title: 'Billing Management',
          description: data.message || 'All billing features are available in your current dashboard.',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Portal Access Failed',
        description: error.message || 'Unable to open billing portal.',
        variant: 'destructive',
      });
    },
  });

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'plus': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Current Subscription
            </div>
            <div className="flex gap-2">
              <Badge className={getPlanBadgeColor(billingInfo?.subscriptionPlan || 'free')}>
                {billingInfo?.subscriptionPlan?.toUpperCase() || 'FREE'}
              </Badge>
              <Badge className={getStatusBadgeColor(billingInfo?.subscriptionStatus || 'active')}>
                {billingInfo?.subscriptionStatus?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Billing Period */}
          {billingInfo?.currentPeriodEnd && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-sm text-gray-600">Current billing period</span>
              </div>
              <div className="text-sm font-medium">
                {billingInfo.currentPeriodStart && (
                  <>
                    {format(new Date(billingInfo.currentPeriodStart), 'MMM d')} - {format(new Date(billingInfo.currentPeriodEnd), 'MMM d, yyyy')}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Usage Tracking */}
          {billingInfo?.usage && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Usage This Period
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Leads Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Leads</span>
                    <span>{billingInfo.usage.leads} / {billingInfo.usage.leadsLimit === -1 ? 'Unlimited' : billingInfo.usage.leadsLimit}</span>
                  </div>
                  {billingInfo.usage.leadsLimit !== -1 && (
                    <Progress 
                      value={(billingInfo.usage.leads / billingInfo.usage.leadsLimit) * 100} 
                      className="h-2" 
                    />
                  )}
                </div>

                {/* Portfolio Usage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Portfolio Images</span>
                    <span>{billingInfo.usage.portfolioImages} / {billingInfo.usage.portfolioLimit === -1 ? 'Unlimited' : billingInfo.usage.portfolioLimit}</span>
                  </div>
                  {billingInfo.usage.portfolioLimit !== -1 && (
                    <Progress 
                      value={(billingInfo.usage.portfolioImages / billingInfo.usage.portfolioLimit) * 100} 
                      className="h-2" 
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowPlanOptions(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white"
              data-testid="button-change-plan"
            >
              <Star className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => openCustomerPortalMutation.mutate()}
              disabled={openCustomerPortalMutation.isPending}
              data-testid="button-billing-portal"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>

            {billingInfo?.subscriptionStatus === 'active' && !billingInfo?.cancelAtPeriodEnd && (
              <Button 
                variant="destructive" 
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={cancelSubscriptionMutation.isPending}
                data-testid="button-cancel-subscription"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            )}
          </div>

          {/* Cancellation Notice */}
          {billingInfo?.cancelAtPeriodEnd && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be cancelled on {billingInfo.currentPeriodEnd && format(new Date(billingInfo.currentPeriodEnd), 'MMMM d, yyyy')}. 
                You'll continue to have access until then.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Plan Options Modal */}
      {showPlanOptions && availablePlans && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
            <CardDescription>
              Select the plan that best fits your bakery's needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-6 relative ${
                    plan.recommended ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-2 left-4 bg-purple-500">
                      Recommended
                    </Badge>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={billingInfo?.subscriptionPlan === plan.id ? 'secondary' : 'default'}
                    disabled={billingInfo?.subscriptionPlan === plan.id || changePlanMutation.isPending}
                    onClick={() => changePlanMutation.mutate({ planId: plan.id })}
                    data-testid={`button-select-plan-${plan.id}`}
                  >
                    {billingInfo?.subscriptionPlan === plan.id ? 'Current Plan' : `Select ${plan.name}`}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowPlanOptions(false)}
                data-testid="button-cancel-plan-change"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Billing History
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'billing', 'invoices'] })}
              data-testid="button-refresh-invoices"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="font-medium">#{invoice.number}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(invoice.created), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                      <Badge 
                        className={
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    {invoice.pdfUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(invoice.pdfUrl, '_blank')}
                        data-testid={`button-download-invoice-${invoice.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No billing history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}