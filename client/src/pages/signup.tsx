import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Link } from 'wouter';
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
    price: '$29',
    monthly: 'per month',
    description: 'Perfect for getting started',
    icon: <BadgeCheck className="w-8 h-8 text-blue-600" />,
    features: [
      'Basic CRM (up to 50 customers)',
      '10 quotes per month',
      'Basic templates',
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
  const [formData, setFormData] = useState({
    bakeryName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    selectedPlan: 'professional'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-16 w-16 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Join Bakewise</h1>
              <p className="text-lg text-muted-foreground">Transform your bakery business</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">
            🧁 Start Your Sweet Success Story Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join hundreds of bakers who've streamlined their business with our all-in-one platform.
            From customer management to payment processing—we've got you covered.
          </p>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Happy Bakers</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
              <p className="text-muted-foreground">Revenue Processed</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">Customer Satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12">Choose Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="mb-4">{plan.icon}</div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.monthly}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan.id }))}
                  >
                    {formData.selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started Today</CardTitle>
              <CardDescription>
                Fill out the form below to create your Bakewise account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              
              <div>
                <Label htmlFor="city">City/Location</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="San Francisco, CA"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selected Plan</h4>
                <div className="flex items-center justify-between">
                  <span>{plans.find(p => p.id === formData.selectedPlan)?.name}</span>
                  <span className="font-bold">
                    {plans.find(p => p.id === formData.selectedPlan)?.price}/month
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Start Your 14-Day Free Trial
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                No credit card required. Cancel anytime. 
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Highlight */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-12">Everything You Need to Succeed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Smart CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage customers, track preferences, and never miss a follow-up
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Quote Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create professional quotes in minutes with templates and pricing
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <UserCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Digital Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  E-signatures, automated workflows, and legal templates
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Payment Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Collect deposits, manage payment plans, and automate invoicing
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button asChild size="lg" className="mr-4">
            <Link href="/demo-tenant">Try Live Demo</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}