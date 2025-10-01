import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ChefHat, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function BakerResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (!resetToken) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }
    
    setToken(resetToken);
  }, []);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await import('@/lib/csrf').then(({ makeAuthenticatedRequest }) => 
        makeAuthenticatedRequest("/api/bakers/reset-password", {
          method: "POST",
          body: JSON.stringify({
            token,
            newPassword: data.newPassword,
          }),
        })
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        form.reset();
        
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. You can now log in with your new password.",
        });

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          setLocation("/baker-login");
        }, 3000);
      } else {
        setError(result.message || "An error occurred while resetting your password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An error occurred while resetting your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If no token or invalid token, show error state
  if (!token && error) {
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
                Invalid Reset Link
              </h1>
              <p className="text-gray-600">
                This password reset link is invalid, expired, or has already been used.
              </p>
            </div>

            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Invalid Reset Link
                </CardTitle>
                <CardDescription className="text-gray-600">
                  This password reset link is invalid, expired, or has already been used.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert variant="destructive" data-testid="alert-token-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    onClick={() => setLocation("/baker-forgot-password")} 
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600"
                    data-testid="button-request-new"
                  >
                    Request New Reset Link
                  </Button>
                  
                  <Button 
                    onClick={() => setLocation("/baker-login")} 
                    variant="outline"
                    className="w-full h-11"
                    data-testid="button-back-login"
                  >
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

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
              Enter your new password below
            </p>
          </div>

          {/* Reset Password Form */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create New Password
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your new password must be at least 8 characters long.
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
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Success!</strong> Your password has been reset. Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...form.register("newPassword")}
                      className="h-11 pr-10"
                      data-testid="input-new-password"
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
                  {form.formState.errors.newPassword && (
                    <p className="text-sm text-red-600" data-testid="error-new-password">
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...form.register("confirmPassword")}
                      className="h-11 pr-10"
                      data-testid="input-confirm-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600" data-testid="error-confirm-password">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600" 
                  disabled={isLoading || success}
                  data-testid="button-reset-password"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Requirements */}
          <Card className="bg-gray-50 border-gray-200 mt-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="font-medium text-gray-900 text-sm">Password Requirements:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></div>
                    At least 8 characters long
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></div>
                    Must match confirmation
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
