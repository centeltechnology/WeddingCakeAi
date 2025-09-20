import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Baker } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BillingDashboard } from '@/components/BillingDashboard';
import CalculatorThemeSelector, { calculatorThemes } from '@/components/CalculatorThemeSelector';
import { useCalculatorTheme } from '@/hooks/useCalculatorTheme';
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
  AlertTriangle,
  Palette
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
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    website: string;
    tiktok: string;
    pinterest: string;
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
  yearsExperience?: number;
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

// Helper function to parse address string into components
function parseAddress(fullAddress: string) {
  if (!fullAddress) {
    return { street: '', city: '', state: '', zipCode: '' };
  }
  
  // Try to parse "Street, City, State, ZIP" format
  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length >= 4) {
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zipCode: parts[3] || ''
    };
  } else if (parts.length === 3) {
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zipCode: ''
    };
  } else if (parts.length === 2) {
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: '',
      zipCode: ''
    };
  } else {
    // If can't parse, put everything in street field
    return {
      street: fullAddress,
      city: '',
      state: '',
      zipCode: ''
    };
  }
}

export function AccountSettings({ bakerId, className }: AccountSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTheme, setTheme } = useCalculatorTheme();
  const [editingProfile, setEditingProfile] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({ email: '', role: 'viewer' as const });
  
  // Local form state for editing
  const [formData, setFormData] = useState<Partial<AccountDetails>>({});
  
  // Update form data when account data changes (only when not editing)
  const updateFormData = (account: AccountDetails | undefined) => {
    if (account && !editingProfile) {
      setFormData(account);
    }
  };

  // Fetch actual baker data
  const { data: baker } = useQuery<Baker>({
    queryKey: [`/api/bakers`, bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch baker');
      return response.json();
    }
  });

  // Transform baker data to account details format  
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: [`/api/bakers/${bakerId}/account`],
    queryFn: async () => {
      if (!baker) throw new Error('Baker data not loaded');
      const accountData = {
        id: bakerId,
        businessName: baker.name,
        ownerName: baker.name, // Using baker name as owner for now  
        email: baker.email,
        phone: baker.phone || '',
        address: parseAddress(baker.address || ''),
        socialMedia: {
          facebook: baker.socialMedia?.facebook || '',
          instagram: baker.socialMedia?.instagram || '',
          twitter: baker.socialMedia?.twitter || '',
          website: baker.socialMedia?.website || '',
          tiktok: baker.socialMedia?.tiktok || '',
          pinterest: baker.socialMedia?.pinterest || ''
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
        },
        yearsExperience: (baker as any).yearsExperience ?? undefined
      };
      updateFormData(accountData);
      return accountData;
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
      try {
        const response = await fetch(`/api/bakers/${bakerId}/team`);
        if (!response.ok) {
          if (response.status === 404) return []; // No team members yet
          throw new Error('Failed to fetch team members');
        }
        return response.json();
      } catch (error) {
        console.log('Team members not found, returning empty array');
        return []; // Return empty array for now
      }
    }
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<AccountDetails>) => {
      return await apiRequest("PUT", `/api/bakers/${bakerId}`, profileData);
    },
    onSuccess: async () => {
      // Show success toast first
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully!",
      });
      
      // Then invalidate and wait for data to refetch
      await queryClient.invalidateQueries({ queryKey: [`/api/bakers`, bakerId] });
      await queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/account`] });
      
      // Finally set editing to false (this allows the updateFormData to work properly)
      setEditingProfile(false);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save profile changes. Please try again.",
        variant: "destructive",
      });
    },
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

  // Handle form field changes
  const handleFieldChange = (field: string, value: string | number | undefined, nestedField?: string) => {
    setFormData(prev => {
      if (nestedField) {
        return {
          ...prev,
          [field]: {
            ...(prev[field as keyof AccountDetails] as any),
            [nestedField]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Handle save
  const handleSave = () => {
    // Transform complex formData into the flat structure expected by API
    const apiData: any = {};
    
    // Transform business name to name field
    if (formData.businessName) {
      apiData.name = formData.businessName;
    } else if (formData.ownerName) {
      apiData.name = formData.ownerName;
    }
    
    // Transform phone (simple string)
    if (formData.phone) {
      apiData.phone = formData.phone;
    }
    
    // Transform nested address object into simple string
    if (formData.address) {
      const addressParts = [
        formData.address.street,
        formData.address.city,
        formData.address.state,
        formData.address.zipCode
      ].filter(Boolean);
      if (addressParts.length > 0) {
        apiData.address = addressParts.join(', ');
      }
    }
    
    // Transform description (simple string)
    if ((formData as any).description) {
      apiData.description = (formData as any).description;
    }
    
    // Transform years experience (simple number)
    if (formData.yearsExperience) {
      apiData.yearsExperience = formData.yearsExperience;
    }
    
    // Transform social media (nested object)
    if (formData.socialMedia) {
      const socialMediaData: any = {};
      if (formData.socialMedia.instagram) socialMediaData.instagram = formData.socialMedia.instagram;
      if (formData.socialMedia.facebook) socialMediaData.facebook = formData.socialMedia.facebook;
      if (formData.socialMedia.twitter) socialMediaData.twitter = formData.socialMedia.twitter;
      if (formData.socialMedia.tiktok) socialMediaData.tiktok = formData.socialMedia.tiktok;
      if (formData.socialMedia.pinterest) socialMediaData.pinterest = formData.socialMedia.pinterest;
      if (formData.socialMedia.website) socialMediaData.website = formData.socialMedia.website;
      
      // Only include socialMedia if we have at least one social media link
      if (Object.keys(socialMediaData).length > 0) {
        apiData.socialMedia = socialMediaData;
      }
    }
    
    console.log('Sending baker profile data:', apiData);
    saveProfileMutation.mutate(apiData);
  };

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="themes" data-testid="tab-themes">
            <Palette className="h-4 w-4 mr-2" />
            Themes
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
                    value={editingProfile ? formData.businessName || '' : account?.businessName || ''}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('businessName', e.target.value)}
                    data-testid="input-business-name"
                  />
                </div>
                <div>
                  <Label>Owner Name</Label>
                  <Input
                    value={editingProfile ? formData.ownerName || '' : account?.ownerName || ''}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                    data-testid="input-owner-name"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    value={editingProfile ? formData.email || '' : account?.email || ''}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={editingProfile ? formData.phone || '' : account?.phone || ''}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={editingProfile ? (formData.yearsExperience ?? '') : (account?.yearsExperience ?? '')}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('yearsExperience', e.target.value === '' ? undefined : parseInt(e.target.value))}
                    placeholder="Enter years of experience"
                    data-testid="input-years-experience"
                  />
                </div>
                
                {/* Social Media Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Social Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Instagram Handle</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">@</span>
                        <Input
                          value={editingProfile ? formData.socialMedia?.instagram || '' : account?.socialMedia?.instagram || ''}
                          disabled={!editingProfile}
                          placeholder="your_instagram"
                          className="pl-8"
                          onChange={(e) => handleFieldChange('socialMedia', e.target.value, 'instagram')}
                          data-testid="input-instagram"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Facebook Page</Label>
                      <Input
                        value={editingProfile ? formData.socialMedia?.facebook || '' : account?.socialMedia?.facebook || ''}
                        disabled={!editingProfile}
                        placeholder="facebook.com/yourpage"
                        onChange={(e) => handleFieldChange('socialMedia', e.target.value, 'facebook')}
                        data-testid="input-facebook"
                      />
                    </div>
                    <div>
                      <Label>TikTok Handle</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">@</span>
                        <Input
                          value={editingProfile ? formData.socialMedia?.tiktok || '' : account?.socialMedia?.tiktok || ''}
                          disabled={!editingProfile}
                          placeholder="your_tiktok"
                          className="pl-8"
                          onChange={(e) => handleFieldChange('socialMedia', e.target.value, 'tiktok')}
                          data-testid="input-tiktok"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Pinterest</Label>
                      <Input
                        value={editingProfile ? formData.socialMedia?.pinterest || '' : account?.socialMedia?.pinterest || ''}
                        disabled={!editingProfile}
                        placeholder="pinterest.com/yourboard"
                        onChange={(e) => handleFieldChange('socialMedia', e.target.value, 'pinterest')}
                        data-testid="input-pinterest"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Website</Label>
                      <Input
                        value={editingProfile ? formData.socialMedia?.website || '' : account?.socialMedia?.website || ''}
                        disabled={!editingProfile}
                        placeholder="https://yourwebsite.com"
                        onChange={(e) => handleFieldChange('socialMedia', e.target.value, 'website')}
                        data-testid="input-website"
                      />
                    </div>
                  </div>
                </div>
                {editingProfile && (
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      disabled={saveProfileMutation.isPending}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-4 py-2"
                      data-testid="button-save-profile"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingProfile(false);
                      if (account) setFormData(account); // Reset form data on cancel
                    }}>
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
                    value={editingProfile ? formData.address?.street || '' : account?.address?.street || ''}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('address', e.target.value, 'street')}
                    data-testid="input-street"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={editingProfile ? formData.address?.city || '' : account?.address?.city || ''}
                      disabled={!editingProfile}
                      onChange={(e) => handleFieldChange('address', e.target.value, 'city')}
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={editingProfile ? formData.address?.state || '' : account?.address?.state || ''}
                      disabled={!editingProfile}
                      onChange={(e) => handleFieldChange('address', e.target.value, 'state')}
                      data-testid="input-state"
                    />
                  </div>
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={editingProfile ? formData.address?.zipCode || '' : account?.address?.zipCode || ''}
                    disabled={!editingProfile}
                    onChange={(e) => handleFieldChange('address', e.target.value, 'zipCode')}
                    data-testid="input-zip"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Calculator Themes
              </CardTitle>
              <CardDescription>
                Customize how your calculator appears to customers on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <CalculatorThemeSelector 
                  selectedTheme={currentTheme.id}
                  onThemeChange={(themeId) => {
                    setTheme(themeId);
                    const selectedTheme = calculatorThemes.find(t => t.id === themeId);
                    toast({
                      title: "Theme Updated",
                      description: `Switched to ${selectedTheme?.name || 'selected'} theme`,
                    });
                  }}
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Using Your Custom Theme</h4>
                  <p className="text-sm text-blue-700">
                    Your selected theme will automatically apply to all calculator widgets embedded on your website. 
                    Customers will see your calculator with your chosen colors and styling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <BillingDashboard bakerId={bakerId} />
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
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter email address"
                      value={newTeamMember.email}
                      onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                      data-testid="input-team-email"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <Select
                      value={newTeamMember.role}
                      onValueChange={(value) => setNewTeamMember({...newTeamMember, role: value as any})}
                    >
                      <SelectTrigger className="w-32" data-testid="select-team-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => addTeamMemberMutation.mutate(newTeamMember)}
                      disabled={!newTeamMember.email || addTeamMemberMutation.isPending}
                      data-testid="button-invite-member"
                      className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium"
                    >
                      {addTeamMemberMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Invite Team Member
                        </>
                      )}
                    </Button>
                  </div>
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
                  {teamMembers && teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No team members yet</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Start collaborating by inviting team members to help manage your bakery.
                      </p>
                      <p className="text-xs text-gray-400">
                        Use the invite form above to add your first team member.
                      </p>
                    </div>
                  )}
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