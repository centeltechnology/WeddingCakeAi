import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Link } from 'wouter';
import { ArrowLeft, Palette, ChefHat, Users, FileText, CreditCard, Star } from 'lucide-react';

export default function DemoTenant() {
  // Simulate tenant context for demo
  useEffect(() => {
    // Apply demo baker's custom styling
    const root = document.documentElement;
    root.style.setProperty('--primary', '340 75% 47%'); // Pink theme
    root.style.setProperty('--secondary', '340 100% 95%'); // Light pink
    root.style.setProperty('--accent', '340 65% 57%'); // Medium pink
    
    return () => {
      // Reset to default Bakewise styling
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
              <ChefHat className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Sweet Dreams Bakery</h1>
                <p className="text-sm text-muted-foreground">Demo Baker Instance on Bakewise</p>
              </div>
            </div>
            <Badge variant="secondary">Premium Plan</Badge>
          </div>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Demo: Baker-Specific Branding</span>
              </CardTitle>
              <CardDescription>
                This page demonstrates how Bakewise looks when accessed by a specific baker.
                Notice the custom colors, branding, and baker-specific content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Primary Color</p>
                  <p className="text-xs text-muted-foreground">Pink Theme</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-secondary rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Secondary Color</p>
                  <p className="text-xs text-muted-foreground">Light Pink Accent</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-accent rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Accent Color</p>
                  <p className="text-xs text-muted-foreground">Medium Pink</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button asChild>
                  <Link href="/admin">View Baker Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Bakewise
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom messaging for this baker */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">🧁 Welcome to Sweet Dreams Bakery</h2>
          <p className="text-xl text-muted-foreground mb-6">
            Creating magical moments with custom cakes and sweet treats
          </p>
        </div>

        {/* Baker's portfolio showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl">🎂</span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Wedding Cakes</h3>
              <p className="text-sm text-muted-foreground">Elegant multi-tier designs for your special day</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
              <span className="text-4xl">🧁</span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Custom Cupcakes</h3>
              <p className="text-sm text-muted-foreground">Personalized treats for any celebration</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <span className="text-4xl">🍰</span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Birthday Cakes</h3>
              <p className="text-sm text-muted-foreground">Make every birthday unforgettable</p>
            </CardContent>
          </Card>
        </div>

        {/* Baker's business tools showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Customer CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Track 47 active customers and their preferences</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Quote Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Generated 23 quotes this month with 78% conversion</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <Star className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>14 active contracts worth $28,500</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>$12,450 collected this month</CardDescription>
            </CardContent>
          </Card>
        </div>
        
        {/* Demo features showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Baker-Specific Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Custom baker branding applied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">CRM system for customer management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Quote builder with custom pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Contract management & payments</span>
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
                  sweetdreams.bakewise.com
                </div>
                <div className="bg-muted p-2 rounded font-mono">
                  orders.sweetdreamsbakery.com
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Each baker gets their own subdomain and can optionally use a custom domain.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}