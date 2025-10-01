import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Mail,
  Search,
  ChevronDown,
  Ban,
  Check,
  Settings,
  BarChart3,
  Eye,
  Activity,
  PieChart
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts";

interface Baker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
  createdAt: string;
  stripeCustomerId?: string;
  currentPeriodEnd?: string;
}

interface PlatformStats {
  totalBakers: number;
  activeBakers: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  freeUsers: number;
  paidUsers: number;
  trialUsers: number;
  churnRate: number;
}

interface AnalyticsData {
  revenueOverTime: Array<{
    month: string;
    mrr: number;
    arr: number;
    newSignups: number;
  }>;
  userGrowth: Array<{
    month: string;
    total: number;
    free: number;
    paid: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  planDistribution: Array<{
    plan: string;
    count: number;
  }>;
  metrics: {
    arpu: number;
    conversionRate: number;
    trialConversionRate: number;
  };
}

export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBaker, setSelectedBaker] = useState<Baker | null>(null);
  const { toast } = useToast();

  // Fetch platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/super-admin/stats'],
  });

  // Fetch all bakers
  const { data: bakers, isLoading: bakersLoading } = useQuery<Baker[]>({
    queryKey: ['/api/super-admin/tenants'],
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/super-admin/analytics'],
  });

  // Toggle baker status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ bakerId, currentStatus }: { bakerId: string; currentStatus: boolean }) => {
      const newStatus = currentStatus ? 'suspended' : 'active';
      return await apiRequest('PATCH', `/api/super-admin/tenants/${bakerId}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      toast({
        title: "Status Updated",
        description: "Baker status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update baker status.",
        variant: "destructive",
      });
    },
  });

  // Update subscription plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ bakerId, plan }: { bakerId: string; plan: string }) => {
      return await apiRequest('PATCH', `/api/super-admin/tenants/${bakerId}/plan`, { plan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      setSelectedBaker(null);
      toast({
        title: "Plan Updated",
        description: "Subscription plan has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription plan.",
        variant: "destructive",
      });
    },
  });

  // Filter bakers based on search and status
  const filteredBakers = bakers?.filter((baker) => {
    const matchesSearch = 
      baker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baker.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && baker.isActive) ||
      (statusFilter === "suspended" && !baker.isActive) ||
      (statusFilter === "free" && (!baker.subscriptionPlan || baker.subscriptionPlan === "starter")) ||
      (statusFilter === "paid" && baker.subscriptionPlan && baker.subscriptionPlan !== "starter");

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPlanName = (plan: string | null | undefined) => {
    if (!plan || plan === 'starter') return 'Starter';
    if (plan === 'professional') return 'Professional';
    if (plan === 'enterprise') return 'Enterprise';
    return plan;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your BakerIQ platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" data-testid="button-settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="bakers" data-testid="tab-bakers">
              <Users className="h-4 w-4 mr-2" />
              Baker Management
            </TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
              <DollarSign className="h-4 w-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="emails" data-testid="tab-emails">
              <Mail className="h-4 w-4 mr-2" />
              Email Campaigns
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Bakers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="stat-total-bakers">
                      {statsLoading ? "..." : stats?.totalBakers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  {stats?.activeBakers || 0} active
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MRR</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="stat-mrr">
                      {statsLoading ? "..." : formatCurrency(stats?.monthlyRecurringRevenue || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Growing
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Paid Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="stat-paid-users">
                      {statsLoading ? "..." : stats?.paidUsers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  {stats?.freeUsers || 0} free users
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="stat-churn">
                      {statsLoading ? "..." : `${(stats?.churnRate || 0).toFixed(1)}%`}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Last 30 days
                </p>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start" data-testid="button-view-all-bakers">
                  <Users className="h-4 w-4 mr-2" />
                  View All Bakers
                </Button>
                <Button variant="outline" className="justify-start" data-testid="button-email-campaigns">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Campaigns
                </Button>
                <Button variant="outline" className="justify-start" data-testid="button-system-health">
                  <Settings className="h-4 w-4 mr-2" />
                  System Health
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <Card className="p-8">
                <p className="text-center text-gray-500">Loading analytics data...</p>
              </Card>
            ) : (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ARPU</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="metric-arpu">
                          {formatCurrency(analytics?.metrics.arpu || 0)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Average Revenue Per User
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="metric-conversion-rate">
                          {((analytics?.metrics.conversionRate || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Overall conversion to paid
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Trial Conversion</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid="metric-trial-conversion">
                          {((analytics?.metrics.trialConversionRate || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Activity className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Trial to paid conversion
                    </p>
                  </Card>
                </div>

                {/* Revenue Over Time Chart */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.revenueOverTime || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="mrr" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        name="MRR"
                        data-testid="chart-line-mrr"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="arr" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="ARR"
                        data-testid="chart-line-arr"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* User Growth Chart */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    User Growth
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.userGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="paid" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        name="Paid Users"
                        data-testid="chart-area-paid"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="free" 
                        stackId="1"
                        stroke="#6b7280" 
                        fill="#6b7280" 
                        name="Free Users"
                        data-testid="chart-area-free"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stackId="2"
                        stroke="#8b5cf6" 
                        fill="transparent" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Total Users"
                        data-testid="chart-area-total"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Conversion Funnel and Plan Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Conversion Funnel */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Conversion Funnel
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics?.conversionFunnel || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === 'count') return value;
                            return `${(value * 100).toFixed(1)}%`;
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          fill="#3b82f6" 
                          name="Count"
                          data-testid="chart-bar-count"
                        >
                          <LabelList 
                            dataKey="percentage" 
                            position="top"
                            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Plan Distribution */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Plan Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analytics?.planDistribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ plan, count }) => `${plan}: ${count}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          data-testid="chart-pie-distribution"
                        >
                          {(analytics?.planDistribution || []).map((entry, index) => {
                            let color = '#6b7280';
                            if (entry.plan.toLowerCase() === 'professional') color = '#f97316';
                            if (entry.plan.toLowerCase() === 'enterprise') color = '#3b82f6';
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Baker Management Tab */}
          <TabsContent value="bakers" className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or business..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-bakers"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bakers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="free">Free Plan</SelectItem>
                    <SelectItem value="paid">Paid Plans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Bakers Table */}
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Baker</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bakersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Loading bakers...
                        </TableCell>
                      </TableRow>
                    ) : filteredBakers && filteredBakers.length > 0 ? (
                      filteredBakers.map((baker) => (
                        <TableRow key={baker.id} data-testid={`baker-row-${baker.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {baker.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {baker.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-gray-900 dark:text-white">
                              {baker.businessName || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                !baker.subscriptionPlan || baker.subscriptionPlan === "starter"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {formatPlanName(baker.subscriptionPlan)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={baker.isActive ? "default" : "destructive"}
                            >
                              {baker.isActive ? "Active" : "Suspended"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(baker.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBaker(baker)}
                                data-testid={`button-view-${baker.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    bakerId: baker.id,
                                    currentStatus: baker.isActive,
                                  })
                                }
                                disabled={toggleStatusMutation.isPending}
                                data-testid={`button-toggle-${baker.id}`}
                              >
                                {baker.isActive ? (
                                  <Ban className="h-4 w-4" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No bakers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscription Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed subscription management features coming soon...
              </p>
            </Card>
          </TabsContent>

          {/* Email Campaigns Tab */}
          <TabsContent value="emails">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Email Campaign Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Email campaign analytics and controls coming soon...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Baker Details Dialog */}
      <Dialog open={!!selectedBaker} onOpenChange={() => setSelectedBaker(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Baker Details</DialogTitle>
            <DialogDescription>
              View and manage baker account information
            </DialogDescription>
          </DialogHeader>
          
          {selectedBaker && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedBaker.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedBaker.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Business Name
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedBaker.businessName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedBaker.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Plan
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatPlanName(selectedBaker.subscriptionPlan)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subscription Status
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {selectedBaker.subscriptionStatus}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Period Ends
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedBaker.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Joined
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedBaker.createdAt)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Change Subscription Plan
                </label>
                <div className="flex gap-2">
                  <Select
                    defaultValue={selectedBaker.subscriptionPlan || "starter"}
                    onValueChange={(plan) =>
                      updatePlanMutation.mutate({ bakerId: selectedBaker.id, plan })
                    }
                    disabled={updatePlanMutation.isPending}
                  >
                    <SelectTrigger data-testid="select-update-plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter (Free)</SelectItem>
                      <SelectItem value="professional">Professional ($19/mo)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ($39/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
