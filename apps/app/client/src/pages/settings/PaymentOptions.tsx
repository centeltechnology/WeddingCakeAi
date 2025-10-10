import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Save, Wallet } from 'lucide-react';
import { SettingsTabs } from '@/components/SettingsTabs';
import SaveBar from '@/components/SaveBar';

interface PaymentOptions {
  cashapp?: string;
  venmo?: string;
  paypal?: string;
  zelle?: string;
  stripeLink?: string;
}

interface TenantProfile {
  id: string;
  tenantId: string;
  payments: PaymentOptions | null;
}

export default function PaymentOptions({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [cashapp, setCashapp] = useState('');
  const [venmo, setVenmo] = useState('');
  const [paypal, setPaypal] = useState('');
  const [zelle, setZelle] = useState('');
  const [stripeLink, setStripeLink] = useState('');

  const { data: profile, isLoading } = useQuery<TenantProfile | null>({
    queryKey: ['/api/me/profile'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/me/profile', undefined);
      return data as TenantProfile | null;
    },
  });

  useEffect(() => {
    if (profile?.payments) {
      setCashapp(profile.payments.cashapp || '');
      setVenmo(profile.payments.venmo || '');
      setPaypal(profile.payments.paypal || '');
      setZelle(profile.payments.zelle || '');
      setStripeLink(profile.payments.stripeLink || '');
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/me/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me/profile'] });
      toast({
        title: 'Payment Options Saved',
        description: 'Your payment methods have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save payment options',
        variant: 'destructive',
      });
    },
  });

  // Compute dirty state - treat missing profile as empty baseline
  const isDirty = useMemo(() => {
    // Allow saving when user enters data, even if no profile exists yet
    const hasData = !!(cashapp || venmo || paypal || zelle || stripeLink);
    if (!profile?.payments) return hasData;
    
    const payments = profile.payments;
    return (
      cashapp !== (payments.cashapp || '') ||
      venmo !== (payments.venmo || '') ||
      paypal !== (payments.paypal || '') ||
      zelle !== (payments.zelle || '') ||
      stripeLink !== (payments.stripeLink || '')
    );
  }, [profile, cashapp, venmo, paypal, zelle, stripeLink]);

  const handleSave = () => {
    saveMutation.mutate({
      payments: {
        cashapp,
        venmo,
        paypal,
        zelle,
        stripeLink,
      },
    });
  };

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading payment options...</p>
        </div>
      </div>
    );

    if (embedded) {
      return loadingContent;
    }

    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          {loadingContent}
        </div>
      </AppLayout>
    );
  }

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Add your payment methods to make it easy for customers to pay you
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cashapp">Cash App</Label>
              <Input
                id="cashapp"
                placeholder="$yourcashtag"
                value={cashapp}
                onChange={(e) => setCashapp(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Cash App tag (e.g., $yourbakery)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venmo">Venmo</Label>
              <Input
                id="venmo"
                placeholder="@yourbakery"
                value={venmo}
                onChange={(e) => setVenmo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Venmo username (e.g., @yourbakery)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypal">PayPal</Label>
              <Input
                id="paypal"
                type="email"
                placeholder="payments@yourbakery.com"
                value={paypal}
                onChange={(e) => setPaypal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your PayPal email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zelle">Zelle</Label>
              <Input
                id="zelle"
                placeholder="Email or phone number"
                value={zelle}
                onChange={(e) => setZelle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Zelle email or phone number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeLink">Stripe Payment Link</Label>
              <Input
                id="stripeLink"
                type="url"
                placeholder="https://buy.stripe.com/..."
                value={stripeLink}
                onChange={(e) => setStripeLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Stripe payment link or profile URL
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-amber-800">
              💡 These payment details will be shown to customers on invoices and contracts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) {
    return (
      <>
        {content}
        <SaveBar onSave={handleSave} saving={saveMutation.isPending} disabled={!isDirty} />
      </>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          title="Settings"
          subtitle="Manage your calculator and business profile settings"
        />

        <SettingsTabs />

        <div className="mt-6">
          {content}
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saveMutation.isPending} disabled={!isDirty} />
    </AppLayout>
  );
}
