import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  ChefHat, 
  Check, 
  Users, 
  FileText, 
  CreditCard, 
  Star,
  UserCheck,
  PieChart,
  Mail,
  Phone,
  MapPin,
  Crown,
  Rocket,
  BadgeCheck,
  ArrowRight
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    monthly: 'Forever',
    description: 'Perfect for getting started',
    icon: <BadgeCheck className="w-8 h-8 text-blue-600" />,
    features: [
      'Basic profile listing',
      '3 leads per month',
      'Standard placement in search',
      'Basic contact information',
      'Portfolio uploads',
      'Customer reviews'
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
    features: [
      'Unlimited leads & customers',
      'Full portfolio with unlimited photos',
      'Custom domain support',
      'Professional quote templates',
      'Contract management',
      'Payment processing integration',
      'Email automation',
      'Basic analytics'
    ]
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$39',
    monthly: 'per month',
    description: 'For established bakeries scaling up',
    icon: <Rocket className="w-8 h-8 text-orange-600" />,
    features: [
      'Everything in Professional',
      'Priority marketplace placement',
      'Advanced analytics & reporting',
      'White-label branding options',
      'API access for integrations',
      'Multiple team member accounts',
      'Priority customer support',
      'Advanced automation features'
    ]
  }
];

interface FormData {
  name: string;
  email: string;
  password: string;
  bakeryName: string;
  phone: string;
  location: string;
  selectedPlan: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  baker?: {
    id: string;
    slug: string;
    name: string;
  };
  requiresVerification?: boolean;
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    bakeryName: '',
    phone: '',
    location: '',
    selectedPlan: 'pro'
  });

  const signupMutation = useMutation({
    mutationFn: async (data: FormData): Promise<SignupResponse> => {
      const response = await apiRequest('POST', '/api/bakers/signup', data);
      return response.json();
    },
    onSuccess: (data: SignupResponse) => {
      if (data.success) {
        if (data.requiresVerification) {
          // Redirect to login with verification message
          setLocation(`/baker-login?verification-sent=true&email=${encodeURIComponent(formData.email)}`);
        } else if (data.baker) {
          toast({
            title: "Account created successfully!",
            description: "Welcome to Bakewise! Setting up your dashboard...",
          });
          setLocation(`/baker/${data.baker.slug}/dashboard`);
        }
      } else {
        toast({
          title: "Signup Failed",
          description: data.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.name) {
        toast({
          title: "Please fill in all required fields",
          description: "Name, email, and password are required.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bakeryName || !formData.phone || !formData.location) {
      toast({
        title: "Please complete all fields",
        description: "All business information is required.",
        variant: "destructive",
      });
      return;
    }

    const finalData = { ...formData, selectedPlan };
    signupMutation.mutate(finalData);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Sign Up - Bakewise SaaS Platform for Bakeries"
        description="Join Bakewise and start growing your bakery business today. Professional tools for customer management, quotes, and marketplace visibility."
      />
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Start Growing Your<br />
            <span className="text-orange-500">Bakery Business Today</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Join hundreds of successful bakers using our platform to manage customers, 
            create professional quotes, and grow their business.
          </p>

          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-8">Trusted by 500+ professional bakers</p>
        </div>
      </div>

      {/* Signup Steps */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= step 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 mx-2 ${
                    currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4 text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 1 && "Account Information"}
              {currentStep === 2 && "Business Details"} 
              {currentStep === 3 && "Choose Your Plan"}
            </h2>
            <p className="text-gray-600">
              {currentStep === 1 && "Create your Bakewise account"}
              {currentStep === 2 && "Tell us about your bakery"}
              {currentStep === 3 && "Select the perfect plan for your business"}
            </p>
          </div>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-8">
              
              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="h-12"
                      data-testid="input-name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-12"
                      data-testid="input-email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Choose a secure password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-12"
                      data-testid="input-password"
                      required
                    />
                  </div>

                  <Button 
                    onClick={handleNext}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                    data-testid="button-next-step1"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bakeryName" className="text-gray-700 font-medium">Bakery Name *</Label>
                    <Input
                      id="bakeryName"
                      type="text"
                      placeholder="Your bakery business name"
                      value={formData.bakeryName}
                      onChange={(e) => handleInputChange('bakeryName', e.target.value)}
                      className="h-12"
                      data-testid="input-bakery-name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-12"
                      data-testid="input-phone"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 font-medium">Location (City, State) *</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="h-12"
                      data-testid="input-location"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-12 border-2 border-gray-300"
                      data-testid="button-back-step2"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNext}
                      className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                      data-testid="button-next-step2"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all duration-300 ${
                          selectedPlan === plan.id 
                            ? 'border-2 border-orange-500 shadow-lg' 
                            : 'border-2 border-gray-200 hover:border-orange-200'
                        } ${plan.highlighted ? 'relative' : ''}`}
                        onClick={() => setSelectedPlan(plan.id)}
                        data-testid={`card-plan-${plan.id}`}
                      >
                        {plan.highlighted && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-orange-500 text-white">Most Popular</Badge>
                          </div>
                        )}
                        
                        <CardHeader className="text-center p-4">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-xl flex items-center justify-center">
                            {plan.icon}
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-900">{plan.name}</CardTitle>
                          <div className="mb-2">
                            <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-sm text-gray-600 ml-1">{plan.monthly}</span>
                          </div>
                          <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 pt-0">
                          <div className="space-y-2">
                            {plan.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                            {plan.features.length > 4 && (
                              <div className="text-sm text-gray-500">
                                +{plan.features.length - 4} more features
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 h-12 border-2 border-gray-300"
                        data-testid="button-back-step3"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={signupMutation.isPending}
                        className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                        data-testid="button-create-account"
                      >
                        {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/baker-login" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}