import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenant } from './TenantBrandProvider';
import { useToast } from '@/hooks/use-toast';
import { CrmDashboard } from './CrmDashboard';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Star,
  Mail,
  Phone,
  Settings,
  Palette,
  Upload,
  FileText,
  UserCheck
} from 'lucide-react';

interface Lead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  weddingDate?: string;
  guestCount?: number;
  budget?: string;
  message?: string;
  status: string;
  createdAt: string;
}

interface Baker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rating?: string;
  priceRange?: string;
  specialties?: string[];
  network?: {
    isApproved: boolean;
    commissionRate: string;
    priority: number;
  };
}

export function VenueAdminDashboard() {
  const { tenant, branding, updateBranding } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch tenant-specific data
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/tenant/leads'],
    enabled: !!tenant,
  });

  const { data: bakers = [] } = useQuery<Baker[]>({
    queryKey: ['/api/tenant/bakers'],
    enabled: !!tenant,
  });

  const { data: profiles = [] } = useQuery<any[]>({
    queryKey: ['/api/tenant/profiles'],
    enabled: !!tenant,
  });

  // Brand customization state
  const [brandingForm, setBrandingForm] = useState({
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
    heroTitle: branding.customMessages.heroTitle || '',
    heroSubtitle: branding.customMessages.heroSubtitle || '',
  });

  const updateBrandingMutation = useMutation({
    mutationFn: async (updates: any) => {
      await updateBranding({
        primaryColor: updates.primaryColor,
        secondaryColor: updates.secondaryColor,
        accentColor: updates.accentColor,
        customMessages: {
          ...branding.customMessages,
          heroTitle: updates.heroTitle,
          heroSubtitle: updates.heroSubtitle,
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Branding Updated",
        description: "Your venue's branding has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update branding. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="no-tenant-message">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have access to a venue dashboard. Please contact support if you believe this is an error.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate dashboard metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const convertedLeads = leads.filter(l => l.status === 'booked').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
  const approvedBakers = bakers.filter(b => b.network?.isApproved).length;

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="venue-admin-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary" data-testid="venue-name">{tenant.name}</h1>
          <p className="text-muted-foreground">Venue Admin Dashboard</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {tenant.subscriptionPlan.charAt(0).toUpperCase() + tenant.subscriptionPlan.slice(1)} Plan
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
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
          <TabsTrigger value="leads" data-testid="tab-leads">Leads</TabsTrigger>
          <TabsTrigger value="bakers" data-testid="tab-bakers">Bakers</TabsTrigger>
          <TabsTrigger value="branding" data-testid="tab-branding">Branding</TabsTrigger>
        </TabsList>

        {/* CRM Tab */}
        <TabsContent value="crm" className="space-y-6">
          <CrmDashboard bakerId="baker-1" />
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Builder</CardTitle>
              <CardDescription>
                Create and manage professional quotes for your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced quote builder coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
              <CardDescription>
                Digital contracts with e-signatures and automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contract system coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="metric-total-leads">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLeads}</div>
                <p className="text-xs text-muted-foreground">+{newLeads} new this month</p>
              </CardContent>
            </Card>

            <Card data-testid="metric-conversion-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">{convertedLeads} booked</p>
              </CardContent>
            </Card>

            <Card data-testid="metric-approved-bakers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Bakers</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedBakers}</div>
                <p className="text-xs text-muted-foreground">in your network</p>
              </CardContent>
            </Card>

            <Card data-testid="metric-customer-profiles">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Profiles</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profiles.length}</div>
                <p className="text-xs text-muted-foreground">active couples</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest customer inquiries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{lead.customerName}</p>
                      <p className="text-sm text-muted-foreground">{lead.customerEmail}</p>
                      {lead.weddingDate && (
                        <p className="text-xs text-muted-foreground">Wedding: {lead.weddingDate}</p>
                      )}
                    </div>
                    <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-center text-muted-foreground">No leads yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venue Information</CardTitle>
                <CardDescription>Your venue details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{tenant.contactEmail}</span>
                </div>
                {tenant.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tenant.contactPhone}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tenant.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Subdomain: {tenant.subdomain}.weddingcakeai.com</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>Manage customer inquiries and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 border rounded-lg space-y-2" data-testid={`lead-${lead.id}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{lead.customerName}</h3>
                      <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>Email: {lead.customerEmail}</div>
                      {lead.customerPhone && <div>Phone: {lead.customerPhone}</div>}
                      {lead.weddingDate && <div>Wedding: {lead.weddingDate}</div>}
                    </div>
                    {lead.guestCount && (
                      <div className="text-sm text-muted-foreground">
                        Guests: {lead.guestCount} | Budget: {lead.budget || 'Not specified'}
                      </div>
                    )}
                    {lead.message && (
                      <div className="text-sm border-l-2 border-primary pl-3 italic">
                        "{lead.message}"
                      </div>
                    )}
                  </div>
                ))}
                {leads.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leads yet. Share your venue's cake calculator to start receiving inquiries!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bakers Tab */}
        <TabsContent value="bakers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Baker Network</CardTitle>
              <CardDescription>Manage your approved baker partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bakers.map((baker) => (
                  <div key={baker.id} className="p-4 border rounded-lg" data-testid={`baker-${baker.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{baker.name}</h3>
                      <div className="flex items-center space-x-2">
                        {baker.network?.isApproved && (
                          <Badge variant="default">Approved</Badge>
                        )}
                        {baker.rating && (
                          <Badge variant="secondary">
                            ⭐ {baker.rating}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>Email: {baker.email}</div>
                      {baker.phone && <div>Phone: {baker.phone}</div>}
                      {baker.priceRange && <div>Price: {baker.priceRange}</div>}
                    </div>
                    {baker.specialties && baker.specialties.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {baker.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {baker.network && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Commission: {(parseFloat(baker.network.commissionRate) * 100).toFixed(1)}% | 
                        Priority: {baker.network.priority}
                      </div>
                    )}
                  </div>
                ))}
                {bakers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bakers in your network yet. Contact support to add baker partners.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Brand Customization</span>
              </CardTitle>
              <CardDescription>
                Customize your venue's brand colors and messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={brandingForm.primaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                      data-testid="input-primary-color"
                    />
                    <Input
                      value={brandingForm.primaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#B8860B"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={brandingForm.secondaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      value={brandingForm.secondaryColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#F5E6B3"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={brandingForm.accentColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10"
                      data-testid="input-accent-color"
                    />
                    <Input
                      value={brandingForm.accentColor}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#8B7355"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={brandingForm.heroTitle}
                    onChange={(e) => setBrandingForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                    placeholder="Welcome to Your Venue"
                    data-testid="input-hero-title"
                  />
                </div>

                <div>
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={brandingForm.heroSubtitle}
                    onChange={(e) => setBrandingForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Plan your perfect wedding cake with our expert partners"
                    data-testid="input-hero-subtitle"
                  />
                </div>
              </div>

              <Button 
                onClick={() => updateBrandingMutation.mutate(brandingForm)}
                disabled={updateBrandingMutation.isPending}
                className="w-full"
                data-testid="button-save-branding"
              >
                {updateBrandingMutation.isPending ? 'Saving...' : 'Save Branding Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}