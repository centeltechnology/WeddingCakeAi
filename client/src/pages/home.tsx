import WeddingCakeCalculator from "@/components/WeddingCakeCalculator";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useTenant } from "@/components/TenantBrandProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building2, Palette, BarChart3, Users } from "lucide-react";

export default function Home() {
  const { tenant, branding } = useTenant();

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      {!tenant && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🎉 New: White-Label Platform for Wedding Venues!</h2>
            <p className="text-muted-foreground mb-6">
              Transform your venue with a branded cake calculator and baker network management system.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Multi-Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Each venue gets their own branded instance with custom domain support</CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <Palette className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Brand Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Custom colors, logos, and messaging to match venue branding</CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Lead management, conversion tracking, and revenue analytics</CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Baker Networks</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Manage approved bakers and commission rates per venue</CardDescription>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button asChild size="lg">
                <Link href="/admin">Try Venue Admin Dashboard</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/demo-tenant">See Demo Venue</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <WeddingCakeCalculator />
    </div>
  );
}
