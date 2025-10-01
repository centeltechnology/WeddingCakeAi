import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ChefHat, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { useLocation, Link } from "wouter";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function BakerLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check for verification parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationSent = urlParams.get('verification-sent');
    const email = urlParams.get('email');
    
    if (verificationSent === 'true' && email) {
      setShowVerificationBanner(true);
      setVerificationEmail(decodeURIComponent(email));
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await import('@/lib/csrf').then(({ makeAuthenticatedRequest }) => 
        makeAuthenticatedRequest("/api/bakers/login", {
          method: "POST",
          body: JSON.stringify(data),
        })
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Store session token
        localStorage.setItem("baker_token", result.token);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${result.baker.name}!`,
        });

        // Redirect to baker dashboard using the baker's slug
        setLocation(`/baker/${result.baker.slug}/dashboard`);
      } else if (result.requiresVerification) {
        // Handle email verification required
        setShowVerificationBanner(true);
        setVerificationEmail(data.email);
        setError("");
        
        toast({
          title: "Email verification required",
          description: "Please verify your email address before logging in.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Baker Login - BakerIQ SaaS Platform"
        description="Sign in to your BakerIQ baker account to access your business dashboard, manage customers, and grow your bakery business."
      />
      
      <NavigationHeader />
      
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Baker Login
            </h1>
            <p className="text-gray-600">
              Access your BakerIQ business dashboard
            </p>
          </div>

          {/* Email Verification Banner */}
          {showVerificationBanner && verificationEmail && (
            <EmailVerificationBanner
              userEmail={verificationEmail}
              onDismiss={() => setShowVerificationBanner(false)}
              className="mb-6"
            />
          )}

          {/* Login Form */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl text-gray-900">Sign in to your account</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email and password to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@bakery.com"
                    {...form.register("email")}
                    className="h-11"
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...form.register("password")}
                      className="h-11 pr-10"
                      data-testid="input-password"
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
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  data-testid="button-login"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Links */}
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Link 
                    href="/super-admin-forgot-password" 
                    className="text-sm text-orange-500 hover:text-orange-600"
                    data-testid="link-forgot-password"
                  >
                    Forgot your password?
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 pt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link 
                      href="/signup" 
                      className="text-orange-500 hover:text-orange-600 font-medium"
                      data-testid="link-signup"
                    >
                      Sign up here
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