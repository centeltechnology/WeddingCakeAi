import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  CreditCard, 
  Plus, 
  Trash2,
  DollarSign,
  ExternalLink,
  Shield,
  AlertCircle,
  CheckCircle,
  Wallet
} from 'lucide-react';

interface PaymentLinksManagerProps {
  bakerId: string;
}

interface PaymentLinks {
  zelle?: string;
  paypal?: string;
  cashapp?: string;
  venmo?: string;
  other?: { label: string; url: string }[];
}

export function PaymentLinksManager({ bakerId }: PaymentLinksManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentLinks, setPaymentLinks] = useState<PaymentLinks>({});
  const [customLink, setCustomLink] = useState({ label: '', url: '' });

  // Fetch current payment links
  const { data: currentLinks, isLoading } = useQuery<PaymentLinks>({
    queryKey: ['/api/bakers', bakerId, 'payment-links'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bakers/${bakerId}/payment-links`);
      const data = await response.json();
      setPaymentLinks(data || {});
      return data;
    }
  });

  // Update payment links
  const updateLinksMutation = useMutation({
    mutationFn: async (links: PaymentLinks) => {
      const response = await apiRequest('PUT', `/api/bakers/${bakerId}/payment-links`, links);
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: 'Payment Links Updated',
        description: 'Your payment information has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'payment-links'] });
      
      // Also invalidate baker data and profile cache
      await queryClient.invalidateQueries({ queryKey: [`/api/bakers`, bakerId] });
      // Invalidate all baker profile queries to ensure payment links update on profile
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && 
                 typeof key[0] === 'string' && 
                 key[0].startsWith('/baker/') &&
                 key[0].includes('/info');
        },
        refetchType: 'all'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: keyof PaymentLinks, value: string) => {
    setPaymentLinks(prev => ({
      ...prev,
      [field]: value.trim() || undefined
    }));
  };

  const addCustomLink = () => {
    if (!customLink.label.trim() || !customLink.url.trim()) {
      toast({
        title: 'Invalid Link',
        description: 'Please provide both a label and URL for the custom payment link.',
        variant: 'destructive',
      });
      return;
    }

    setPaymentLinks(prev => ({
      ...prev,
      other: [...(prev.other || []), { ...customLink }]
    }));
    setCustomLink({ label: '', url: '' });
  };

  const removeCustomLink = (index: number) => {
    setPaymentLinks(prev => ({
      ...prev,
      other: prev.other?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    updateLinksMutation.mutate(paymentLinks);
  };

  if (isLoading) {
    return (
      <Card data-testid="payment-links-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payment Information
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

  const hasAnyLinks = Object.values(paymentLinks).some(value => 
    value && (typeof value === 'string' ? value.trim() : value.length > 0)
  );

  return (
    <div className="space-y-6">
      <Card data-testid="payment-links-manager">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payment Information Setup
          </CardTitle>
          <CardDescription>
            Add your payment links so customers can pay you directly. You'll handle all payments yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {hasAnyLinks ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Payment Links Configured
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                No Payment Links Added
              </Badge>
            )}
          </div>

          {/* Popular Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zelle" className="text-sm font-medium">
                Zelle (Email or Phone)
              </Label>
              <Input
                id="zelle"
                type="text"
                placeholder="your-email@example.com or phone number"
                value={paymentLinks.zelle || ''}
                onChange={(e) => handleInputChange('zelle', e.target.value)}
                data-testid="input-zelle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypal" className="text-sm font-medium">
                PayPal Link
              </Label>
              <Input
                id="paypal"
                type="url"
                placeholder="https://paypal.me/yourusername"
                value={paymentLinks.paypal || ''}
                onChange={(e) => handleInputChange('paypal', e.target.value)}
                data-testid="input-paypal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashapp" className="text-sm font-medium">
                CashApp Link
              </Label>
              <Input
                id="cashapp"
                type="url"
                placeholder="https://cash.app/$yourusername"
                value={paymentLinks.cashapp || ''}
                onChange={(e) => handleInputChange('cashapp', e.target.value)}
                data-testid="input-cashapp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venmo" className="text-sm font-medium">
                Venmo Link
              </Label>
              <Input
                id="venmo"
                type="url"
                placeholder="https://venmo.com/yourusername"
                value={paymentLinks.venmo || ''}
                onChange={(e) => handleInputChange('venmo', e.target.value)}
                data-testid="input-venmo"
              />
            </div>
          </div>

          {/* Custom Payment Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Custom Payment Methods</Label>
            </div>
            
            {/* Existing Custom Links */}
            {paymentLinks.other && paymentLinks.other.length > 0 && (
              <div className="space-y-2">
                {paymentLinks.other.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{link.label}</div>
                      <div className="text-sm text-gray-500 truncate">{link.url}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomLink(index)}
                      data-testid={`button-remove-custom-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Custom Link */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Payment method name"
                value={customLink.label}
                onChange={(e) => setCustomLink(prev => ({ ...prev, label: e.target.value }))}
                data-testid="input-custom-label"
              />
              <Input
                type="url"
                placeholder="https://your-payment-link.com"
                value={customLink.url}
                onChange={(e) => setCustomLink(prev => ({ ...prev, url: e.target.value }))}
                data-testid="input-custom-url"
              />
              <Button 
                variant="outline" 
                onClick={addCustomLink}
                data-testid="button-add-custom"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-900">
                  Important Payment Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You are responsible for all payment processing and customer service</li>
                  <li>• These links will be displayed to customers when they want to pay</li>
                  <li>• Make sure all links are current and working before saving</li>
                  <li>• We recommend testing payments with a small amount first</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={updateLinksMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-save-payment-links"
            >
              {updateLinksMutation.isPending ? (
                <>
                  <DollarSign className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Save Payment Links
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}