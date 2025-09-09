import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
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
  BadgeCheck
} from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'FREE',
    monthly: 'forever',
    description: 'Perfect for getting started',
    icon: <BadgeCheck className="w-8 h-8 text-blue-600" />,
    features: [
      'Basic CRM (up to 10 customers)',
      '3 quotes per month',
      'Basic calculator themes',
      'Email support',
      'Standard branding'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$79',
    monthly: 'per month',
    description: 'For growing bakeries',
    icon: <Crown className="w-8 h-8 text-purple-600" />,
    highlighted: true,
    features: [
      'Unlimited customers & quotes',
      'Advanced CRM & pipeline tracking',
      'Contract management & e-signatures',
      'Payment processing & deposits',
      'Custom branding & subdomain',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$149',
    monthly: 'per month',
    description: 'For established bakeries',
    icon: <Rocket className="w-8 h-8 text-orange-600" />,
    features: [
      'Everything in Professional',
      'Multi-location support',
      'Team collaboration tools',
      'Advanced analytics & reporting',
      'White-label customization',
      'Custom domain support',
      'Dedicated account manager',
      'Phone support'
    ]
  }
];

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bakeryName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    selectedPlan: 'professional'
  });

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/bakers', {
        name: data.bakeryName,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        address: data.city || null,
        subscriptionPlan: data.selectedPlan,
        specialties: [],
        description: null,
        portfolio: []
      });
      return await response.json();
    },
    onSuccess: (baker) => {
      toast({
        title: "Welcome to Bakewise!",
        description: "Your account has been created successfully. Redirecting to your dashboard...",
      });
      
      // Redirect to baker dashboard
      setTimeout(() => {
        setLocation(`/baker/${baker.id}/dashboard`);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bakeryName || !formData.ownerName || !formData.email || !formData.password || !formData.confirmPassword || !formData.city) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields including your business address.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    signupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <NavigationHeader />
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-lg opacity-30"></div>
              <ChefHat className="h-16 w-16 text-rose-600 mr-4 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">Join Bakewise</h1>
              <p className="text-lg text-gray-600">Transform your bakery business</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            🧁 Start Your Sweet Success Story Today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of bakers who've streamlined their business with our all-in-one platform.
            From customer management to payment processing—we've got you covered.
          </p>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">500+</div>
              <p className="text-gray-600">Happy Bakers</p>
            </CardContent>
          </Card>
          <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">$2M+</div>
              <p className="text-gray-600">Revenue Processed</p>
            </CardContent>
          </Card>
          <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">98%</div>
              <p className="text-gray-600">Customer Satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plan.highlighted ? 'ring-2 ring-rose-200 scale-105 shadow-rose-200/50' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full blur-lg"></div>
                    <div className="relative">{plan.icon}</div>
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.monthly}</span>
                  </div>
                  <CardDescription className="mt-2 text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-emerald-600 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full transition-all duration-300 ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-lg' 
                        : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan.id }))}
                  >
                    {formData.selectedPlan === plan.id ? 'Selected ✓' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Get Started Today</CardTitle>
              <CardDescription className="text-gray-600">
                Fill out the form below to create your Bakewise account.<br/>
                <span className="text-rose-600 font-medium">Professional and Enterprise plans include a 14-day free trial!</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bakeryName">Bakery Name *</Label>
                  <Input
                    id="bakeryName"
                    name="bakeryName"
                    placeholder="Sweet Dreams Bakery"
                    value={formData.bakeryName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    placeholder="Jane Smith"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@sweetdreamsbakery.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="city">Business Address *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Full business address (e.g., 123 Main St, San Francisco, CA 94102)"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps customers find you in the marketplace. Include city and state for best results.
                </p>
              </div>

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-100">
                <h4 className="font-medium mb-2 text-gray-800">Selected Plan</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{plans.find(p => p.id === formData.selectedPlan)?.name}</span>
                  <span className="font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    {plans.find(p => p.id === formData.selectedPlan)?.price}
                    {formData.selectedPlan !== 'starter' && '/month'}
                  </span>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-lg transition-all duration-300" 
                size="lg"
              >
                {signupMutation.isPending ? "Creating Account..." : 
                 formData.selectedPlan === 'starter' ? "Create Free Account" : "Start Your 14-Day Free Trial"}
              </Button>
              
                <p className="text-xs text-gray-500 text-center">
                  {formData.selectedPlan === 'starter' 
                    ? "Free account - no credit card required." 
                    : "14-day trial - no credit card required. Cancel anytime."
                  } <br/>
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features Highlight */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Everything You Need to Succeed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full blur-lg"></div>
                  <Users className="h-12 w-12 text-rose-600 mx-auto mb-4 relative" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Smart CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Manage customers, track preferences, and never miss a follow-up
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full blur-lg"></div>
                  <FileText className="h-12 w-12 text-rose-600 mx-auto mb-4 relative" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Quote Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Create professional quotes in minutes with templates and pricing
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full blur-lg"></div>
                  <UserCheck className="h-12 w-12 text-rose-600 mx-auto mb-4 relative" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Digital Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  E-signatures, automated workflows, and legal templates
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-pink-400/30 rounded-full blur-lg"></div>
                  <CreditCard className="h-12 w-12 text-rose-600 mx-auto mb-4 relative" />
                </div>
                <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Payment Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Collect deposits, manage payment plans, and automate invoicing
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button asChild size="lg" className="mr-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-lg transition-all duration-300">
            <Link href="/demo-tenant">Try Live Demo</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="border-rose-200 text-rose-600 hover:bg-rose-50">
            <Link href="/">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}