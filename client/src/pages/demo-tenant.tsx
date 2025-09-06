import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import WeddingCakeCalculator from '@/components/WeddingCakeCalculator';
import { Link } from 'wouter';
import { ArrowLeft, Palette, Building2 } from 'lucide-react';

export default function DemoTenant() {
  // Simulate tenant context for demo
  useEffect(() => {
    // Apply demo tenant styling
    const root = document.documentElement;
    root.style.setProperty('--primary', '220 15% 25%'); // Dark blue
    root.style.setProperty('--secondary', '210 40% 92%'); // Light blue
    root.style.setProperty('--accent', '220 15% 35%'); // Darker blue
    
    return () => {
      // Reset to default styling
      root.style.setProperty('--primary', '45 74% 39%'); // Gold
      root.style.setProperty('--secondary', '45 100% 85%'); // Light gold
      root.style.setProperty('--accent', '30 30% 45%'); // Brown
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Demo Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Grand Ballroom Wedding Venue</h1>
                <p className="text-sm text-muted-foreground">Demo Tenant Instance</p>
              </div>
            </div>
            <Badge variant="secondary">Premium Plan</Badge>
          </div>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Demo: Tenant-Specific Branding</span>
              </CardTitle>
              <CardDescription>
                This page demonstrates how the platform looks when accessed by a specific venue.
                Notice the custom colors, branding, and venue-specific content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Primary Color</p>
                  <p className="text-xs text-muted-foreground">Dark Blue Theme</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-secondary rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Secondary Color</p>
                  <p className="text-xs text-muted-foreground">Light Blue Accent</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-accent rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Accent Color</p>
                  <p className="text-xs text-muted-foreground">Darker Blue</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button asChild>
                  <Link href="/admin">View Admin Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Main Platform
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom messaging for this venue */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Grand Ballroom</h2>
          <p className="text-xl text-muted-foreground mb-6">
            Plan your perfect wedding cake with our curated network of expert bakers
          </p>
        </div>

        {/* Show the cake calculator with venue-specific styling */}
        <WeddingCakeCalculator />
        
        {/* Demo features showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Venue-Specific Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Custom venue branding applied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Baker network filtered for this venue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Leads routed to venue first</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Commission tracking enabled</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📊 Real Implementation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                In a real deployment, this would be accessed via:
              </p>
              <div className="space-y-2 text-sm">
                <div className="bg-muted p-2 rounded font-mono">
                  grandballroom.weddingcakeai.com
                </div>
                <div className="bg-muted p-2 rounded font-mono">
                  cakes.grandballroom.com
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Each venue gets their own subdomain and can optionally use a custom domain.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}