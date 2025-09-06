import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff,
  Heart,
  ArrowRight
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400/40 to-pink-400/40 rounded-full blur-2xl w-20 h-20 -m-2"></div>
            <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto relative shadow-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Customer Portal</h1>
          <p className="text-gray-600">Access your quotes, payments, and order details</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to view your quotes and manage your orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-4 w-4 text-rose-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/50 backdrop-blur-sm"
                    data-testid="input-customer-email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 h-4 w-4 text-rose-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/50 backdrop-blur-sm"
                    data-testid="input-customer-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-rose-100"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-rose-500" /> : <Eye className="h-4 w-4 text-rose-500" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loginMutation.isPending}
                data-testid="button-customer-login"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Portal
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have access yet?{' '}
                <span className="font-medium text-rose-600">
                  Your baker will provide login details once your order is confirmed.
                </span>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-rose-100/50">
              <Button
                variant="ghost"
                className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 backdrop-blur-sm"
                onClick={() => setLocation('/')}
                data-testid="button-back-home"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact your baker directly or email support
          </p>
        </div>
      </div>
    </div>
  );
}