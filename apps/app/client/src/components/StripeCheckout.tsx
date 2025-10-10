import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface StripeCheckoutProps {
  amount: string;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  bakerId: string;
  customerId: string;
  quoteId?: string;
  type: 'deposit' | 'final_payment' | 'full_payment';
}

function CheckoutForm({ 
  amount, 
  description, 
  onSuccess, 
  onError, 
  bakerId, 
  customerId, 
  quoteId, 
  type 
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        let endpoint = '/api/create-payment-intent';
        let body = { amount: parseFloat(amount), bakerId, customerId, type, description };

        // Use specific endpoints for quote-based payments
        if (quoteId && type === 'deposit') {
          endpoint = `/api/quotes/${quoteId}/create-deposit-payment`;
          body = {}; // endpoint will calculate amount from quote
        } else if (quoteId && type === 'final_payment') {
          endpoint = `/api/quotes/${quoteId}/create-final-payment`;
          body = {}; // endpoint will calculate amount from quote
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError(error instanceof Error ? error.message : 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, bakerId, customerId, quoteId, type, description, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      console.error('Payment failed:', result.error);
      onError(result.error.message || 'Payment failed');
      toast({
        title: "Payment Failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      console.log('Payment succeeded:', result.paymentIntent);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully!",
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Preparing payment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Amount:</span>
          <Badge variant="secondary" className="text-lg font-bold">
            ${parseFloat(amount).toFixed(2)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {description}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Card Information
          </label>
        </div>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: 'hsl(var(--foreground))',
                '::placeholder': {
                  color: 'hsl(var(--muted-foreground))',
                },
              },
            },
          }}
        />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${parseFloat(amount).toFixed(2)}
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        <div className="flex items-center justify-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>
    </form>
  );
}

export function StripeCheckout(props: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Complete Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm {...props} />
        </CardContent>
      </Card>
    </Elements>
  );
}

// Quick payment button for quotes
interface QuickPaymentButtonProps {
  quote: any;
  type: 'deposit' | 'final_payment';
  onPaymentComplete?: () => void;
}

export function QuickPaymentButton({ quote, type, onPaymentComplete }: QuickPaymentButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();

  const amount = type === 'deposit' 
    ? quote.depositAmount 
    : (parseFloat(quote.total) - parseFloat(quote.depositAmount || '0')).toString();

  const description = type === 'deposit'
    ? `Deposit for ${quote.title} (Quote #${quote.quoteNumber})`
    : `Final payment for ${quote.title} (Quote #${quote.quoteNumber})`;

  const handleSuccess = () => {
    setShowCheckout(false);
    onPaymentComplete?.();
  };

  const handleError = (error: string) => {
    console.error('Payment error:', error);
    setShowCheckout(false);
  };

  if (showCheckout) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Payment</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)}>
              ✕
            </Button>
          </div>
          <div className="p-4">
            <StripeCheckout
              amount={amount}
              description={description}
              onSuccess={handleSuccess}
              onError={handleError}
              bakerId={quote.bakerId}
              customerId={quote.customerId}
              quoteId={quote.id}
              type={type}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => setShowCheckout(true)}
      className="bg-primary hover:bg-primary/90"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      Pay {type === 'deposit' ? 'Deposit' : 'Final'} (${parseFloat(amount).toFixed(2)})
    </Button>
  );
}