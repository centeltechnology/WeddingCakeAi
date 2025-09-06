import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationHeader } from '@/components/NavigationHeader';
import { CrmDashboard } from '@/components/CrmDashboard';
import { Link } from 'wouter';
import { ArrowLeft, Palette, ChefHat, Users, FileText, CreditCard, Star, UserCheck } from 'lucide-react';

export default function DemoTenant() {
  const [activeTab, setActiveTab] = useState('overview');
  
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
                <p className="text-sm text-muted-foreground">Demo Baker Dashboard on Bakewise</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Premium Plan</Badge>
              <Button variant="outline" asChild size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Bakewise
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Functional Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Palette className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="crm" data-testid="tab-crm">
              <Users className="h-4 w-4 mr-2" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">
              <FileText className="h-4 w-4 mr-2" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="contracts" data-testid="tab-contracts">
              <UserCheck className="h-4 w-4 mr-2" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Demo: Baker Business Dashboard</span>
                </CardTitle>
                <CardDescription>
                  This is a live demo of Bakewise's business management tools for bakers.
                  Click the tabs above to explore the CRM, quotes, contracts, and payment features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
                    <p className="text-sm font-medium">Custom Branding</p>
                    <p className="text-xs text-muted-foreground">Pink Theme Applied</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Live CRM System</p>
                    <p className="text-xs text-muted-foreground">Sample Customer Data</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Business Tools</p>
                    <p className="text-xs text-muted-foreground">Quotes & Contracts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">+12 this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">78% conversion rate</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contracts</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">14</div>
                  <p className="text-xs text-muted-foreground">$28,500 value</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12.4k</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Try These Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Click "CRM" to see customer management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">View sample customers and lead pipeline</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Search, filter, and manage customer data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Explore quote and contract features</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>📊 Real Implementation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    In production, each baker gets:
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
                    Custom domains, white-label branding, and multi-tenant architecture.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CRM Tab - Live functional CRM */}
          <TabsContent value="crm" className="space-y-6">
            <CrmDashboard bakerId="baker-1" />
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Builder</CardTitle>
                <CardDescription>
                  Create professional quotes with templates, pricing tiers, and PDF generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Advanced Quote Builder</h3>
                  <p className="text-muted-foreground mb-4">
                    Template-based quotes with custom pricing, automated calculations, and PDF export
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Management</CardTitle>
                <CardDescription>
                  Digital contracts with e-signatures, automated workflows, and legal templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Digital Contract System</h3>
                  <p className="text-muted-foreground mb-4">
                    E-signature workflows, contract templates, and automated reminders
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>
                  Advanced payment processing with deposits, payment plans, and automated invoicing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enhanced Payment System</h3>
                  <p className="text-muted-foreground mb-4">
                    Deposit collection, payment schedules, and automated invoice generation
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}