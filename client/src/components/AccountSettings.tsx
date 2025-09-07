import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Crown,
  Users,
  Settings,
  Bell,
  Shield,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

interface AccountSettingsProps {
  bakerId: string;
  className?: string;
}

interface AccountDetails {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  notifications: {
    newLeads: boolean;
    paymentUpdates: boolean;
    marketingEmails: boolean;
  };
}

interface Subscription {
  id: string;
  plan: 'free' | 'pro' | 'plus';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: string[];
  limits: {
    leads: number;
    portfolio: number;
    teamMembers: number;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

export function AccountSettings({ bakerId, className }: AccountSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({ email: '', role: 'viewer' as const });

  // Fetch actual baker data
  const { data: baker } = useQuery<any>({
    queryKey: [`/api/bakers`, bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch baker');
      return response.json();
    }
  });

  // Transform baker data to account details format
  const { data: account, isLoading: accountLoading } = useQuery<AccountDetails>({
    queryKey: [`/api/bakers/${bakerId}/account`],
    queryFn: async () => {
      if (!baker) throw new Error('Baker data not loaded');
      return {
        id: bakerId,
        businessName: baker.name,
        ownerName: baker.name, // Using baker name as owner for now  
        email: baker.email,
        phone: baker.phone || '',
        address: {
          street: baker.address || '',
          city: baker.address || '',
          state: '',
          zipCode: ''
        },
        businessHours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '16:00', closed: false },
          sunday: { open: '09:00', close: '14:00', closed: true }
        },
        notifications: {
          newLeads: true,
          paymentUpdates: true,
          marketingEmails: false
        }
      };
    }
  });

  // Fetch subscription details
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription>({
    queryKey: [`/api/bakers/${bakerId}/subscription`],
    queryFn: async () => {
      // Mock data - in real app, fetch from API
      return {
        id: `sub-${bakerId}`,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        features: [
          'Unlimited leads',
          'Advanced quote builder',
          'Contract management',
          'Payment processing',
          'Team collaboration',
          'Priority support'
        ],
        limits: {
          leads: -1, // unlimited
          portfolio: -1, // unlimited
          teamMembers: 5
        }
      };
    }
  });

  // Fetch team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: [`/api/bakers/${bakerId}/team`],
    queryFn: async () => {
      // Mock data - in real app, fetch from API
      return [
        {
          id: 'member-1',
          name: 'Sarah Johnson',
          email: 'sarah@sweetdreamsbakery.com',
          role: 'owner',
          status: 'active',
          joinedAt: '2024-01-15T10:00:00Z',
          lastActive: new Date().toISOString()
        },
        {
          id: 'member-2',
          name: 'Mike Chen',
          email: 'mike@sweetdreamsbakery.com',
          role: 'admin',
          status: 'active',
          joinedAt: '2024-02-01T14:30:00Z',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        }
      ];
    }
  });

  // Add team member mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: async (member: { email: string; role: string }) => {
      return await apiRequest("POST", `/api/bakers/${bakerId}/team`, member);
    },
    onSuccess: () => {
      toast({
        title: "Team Member Invited",
        description: "Invitation sent successfully!",
      });
      setNewTeamMember({ email: '', role: 'viewer' });
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/team`] });
    },
    onError: () => {
      toast({
        title: "Invitation Failed",
        description: "Unable to send team invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'plus': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (accountLoading || subscriptionLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your bakery account, subscription, and team members
          </p>
        </div>
        <Badge className={`${getPlanColor(subscription?.plan || 'free')} text-sm font-semibold px-4 py-2`}>
          <Crown className="w-4 h-4 mr-1" />
          {subscription?.plan?.toUpperCase()} Plan
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" data-testid="tab-subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Business Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                    data-testid="button-edit-profile"
                  >
                    {editingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={account?.businessName}
                    disabled={!editingProfile}
                    data-testid="input-business-name"
                  />
                </div>
                <div>
                  <Label>Owner Name</Label>
                  <Input
                    value={account?.ownerName}
                    disabled={!editingProfile}
                    data-testid="input-owner-name"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    value={account?.email}
                    disabled={!editingProfile}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={account?.phone}
                    disabled={!editingProfile}
                    data-testid="input-phone"
                  />
                </div>
                {editingProfile && (
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-4 py-2"
                      data-testid="button-save-profile"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Business Address</CardTitle>
                  {!editingProfile && (
                    <p className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded-md">
                      Click edit on Business Information to modify address
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Street Address</Label>
                  <Input
                    value={account?.address?.street}
                    disabled={!editingProfile}
                    data-testid="input-street"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={account?.address?.city}
                      disabled={!editingProfile}
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={account?.address?.state}
                      disabled={!editingProfile}
                      data-testid="input-state"
                    />
                  </div>
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={account?.address?.zipCode}
                    disabled={!editingProfile}
                    data-testid="input-zip"
                  />
                </div>
                {editingProfile && (
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-4 py-2"
                      data-testid="button-save-address"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Address
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Manage your plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {subscription?.plan?.toUpperCase()} Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="text-green-600 font-medium">{subscription?.status}</span>
                    </p>
                  </div>
                  <Badge className={getPlanColor(subscription?.plan || 'free')}>
                    <Crown className="w-4 h-4 mr-1" />
                    {subscription?.plan?.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                    <p className="font-medium">
                      {subscription?.currentPeriodEnd ? 
                        new Date(subscription.currentPeriodEnd).toLocaleDateString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auto-Renewal</p>
                    <p className="font-medium">
                      {subscription?.cancelAtPeriodEnd ? (
                        <span className="text-orange-600">Cancelled at period end</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subscription?.features?.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" data-testid="button-change-plan">
                    Change Plan
                  </Button>
                  <Button variant="outline" data-testid="button-billing-history">
                    View Billing History
                  </Button>
                  {!subscription?.cancelAtPeriodEnd && (
                    <Button variant="destructive" data-testid="button-cancel-subscription">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="space-y-6">
            {/* Add Team Member */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>
                  Add team members to help manage your bakery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Enter email address"
                    value={newTeamMember.email}
                    onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                    data-testid="input-team-email"
                  />
                  <select
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value as any})}
                    className="px-3 py-2 border rounded-md"
                    data-testid="select-team-role"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    onClick={() => addTeamMemberMutation.mutate(newTeamMember)}
                    disabled={!newTeamMember.email || addTeamMemberMutation.isPending}
                    data-testid="button-invite-member"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({teamMembers?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getRoleColor(member.role)}>
                          {member.role.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {member.status === 'active' ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-orange-600">{member.status}</span>
                          )}
                        </div>
                        {member.role !== 'owner' && (
                          <Button variant="outline" size="sm" data-testid={`button-remove-${member.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Lead Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new customers submit cake inquiries
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={account?.notifications?.newLeads}
                  className="w-4 h-4"
                  data-testid="checkbox-new-leads"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications for successful payments and failed transactions
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={account?.notifications?.paymentUpdates}
                  className="w-4 h-4"
                  data-testid="checkbox-payment-updates"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Tips, best practices, and platform updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={account?.notifications?.marketingEmails}
                  className="w-4 h-4"
                  data-testid="checkbox-marketing-emails"
                />
              </div>

              <div className="pt-4">
                <Button data-testid="button-save-notifications">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}