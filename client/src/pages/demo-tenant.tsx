import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationHeader } from '@/components/NavigationHeader';
import { CrmDashboard } from '@/components/CrmDashboard';
import { Link } from 'wouter';
import { ArrowLeft, Palette, ChefHat, Users, FileText, CreditCard, Star, UserCheck, Clock, Send } from 'lucide-react';

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
                      sweetdreams.bakewiseapp.com
                    </div>
                    <div className="bg-muted p-2 rounded font-mono">
                      orders.sweetdreamsbakery.com
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Custom domains, white-label branding, and multi-tenant architecture.
                  </p>
                  <Button 
                    asChild
                    className="w-full" 
                    variant="outline"
                    data-testid="button-try-lead-capture"
                  >
                    <a href="/calculator" target="_blank" rel="noopener noreferrer">
                      <ChefHat className="h-4 w-4 mr-2" />
                      Try Live Lead Capture Demo
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    See how customers submit cake inquiries that appear in your CRM
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">+4 this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">12</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                  <Star className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">9</div>
                  <p className="text-xs text-muted-foreground">75% conversion</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quote Value</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$18.2k</div>
                  <p className="text-xs text-muted-foreground">Total pending</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Wedding Cake Quote - Emily Thompson
                      </CardTitle>
                      <CardDescription className="mt-1">
                        QUO-2024-001 • Created 3 days ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">Oct 15, 2024</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Guest Count</p>
                      <p className="font-medium">120 guests</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quote Total</p>
                      <p className="font-medium">$1,386.56</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid Until</p>
                      <p className="font-medium">Sep 28, 2024</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Quote
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Send Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Convert to Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Birthday Cake Quote - Jessica Martinez
                      </CardTitle>
                      <CardDescription className="mt-1">
                        QUO-2024-002 • Created 1 week ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">Sep 22, 2024</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Guest Count</p>
                      <p className="font-medium">25 guests</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quote Total</p>
                      <p className="font-medium">$450.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Accepted On</p>
                      <p className="font-medium">Sep 10, 2024</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Quote
                    </Button>
                    <Button size="sm">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Create Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Corporate Event - Johnson & Associates
                      </CardTitle>
                      <CardDescription className="mt-1">
                        QUO-2024-003 • Created 5 days ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">Nov 8, 2024</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Guest Count</p>
                      <p className="font-medium">200 guests</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quote Total</p>
                      <p className="font-medium">$2,840.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid Until</p>
                      <p className="font-medium">Oct 5, 2024</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Quote
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Follow Up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">14</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Signed</CardTitle>
                  <Star className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">6</div>
                  <p className="text-xs text-muted-foreground">Awaiting signature</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$28.5k</div>
                  <p className="text-xs text-muted-foreground">Total value</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                        Wedding Cake Contract - Emily Thompson
                      </CardTitle>
                      <CardDescription className="mt-1">
                        CON-2024-001 • Signed 1 week ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Signed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">Oct 15, 2024</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-medium">$1,386.56</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit Paid</p>
                      <p className="font-medium text-green-600">$693.28</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Final Payment</p>
                      <p className="font-medium">Due Oct 8</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Contract
                    </Button>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payment Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                        Birthday Cake Contract - Jessica Martinez
                      </CardTitle>
                      <CardDescription className="mt-1">
                        CON-2024-002 • Sent 2 days ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending Signature</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">Sep 22, 2024</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-medium">$450.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit Due</p>
                      <p className="font-medium">$225.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sent To</p>
                      <p className="font-medium">jessica.martinez@email.com</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Contract
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Send Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Resend Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                        Corporate Event - Johnson & Associates
                      </CardTitle>
                      <CardDescription className="mt-1">
                        CON-2024-003 • Signed 3 days ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Signed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">Nov 8, 2024</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-medium">$2,840.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit Paid</p>
                      <p className="font-medium text-green-600">$1,420.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Final Payment</p>
                      <p className="font-medium">Due Nov 1</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Contract
                    </Button>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payment Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Client Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12.4k</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">$3.2k</div>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collected</CardTitle>
                  <Star className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$9.2k</div>
                  <p className="text-xs text-muted-foreground">Received</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">$850</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Star className="h-5 w-5 mr-2 text-green-600" />
                        Deposit Payment - Emily Thompson
                      </CardTitle>
                      <CardDescription className="mt-1">
                        INV-2024-001 • Paid 1 week ago
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Type</p>
                      <p className="font-medium">50% Deposit</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-medium text-green-600">$693.28</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Method</p>
                      <p className="font-medium">Credit Card</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="font-medium">Oct 8, 2024</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      View Receipt
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Send Final Invoice
                    </Button>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payment History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                        Final Payment - Jessica Martinez
                      </CardTitle>
                      <CardDescription className="mt-1">
                        INV-2024-002 • Due tomorrow
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Type</p>
                      <p className="font-medium">Final Payment</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount Due</p>
                      <p className="font-medium text-yellow-600">$225.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Method</p>
                      <p className="font-medium">Bank Transfer</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-medium">Sep 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Send Reminder
                    </Button>
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Payment Link
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Mark as Paid
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        Deposit Processing - Johnson & Associates
                      </CardTitle>
                      <CardDescription className="mt-1">
                        INV-2024-003 • Processing for 2 hours
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Type</p>
                      <p className="font-medium">50% Deposit</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-medium text-blue-600">$1,420.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Method</p>
                      <p className="font-medium">ACH Transfer</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Clear</p>
                      <p className="font-medium">Sep 16, 2024</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Transaction Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="h-3 w-3 mr-1" />
                      Contact Bank
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}