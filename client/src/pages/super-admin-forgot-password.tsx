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
import { ChevronLeft, Mail, ChefHat } from "lucide-react";
import { Link } from "wouter";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function SuperAdminForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await import('@/lib/csrf').then(({ makeAuthenticatedRequest }) => 
        makeAuthenticatedRequest("/api/clean-auth/super-admin/forgot-password", {
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Bakewise
          </h1>
          <p className="text-gray-600 mt-2">Super Admin Portal</p>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/super-admin-login" data-testid="link-back-login">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800" data-testid="button-back-login">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-pink-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your username or email address and we'll send you a link to reset your password.
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
                  <strong>Email sent!</strong> If an account exists with that information, a password reset email has been sent. Please check your inbox and follow the instructions.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your username or email"
                  {...form.register("identifier")}
                  className="h-11"
                  data-testid="input-identifier"
                />
                {form.formState.errors.identifier && (
                  <p className="text-sm text-red-600" data-testid="error-identifier">
                    {form.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-pink-600 hover:bg-pink-700" 
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
                <Link href="/super-admin-login" data-testid="link-login">
                  <Button variant="link" className="p-0 h-auto text-pink-600 hover:text-pink-700" data-testid="button-login">
                    Sign in here
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
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
      </div>
    </div>
  );
}