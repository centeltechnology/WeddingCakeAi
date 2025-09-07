import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Unlock
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

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
                      <Button className="w-full justify-start" variant="outline" data-testid="button-create-tenant">
                        <Building2 className="h-4 w-4 mr-2" />
                        Create New Tenant
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-send-announcement">
                        <Bell className="h-4 w-4 mr-2" />
                        Send Platform Announcement
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-export-data">
                        <Database className="h-4 w-4 mr-2" />
                        Export Platform Data
                      </Button>
                      <Button className="w-full justify-start" variant="outline" data-testid="button-system-maintenance">
                        <Settings className="h-4 w-4 mr-2" />
                        Schedule Maintenance
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
                    <Button data-testid="button-add-tenant">
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
                              <Button variant="outline" size="sm" data-testid={`button-view-tenant-${tenant.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-edit-tenant-${tenant.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Settings
                              </Button>
                              {tenant.status === 'active' ? (
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" data-testid={`button-suspend-tenant-${tenant.id}`}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Suspend
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" data-testid={`button-activate-tenant-${tenant.id}`}>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Activate
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
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage all users across the platform</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" data-testid="button-export-users">
                        Export Users
                      </Button>
                      <Button data-testid="button-add-user">
                        <Users className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name, email, or tenant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-users"
                      />
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
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{user.tenantName}</span>
                                <span>•</span>
                                <span>{user.role}</span>
                                <span>•</span>
                                <span>Last login: {user.lastLogin}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <Button variant="ghost" size="sm" data-testid={`button-user-actions-${user.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Change your super admin password</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}