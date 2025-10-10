import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { BillingDashboard } from "@/components/BillingDashboard";
import AppLayout from "@/components/AppLayout";

export default function Billing() {
  const [, setLocation] = useLocation();

  // For now, redirect to the main baker dashboard with billing tab
  // In a full auth system, this would detect the logged-in user
  useEffect(() => {
    // Check for success/error parameters from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const cancelled = urlParams.get('cancelled');
    
    if (success === 'true') {
      // Successful payment - redirect to dashboard with success message
      setLocation('/admin?tab=billing&success=true');
      return;
    }
    
    if (cancelled === 'true') {
      // Cancelled payment - redirect to dashboard with cancelled message
      setLocation('/admin?tab=billing&cancelled=true');
      return;
    }
    
    // Default redirect to billing dashboard
    setLocation('/admin?tab=billing');
  }, [setLocation]);

  return (
    <AppLayout>
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">
                Redirecting to Billing Dashboard
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Taking you to your billing settings...</span>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    ✨ Your billing settings have been updated successfully!
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}