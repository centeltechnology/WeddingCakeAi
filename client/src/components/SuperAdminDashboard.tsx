import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Settings,
  Users,
  Building2,
  BarChart3,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Crown,
  Database,
  Server,
  Globe,
  Mail,
  Bell,
  Lock,
  Unlock,
  LogOut
} from 'lucide-react';

interface SuperAdminDashboardProps {
  className?: string;
}

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: number;
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers24h: number;
  systemHealth: number;
}

interface TenantSummary {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  planType: string;
  monthlyRevenue: number;
  userCount: number;
  lastActivity: string;
  createdAt: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

// Edit Tenant Modal Component
function EditTenantModal({ 
  tenant, 
  isOpen, 
  onClose,
  onSave 
}: {
  tenant: TenantSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<TenantSummary>) => void;
}) {
  const [name, setName] = useState(tenant?.name || '');
  const [planType, setPlanType] = useState(tenant?.planType || '');

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setPlanType(tenant.planType);
    }
  }, [tenant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      planType: planType.trim(),
    });
  };

  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tenant Settings</DialogTitle>
          <DialogDescription>
            Update settings for {tenant.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant-name">Tenant Name</Label>
            <Input
              id="tenant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-tenant-name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-type">Plan Type</Label>
            <Input
              id="plan-type"
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              data-testid="input-plan-type"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-tenant">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Modal Component
function EditUserModal({ 
  user, 
  isOpen, 
  onClose,
  onSave 
}: {
  user: PlatformUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<PlatformUser>) => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      email: email.trim(),
    });
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update details for {user.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-user-name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-user-email"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-user">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Password Change Form Component
function PasswordChangeForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest('POST', '/api/super-admin/change-password', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Password updated successfully",
        variant: "default",
      });
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error", 
        description: "New password and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Current Password</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          data-testid="input-current-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          data-testid="input-new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          data-testid="input-confirm-password"
        />
      </div>
      <Button 
        type="submit" 
        disabled={changePasswordMutation.isPending}
        data-testid="button-change-password"
      >
        {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
      </Button>
    </form>
  );
}

