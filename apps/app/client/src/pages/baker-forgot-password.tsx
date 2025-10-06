import { useState } from "react";
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
import { ChevronLeft, Mail, ChefHat } from "lucide-react";
import { Link } from "wouter";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function BakerForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await import('@/lib/csrf').then(({ makeAuthenticatedRequest }) => 
        makeAuthenticatedRequest("/api/bakers/forgot-password", {
          method: "POST",
          body: JSON.stringify(data),
        })
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        form.reset();
        
        toast({
          title: "Reset email sent",
          description: result.message,
        });
      } else {
        setError(result.message || "An error occurred while processing your request");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Reset Password - BakerIQ"
        description="Reset your BakerIQ baker account password"
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
              Reset Password
            </h1>
            <p className="text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Forgot Password Form */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" data-testid="alert-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800" data-testid="alert-success">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Email sent!</strong> If an account exists with that email, a password reset email has been sent. Please check your inbox and follow the instructions.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <p className="text-sm text-red-600" data-testid="error-email">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600" 
                  disabled={isLoading}
                  data-testid="button-send-reset"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Email...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reset Email
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <p>Remember your password?</p>
                  <Link href="/baker-login" data-testid="link-login">
                    <Button variant="link" className="p-0 h-auto text-orange-500 hover:text-orange-600" data-testid="button-login">
                      Sign in here
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200 mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-blue-900">Security Notice</p>
                  <p className="mt-1 text-blue-700">
                    Password reset links expire after 15 minutes and can only be used once. If you don't receive an email, please check your spam folder or contact support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link href="/baker-login" data-testid="link-back-login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
