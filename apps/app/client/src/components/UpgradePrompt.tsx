import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  X, 
  Check,
  Star,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
// Mock plans for upgrade prompt - replace with actual plan structure
const mockPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for small bakeries getting started',
    features: [
      'Up to 50 leads per month',
      '5 portfolio images',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'professional', 
    name: 'Professional',
    price: 79,
    description: 'Best for growing bakeries',
    features: [
      'Unlimited leads',
      'Unlimited portfolio images',
      'Advanced analytics',
      'Custom branding',
      'Priority support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise', 
    price: 199,
    description: 'For large bakeries and chains',
    features: [
      'Everything in Professional',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations'
    ]
  }
];

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  currentPlan: string;
  requiredPlan: string;
  feature?: string;
}

export function UpgradePrompt({ 
  isOpen, 
  onClose, 
  title = 'Upgrade Required',
  message, 
  currentPlan, 
  requiredPlan,
  feature 
}: UpgradePromptProps) {
  const [selectedPlan, setSelectedPlan] = useState(requiredPlan);

  const currentPlanDetails = mockPlans.find(p => p.id.toLowerCase() === currentPlan.toLowerCase());
  const requiredPlanDetails = mockPlans.find(p => p.id.toLowerCase() === requiredPlan.toLowerCase());
  const availablePlans = mockPlans;

  const getPlanIcon = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'starter': return <Sparkles className="h-4 w-4" />;
      case 'professional': return <TrendingUp className="h-4 w-4" />;
      case 'enterprise': return <Shield className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'starter': return 'border-green-200 bg-green-50 text-green-800';
      case 'professional': return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'enterprise': return 'border-orange-200 bg-orange-50 text-orange-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const isRecommended = (planId: string) => planId.toLowerCase() === requiredPlan.toLowerCase();

  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    console.log(`Upgrading to ${selectedPlan}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl" data-testid="dialog-upgrade-prompt">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={onClose}
            data-testid="button-close-upgrade"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center text-2xl">
            <Crown className="h-6 w-6 mr-2 text-yellow-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Limitation Alert */}
          <Alert className="border-yellow-200 bg-yellow-50" data-testid="alert-feature-limit">
            <Zap className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Feature not available on your current plan.</strong>
              <br />
              {message}
            </AlertDescription>
          </Alert>

          {/* Current vs Required Plan Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  {getPlanIcon(currentPlan)}
                  <span className="ml-2">Your Current Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getPlanColor(currentPlan)} data-testid={`badge-current-${currentPlan}`}>
                  {currentPlan.toUpperCase()}
                </Badge>
                {currentPlanDetails && (
                  <p className="text-sm text-gray-600 mt-2">
                    {currentPlanDetails.description}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-green-800">
                  {getPlanIcon(requiredPlan)}
                  <span className="ml-2">Required Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-600 text-white" data-testid={`badge-required-${requiredPlan}`}>
                  {requiredPlan.toUpperCase()}
                </Badge>
                {requiredPlanDetails && (
                  <p className="text-sm text-green-700 mt-2">
                    {requiredPlanDetails.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPlan === plan.id ? 'ring-2 ring-rose-500 border-rose-200' : ''
                  } ${isRecommended(plan.id) ? 'border-green-200 bg-green-50' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        {getPlanIcon(plan.id)}
                        <span className="ml-2">{plan.name}</span>
                      </CardTitle>
                      {isRecommended(plan.id) && (
                        <Badge className="bg-green-600 text-white text-xs" data-testid={`badge-recommended-${plan.id}`}>
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold">
                        ${plan.price}
                        <span className="text-sm text-gray-600 font-normal">/month</span>
                      </div>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <Check className="h-3 w-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose} data-testid="button-maybe-later">
              Maybe Later
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-upgrade-now"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to {selectedPlan}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}