export function SuperAdminDashboard({ className }: SuperAdminDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTenant, setEditingTenant] = useState<TenantSummary | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [showUserEditModal, setShowUserEditModal] = useState(false);

  // Fetch platform statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/super-admin/stats'],
  });

  // Fetch all tenants
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<TenantSummary[]>({
    queryKey: ['/api/super-admin/tenants'],
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<PlatformUser[]>({
    queryKey: ['/api/super-admin/users'],
  });

  // Fetch system metrics
  const { data: systemMetrics = [], isLoading: metricsLoading } = useQuery<SystemMetric[]>({
    queryKey: ['/api/super-admin/system-metrics'],
  });

  // User mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/super-admin/users/${userId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<PlatformUser> }) => {
      const response = await apiRequest('PATCH', `/api/super-admin/users/${userId}`, updates);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
      setShowUserEditModal(false);
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Tenant management mutations
  const updateTenantStatusMutation = useMutation({
    mutationFn: async ({ tenantId, status }: { tenantId: string; status: 'active' | 'suspended' }) => {
      const response = await apiRequest('PATCH', `/api/super-admin/tenants/${tenantId}/status`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      toast({
        title: "Success",
        description: "Tenant status updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tenant status",
        variant: "destructive",
      });
    },
  });

  // Quick Action Mutations
  const quickSuspendMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await apiRequest('POST', '/api/super-admin/quick-actions/tenant/suspend', { tenantId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      toast({
        title: "Success",
        description: "Tenant suspended successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend tenant",
        variant: "destructive",
      });
    },
  });

  const quickActivateMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await apiRequest('POST', '/api/super-admin/quick-actions/tenant/activate', { tenantId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      toast({
        title: "Success", 
        description: "Tenant activated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate tenant",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async (exportConfig: { exportType: string; format: string }) => {
      const response = await apiRequest('POST', '/api/super-admin/data-export', exportConfig);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Started",
        description: `Data export job created. Job ID: ${data.id}`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/data-exports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start data export",
        variant: "destructive",
      });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ tenantId, updates }: { tenantId: string; updates: Partial<TenantSummary> }) => {
      const response = await apiRequest('PATCH', `/api/super-admin/tenants/${tenantId}`, updates);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/tenants'] });
      setShowEditModal(false);
      setEditingTenant(null);
      toast({
        title: "Success",
        description: "Tenant updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tenant",
        variant: "destructive",
      });
    },
  });

  // Filter tenants and users based on search
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Click handlers for tenant actions
  const handleViewTenant = (tenant: TenantSummary) => {
    toast({
      title: "Tenant Details",
      description: `Viewing details for ${tenant.name}`,
      variant: "default",
    });
    // In a real app, this would open a detailed view or navigate to tenant page
  };

  const handleEditTenant = (tenant: TenantSummary) => {
    setEditingTenant(tenant);
    setShowEditModal(true);
  };

  const handleSaveTenant = (updates: Partial<TenantSummary>) => {
    if (editingTenant) {
      updateTenantMutation.mutate({
        tenantId: editingTenant.id,
        updates
      });
    }
  };

  const handleToggleTenantStatus = (tenant: TenantSummary) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';
    
    updateTenantStatusMutation.mutate({ 
      tenantId: tenant.id, 
      status: newStatus 
    });
  };

  // User action handlers
  const handleEditUser = (user: PlatformUser) => {
    setEditingUser(user);
    setShowUserEditModal(true);
  };

  const handleSaveUser = (updates: Partial<PlatformUser>) => {
    if (editingUser) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        updates
      });
    }
  };

  const handleDeleteUser = (user: PlatformUser) => {
    deleteUserMutation.mutate(user.id);
  };

  const handleAddTenant = () => {
    toast({
      title: "Add Tenant",
      description: "Add new tenant functionality coming soon",
      variant: "default",
    });
    // In a real app, this would open an add tenant modal
  };

  // Quick Action Handlers
  const handleQuickSuspendTenant = () => {
    if (tenants && tenants.length > 0) {
      const activeTenant = tenants.find((t: any) => t.status === 'active');
      if (activeTenant) {
        quickSuspendMutation.mutate(activeTenant.id);
      } else {
        toast({
          title: "No Active Tenants",
          description: "There are no active tenants to suspend.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Tenants Found",
        description: "There are no tenants available.",
        variant: "destructive",
      });
    }
  };

  const handleQuickActivateTenant = () => {
    if (tenants && tenants.length > 0) {
      const suspendedTenant = tenants.find((t: any) => t.status === 'suspended');
      if (suspendedTenant) {
        quickActivateMutation.mutate(suspendedTenant.id);
      } else {
        toast({
          title: "No Suspended Tenants",
          description: "There are no suspended tenants to activate.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Tenants Found",
        description: "There are no tenants available.",
        variant: "destructive",
      });
    }
  };

  const handleSendAnnouncement = () => {
    toast({
      title: "Announcement Feature",
      description: "System announcement feature will be available in the Announcements tab.",
      variant: "default",
    });
    // This would normally open a modal to create announcements
  };

  const handleExportData = () => {
    const exportConfig = {
      exportType: 'platform_data',
      format: 'csv'
    };
    exportDataMutation.mutate(exportConfig);
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading platform dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform-wide management and analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Platform Status: Healthy
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('superAdminToken');
                  window.location.href = '/super-admin/login';
                }}
                data-testid="button-logout"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <TabsList className="grid w-full grid-cols-4 gap-1 h-auto p-2">
              <TabsTrigger value="overview" data-testid="tab-overview" className="flex-col h-16 gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="tenants" data-testid="tab-tenants" className="flex-col h-16 gap-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs">Tenants</span>
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users" className="flex-col h-16 gap-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Users</span>
              </TabsTrigger>
              <TabsTrigger value="system" data-testid="tab-system" className="flex-col h-16 gap-1">
                <Server className="h-4 w-4" />
                <span className="text-xs">System</span>
              </TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security" className="flex-col h-16 gap-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Security</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics" className="flex-col h-16 gap-1">
                <Database className="h-4 w-4" />
                <span className="text-xs">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="communication" data-testid="tab-communication" className="flex-col h-16 gap-1">
                <Bell className="h-4 w-4" />
                <span className="text-xs">Comms</span>
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings" className="flex-col h-16 gap-1">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden lg:block">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tenants" data-testid="tab-tenants">
                <Building2 className="h-4 w-4 mr-2" />
                Tenants
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="system" data-testid="tab-system">
                <Server className="h-4 w-4 mr-2" />
                System
              </TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <Database className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="communication" data-testid="tab-communication">
                <Bell className="h-4 w-4 mr-2" />
                Communication
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Key Metrics Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats?.activeTenants || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      of {platformStats?.totalTenants || 0} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {platformStats?.activeUsers24h || 0} active in 24h
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(platformStats?.monthlyRevenue || 0)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      +{platformStats?.revenueGrowth || 0}% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformStats?.systemHealth || 100}%</div>
                    <p className="text-xs text-green-600">All systems operational</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tenant Activity</CardTitle>
                    <CardDescription>Latest tenant registrations and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tenants.slice(0, 5).map((tenant) => (
                        <div key={tenant.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
                              {tenant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tenant.name}</p>
                              <p className="text-xs text-muted-foreground">{tenant.planType}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(tenant.status)}>
                            {tenant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        className="w-full justify-start" 
                        variant="outline" 
                        onClick={handleQuickSuspendTenant}
                        disabled={quickSuspendMutation.isPending}
                        data-testid="button-quick-suspend-tenant"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {quickSuspendMutation.isPending ? 'Suspending...' : 'Quick Suspend Tenant'}
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={handleQuickActivateTenant}
                        disabled={quickActivateMutation.isPending}
                        data-testid="button-quick-activate-tenant"
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        {quickActivateMutation.isPending ? 'Activating...' : 'Quick Activate Tenant'}
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={handleSendAnnouncement}
                        data-testid="button-send-announcement"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Send Platform Announcement
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={handleExportData}
                        disabled={exportDataMutation.isPending}
                        data-testid="button-export-data"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {exportDataMutation.isPending ? 'Exporting...' : 'Export Platform Data'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tenant Management</CardTitle>
                      <CardDescription>Manage all bakeries on the platform</CardDescription>
                    </div>
                    <Button onClick={handleAddTenant} data-testid="button-add-tenant">
                      <Building2 className="h-4 w-4 mr-2" />
                      Add Tenant
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tenants by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-tenants"
                      />
                    </div>
                  </div>

                  {tenantsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">Loading tenants...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTenants.map((tenant) => (
                        <Card key={tenant.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                                  {tenant.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold">{tenant.name}</h3>
                                  <p className="text-sm text-muted-foreground">ID: {tenant.id}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm">
                                    <span>Plan: {tenant.planType}</span>
                                    <span>•</span>
                                    <span>{tenant.userCount} users</span>
                                    <span>•</span>
                                    <span>Revenue: {formatCurrency(tenant.monthlyRevenue)}/month</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(tenant.status)}>
                                  {tenant.status}
                                </Badge>
                                <Button variant="ghost" size="sm" data-testid={`button-tenant-actions-${tenant.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewTenant(tenant)}
                                data-testid={`button-view-tenant-${tenant.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditTenant(tenant)}
                                data-testid={`button-edit-tenant-${tenant.id}`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Settings
                              </Button>
                              {tenant.status === 'active' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700" 
                                  onClick={() => handleToggleTenantStatus(tenant)}
                                  disabled={updateTenantStatusMutation.isPending}
                                  data-testid={`button-suspend-tenant-${tenant.id}`}
                                >
                                  <Lock className="h-4 w-4 mr-2" />
                                  {updateTenantStatusMutation.isPending ? "Suspending..." : "Suspend"}
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600 hover:text-green-700" 
                                  onClick={() => handleToggleTenantStatus(tenant)}
                                  disabled={updateTenantStatusMutation.isPending}
                                  data-testid={`button-activate-tenant-${tenant.id}`}
                                >
                                  <Unlock className="h-4 w-4 mr-2" />
                                  {updateTenantStatusMutation.isPending ? "Activating..." : "Activate"}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Advanced User Management</CardTitle>
                      <CardDescription>Manage all users with bulk operations and role management</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" data-testid="button-export-users">
                        Export Users
                      </Button>
                      <Button variant="outline" data-testid="button-bulk-actions">
                        <Users className="h-4 w-4 mr-2" />
                        Bulk Actions
                      </Button>
                      <Button data-testid="button-add-user">
                        <Users className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users by name, email, or tenant..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-users"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" data-testid="filter-active-users">
                          Active
                        </Button>
                        <Button variant="outline" size="sm" data-testid="filter-suspended-users">
                          Suspended
                        </Button>
                        <Button variant="outline" size="sm" data-testid="filter-admin-users">
                          Admins
                        </Button>
                      </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              data-testid="checkbox-select-all-users"
                            />
                            <Label className="text-sm">Select All Users</Label>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            0 users selected
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" data-testid="button-bulk-activate">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate Selected
                          </Button>
                          <Button variant="outline" size="sm" data-testid="button-bulk-suspend">
                            <XCircle className="h-4 w-4 mr-2" />
                            Suspend Selected
                          </Button>
                          <Button variant="outline" size="sm" data-testid="button-bulk-change-role">
                            <Crown className="h-4 w-4 mr-2" />
                            Change Role
                          </Button>
                          <Button variant="outline" size="sm" data-testid="button-bulk-reset-passwords">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Passwords
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">Loading users...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              data-testid={`checkbox-select-user-${user.id}`}
                            />
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{user.name}</p>
                                {user.role === 'super_admin' && (
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Super Admin
                                  </Badge>
                                )}
                                {user.role === 'admin' && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{user.tenantName}</span>
                                <span>•</span>
                                <span>Role: {user.role}</span>
                                <span>•</span>
                                <span>Last login: {user.lastLogin || 'Never'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.role !== 'super_admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteUser(user)}
                                disabled={deleteUserMutation.isPending}
                                data-testid={`button-delete-user-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {systemMetrics.map((metric) => (
                  <Card key={metric.name}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                        {getSystemStatusIcon(metric.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metric.value}{metric.unit}
                      </div>
                      <p className={`text-xs ${
                        metric.status === 'healthy' ? 'text-green-600' : 
                        metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metric.status === 'healthy' ? 'Normal' : 
                         metric.status === 'warning' ? 'Attention needed' : 'Critical'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                  <CardDescription>Administrative system management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="h-20 flex-col" data-testid="button-database-backup">
                      <Database className="h-6 w-6 mb-2" />
                      <span>Database Backup</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" data-testid="button-clear-cache">
                      <Server className="h-6 w-6 mb-2" />
                      <span>Clear System Cache</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" data-testid="button-system-logs">
                      <Activity className="h-6 w-6 mb-2" />
                      <span>View System Logs</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" data-testid="button-health-check">
                      <CheckCircle className="h-6 w-6 mb-2" />
                      <span>Run Health Check</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab - Audit Logs and Security Features */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audit & Activity Logs</CardTitle>
                  <CardDescription>Track all administrative actions and system changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Input
                        placeholder="Search audit logs..."
                        className="flex-1"
                        data-testid="input-search-audit-logs"
                      />
                      <Button variant="outline" data-testid="button-filter-audit-logs">
                        <Search className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Tenant status changed</p>
                              <p className="text-sm text-muted-foreground">admin suspended tenant ID: bakery-{i}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">2 minutes ago</p>
                            <Badge variant="outline" className="text-xs">Admin Action</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Configure platform security policies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Two-Factor Authentication</Label>
                      <Button variant="outline" size="sm" data-testid="toggle-2fa">
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        Disabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Login Rate Limiting</Label>
                      <Button variant="outline" size="sm" data-testid="toggle-rate-limiting">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Session Timeout (minutes)</Label>
                      <Input type="number" defaultValue="60" className="w-20" data-testid="input-session-timeout" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your super admin password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PasswordChangeForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab - Data Export and Analytics */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export & Analytics</CardTitle>
                  <CardDescription>Export platform data and generate reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Quick Exports</h3>
                      <div className="space-y-2">
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => handleExportData()}
                          disabled={exportDataMutation.isPending}
                          data-testid="button-export-all-data"
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {exportDataMutation.isPending ? 'Exporting...' : 'Export All Platform Data'}
                        </Button>
                        <Button className="w-full justify-start" variant="outline" data-testid="button-export-tenants">
                          <Building2 className="h-4 w-4 mr-2" />
                          Export Tenant Data
                        </Button>
                        <Button className="w-full justify-start" variant="outline" data-testid="button-export-users">
                          <Users className="h-4 w-4 mr-2" />
                          Export User Data
                        </Button>
                        <Button className="w-full justify-start" variant="outline" data-testid="button-export-billing">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Export Billing Data
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Analytics Reports</h3>
                      <div className="space-y-3">
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Monthly Growth Report</p>
                              <p className="text-sm text-muted-foreground">User and tenant growth metrics</p>
                            </div>
                            <Button variant="outline" size="sm" data-testid="button-generate-growth-report">
                              Generate
                            </Button>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Revenue Analytics</p>
                              <p className="text-sm text-muted-foreground">Subscription and payment trends</p>
                            </div>
                            <Button variant="outline" size="sm" data-testid="button-generate-revenue-report">
                              Generate
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export History</CardTitle>
                  <CardDescription>Recent data export jobs and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Platform Data Export #{i}</p>
                            <p className="text-sm text-muted-foreground">CSV format • 2.4 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600">Completed</Badge>
                          <Button variant="outline" size="sm" data-testid={`button-download-export-${i}`}>
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Tab - Announcements and Email Templates */}
          <TabsContent value="communication">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>System Announcements</CardTitle>
                      <CardDescription>Manage platform-wide announcements and notifications</CardDescription>
                    </div>
                    <Button data-testid="button-create-announcement">
                      <Bell className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1,2,3].map((i) => (
                      <Card key={i} className="p-4 border-l-4 border-l-blue-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant={i === 1 ? "default" : "secondary"}>
                                {i === 1 ? "Active" : "Scheduled"}
                              </Badge>
                              <Badge variant="outline">
                                {i === 1 ? "Maintenance" : i === 2 ? "Feature" : "Important"}
                              </Badge>
                            </div>
                            <h3 className="font-medium">Scheduled maintenance on Sunday</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              The platform will undergo routine maintenance from 2:00 AM to 4:00 AM UTC.
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <span>Created {i} day{i > 1 ? 's' : ''} ago</span>
                              <span className="mx-2">•</span>
                              <span>Expires in {7-i} days</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-announcement-${i}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-announcement-${i}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Manage automated email templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Welcome Email', 'Trial Expiring', 'Payment Failed', 'Account Suspended'].map((template, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{template}</p>
                              <p className="text-sm text-muted-foreground">Last updated 2 days ago</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-edit-template-${i}`}>
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Broadcast Settings</CardTitle>
                    <CardDescription>Configure notification delivery preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Email Notifications</Label>
                      <Button variant="outline" size="sm" data-testid="toggle-email-notifications">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>In-App Notifications</Label>
                      <Button variant="outline" size="sm" data-testid="toggle-inapp-notifications">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>SMS Notifications</Label>
                      <Button variant="outline" size="sm" data-testid="toggle-sms-notifications">
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        Disabled
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>Global platform settings and features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Platform Name</Label>
                      <Input defaultValue="Bakewise" data-testid="input-platform-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Support Email</Label>
                      <Input defaultValue="support@bakewise.com" data-testid="input-support-email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Users per Tenant</Label>
                      <Input type="number" defaultValue="50" data-testid="input-max-users" />
                    </div>
                    <div className="space-y-2">
                      <Label>Trial Period (days)</Label>
                      <Input type="number" defaultValue="14" data-testid="input-trial-days" />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Feature Toggles</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <Label>New Tenant Registration</Label>
                        <Button variant="outline" size="sm" data-testid="toggle-registration">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Enabled
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Email Notifications</Label>
                        <Button variant="outline" size="sm" data-testid="toggle-notifications">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Enabled
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Maintenance Mode</Label>
                        <Button variant="outline" size="sm" data-testid="toggle-maintenance">
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Disabled
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Debug Logging</Label>
                        <Button variant="outline" size="sm" data-testid="toggle-debug">
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Disabled
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex space-x-4">
                    <Button data-testid="button-save-settings">
                      Save Changes
                    </Button>
                    <Button variant="outline" data-testid="button-reset-settings">
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Password Change Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Backup and Recovery</CardTitle>
                  <CardDescription>Database backup and restore operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">Daily backups at 2:00 AM UTC</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="toggle-auto-backups">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Enabled
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" data-testid="button-create-backup">
                      Create Manual Backup
                    </Button>
                    <Button variant="outline" data-testid="button-view-backups">
                      View All Backups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Tenant Modal */}
        <EditTenantModal
          tenant={editingTenant}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTenant(null);
          }}
          onSave={handleSaveTenant}
        />

        {/* Edit User Modal */}
        <EditUserModal
          user={editingUser}
          isOpen={showUserEditModal}
          onClose={() => {
            setShowUserEditModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      </div>
    </div>
  );
}