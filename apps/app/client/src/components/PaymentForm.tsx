import { useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";


interface PaymentFormProps {
  amount: number;
  bakerId: string;
  customerId?: string;
  type: 'consultation' | 'deposit' | 'final_payment';
  description: string;
  onSuccess?: () => void;
}

function CheckoutForm({ amount, bakerId, customerId, type, description, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card data-testid="payment-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Amount</span>
            <span className="font-semibold text-lg md:text-xl">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Type</span>
            <Badge variant="secondary" className="capitalize text-xs">
              {type.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 break-words">
            {description}
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <PaymentElement />
          </div>
          
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing} 
            className="w-full h-11 text-base font-medium"
            data-testid="button-submit-payment"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </form>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Payments are processed securely through Stripe. Your card information is never stored on our servers.
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: props.amount,
        bakerId: props.bakerId,
        customerId: props.customerId,
        type: props.type
      });
      
      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        throw new Error('No client secret received');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <Card data-testid="payment-init">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 px-4 md:px-0">
            <div className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${props.amount.toFixed(2)}
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 break-words">{props.description}</p>
            
            {isLoading ? (
              <Button disabled className="w-full">
                Setting up payment...
              </Button>
            ) : (
              <Button 
                onClick={createPaymentIntent}
                className="w-full"
                data-testid="button-setup-payment"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Continue to Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
        }
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}