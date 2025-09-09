import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BadgeCheck, Crown, Rocket, Star } from "lucide-react";
import { STRIPE_LINKS, DEMO_MODE } from "./config";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'free' | 'pro' | 'plus';
  name: string;
  price: string;
  monthly: string;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  highlighted?: boolean;
  stripeLink?: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    monthly: 'Forever',
    description: 'Perfect for getting started',
    icon: <BadgeCheck className="w-8 h-8 text-blue-600" />,
    features: [
      { text: 'Basic profile listing', included: true },
      { text: '3 leads per month', included: true },
      { text: 'Standard placement in search', included: true },
      { text: 'Basic contact information', included: true },
      { text: 'Portfolio uploads', included: false },
      { text: 'Customer reviews', included: false },
      { text: 'Priority placement', included: false },
      { text: 'Lead concierge', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$19',
    monthly: 'per month',
    description: 'Perfect for growing cottage bakers',
    icon: <Crown className="w-8 h-8 text-purple-600" />,
    highlighted: true,
    stripeLink: STRIPE_LINKS.proMonthly,
    features: [
      { text: 'Unlimited leads & customers', included: true },
      { text: 'Full portfolio with unlimited photos', included: true },
      { text: 'Custom domain support', included: true },
      { text: 'Professional quote templates', included: true },
      { text: 'Contract management', included: true },
      { text: 'Payment processing integration', included: true },
      { text: 'Email automation', included: true },
      { text: 'Basic analytics', included: true }
    ]
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$39',
    monthly: 'per month',
    description: 'For established bakeries scaling up',
    icon: <Rocket className="w-8 h-8 text-orange-600" />,
    stripeLink: STRIPE_LINKS.plusMonthly,
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Priority marketplace placement', included: true },
      { text: 'Advanced analytics & reporting', included: true },
      { text: 'White-label branding options', included: true },
      { text: 'API access for integrations', included: true },
      { text: 'Multiple team member accounts', included: true },
      { text: 'Priority customer support', included: true },
      { text: 'Advanced automation features', included: true }
    ]
  }
];

interface PlansProps {
  bakerId?: string;
  onPlanChange?: (planId: 'free' | 'pro' | 'plus') => void;
}

export default function Plans({ bakerId, onPlanChange }: PlansProps) {
  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'plus'>('free');

  useEffect(() => {
    if (DEMO_MODE) {
      const savedPlan = localStorage.getItem('bakerPlan') as 'free' | 'pro' | 'plus';
      if (savedPlan) {
        setActivePlan(savedPlan);
      }
    }
  }, []);

  const handlePlanSelect = async (planId: 'free' | 'pro' | 'plus', stripeLink?: string) => {
    if (!DEMO_MODE && bakerId) {
      // Use server-side plan change endpoint for authenticated bakers
      try {
        const response = await fetch(`/api/bakers/${bakerId}/billing/change-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId }),
        });
        
        const data = await response.json();
        
        if (data.checkoutUrl) {
          // Redirect to Stripe Checkout
          window.location.href = data.checkoutUrl;
        } else if (data.success) {
          // Plan changed successfully (e.g., downgrade to free)
          setActivePlan(planId);
          onPlanChange?.(planId);
        }
      } catch (error) {
        console.error('Error changing plan:', error);
      }
    } else if (stripeLink && !DEMO_MODE) {
      // Fallback to direct Stripe links for non-authenticated users
      window.open(stripeLink, '_blank');
    } else {
      // Demo mode or no bakerId
      setActivePlan(planId);
      localStorage.setItem('bakerPlan', planId);
      onPlanChange?.(planId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
          Grow Your Bakery Business
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of bakers connecting with couples planning their perfect wedding
        </p>
        {DEMO_MODE && (
          <Badge className="mt-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800">
            Demo Mode - Plans saved locally
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              plan.highlighted 
                ? 'border-2 border-primary shadow-lg bg-gradient-to-br from-card to-primary/5 dark:from-card dark:to-primary/5' 
                : 'border-0 shadow-md bg-gradient-to-br from-card to-card/90 dark:from-card dark:to-card/90'
            } ${activePlan === plan.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            data-testid={`card-plan-${plan.id}`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-white text-center py-2 text-sm font-semibold">
                Most Popular
              </div>
            )}
            
            <CardHeader className={`text-center ${plan.highlighted ? 'pt-10' : 'pt-6'}`}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center shadow-md">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-2">{plan.monthly}</span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <Button
                className={`w-full mb-6 h-12 font-semibold transition-all duration-300 ${
                  plan.id === 'free'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : plan.highlighted
                    ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white shadow-md hover:shadow-lg'
                }`}
                onClick={() => handlePlanSelect(plan.id, plan.stripeLink)}
                data-testid={`button-select-${plan.id}`}
              >
                {activePlan === plan.id ? (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </div>
                ) : plan.id === 'free' ? (
                  'Get Started Free'
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3"
                    data-testid={`feature-${plan.id}-${index}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feature.included 
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                    </div>
                    <span className={`text-sm ${
                      feature.included 
                        ? 'text-foreground' 
                        : 'text-muted-foreground line-through'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-0 shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
            Questions about our plans?
          </h3>
          <p className="text-center text-muted-foreground mb-6">
            We're here to help you choose the perfect plan for your bakery business.
          </p>
          <div className="text-center">
            <Button 
              variant="outline"
              className="border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
              data-testid="button-contact-support"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}