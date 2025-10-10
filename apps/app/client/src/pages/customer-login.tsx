import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useLocation, Link } from 'wouter';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff,
  Heart,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  customerId: string;
  sessionToken: string;
  customer: {
    name: string;
    email: string;
  };
}

export default function CustomerLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');

  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginForm): Promise<LoginResponse> => {
      const response = await apiRequest('POST', '/api/customer/login', loginData);
      return response.json();
    },
    onSuccess: (data: LoginResponse) => {
      if (data.success) {
        // Store customer session
        localStorage.setItem('customer_session', JSON.stringify({
          customerId: data.customerId,
          sessionToken: data.sessionToken,
          name: data.customer.name,
          email: data.customer.email
        }));
        
        toast({
          title: "Welcome back!",
          description: `Hello ${data.customer.name}, redirecting to your portal...`,
        });
        
        // Redirect to customer portal
        setLocation(`/customer-portal/${data.customerId}`);
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
      toast({
        title: "Login Failed",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    loginMutation.mutate(form);
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Customer Login - BakerIQ Portal"
        description="Sign in to your customer portal to view quotes, manage orders, and track your cake project progress."
      />
      
      <NavigationHeader />
      
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Customer Portal
            </h1>
            <p className="text-gray-600">
              Access your quotes, payments, and order details
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to view your quotes and manage your orders
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 h-4 w-4 text-orange-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 h-11"
                      data-testid="input-customer-email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 h-4 w-4 text-orange-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 h-11"
                      data-testid="input-customer-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  data-testid="button-customer-login"
                >
                  {loginMutation.isPending ? (
                    "Signing In..."
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>

              {/* Links */}
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Need help accessing your account?{" "}
                    <Link 
                      href="/help" 
                      className="text-orange-500 hover:text-orange-600"
                      data-testid="link-customer-help"
                    >
                      Contact Support
                    </Link>
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Looking for a quote?{" "}
                    <Link 
                      href="/marketplace" 
                      className="text-orange-500 hover:text-orange-600 font-medium"
                      data-testid="link-marketplace"
                    >
                      Find Bakers
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              data-testid="link-home"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to homepage
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}