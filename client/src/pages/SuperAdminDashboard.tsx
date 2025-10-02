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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  PieChart,
  Plus,
  Download
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

interface Subscription {
  id: string;
  bakerId: string;
  bakerName: string;
  bakerEmail: string;
  businessName?: string;
  plan: string;
  status: string;
  mrr: number;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
}

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBaker, setSelectedBaker] = useState<Baker | null>(null);
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
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

  // Fetch subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ['/api/super-admin/subscriptions'],
  });

  // Fetch email campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery<{ success: boolean; campaigns: any[] }>({
    queryKey: ['/api/super-admin/campaigns'],
  });
  const campaigns = campaignsData?.campaigns || [];

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

  // Change subscription plan mutation
  const changeSubscriptionPlanMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      return await apiRequest('PATCH', `/api/super-admin/subscriptions/${id}/plan`, { plan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      setSelectedSubscription(null);
      setNewPlan("");
      toast({
        title: "Plan Changed",
        description: "Subscription plan has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change subscription plan.",
        variant: "destructive",
      });
    },
  });

  // Extend trial mutation
  const extendTrialMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/super-admin/subscriptions/${id}/trial`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/subscriptions'] });
      toast({
        title: "Trial Extended",
        description: "Trial period has been extended by 14 days.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to extend trial.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/super-admin/subscriptions/${id}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      setSelectedSubscription(null);
      toast({
        title: "Subscription Canceled",
        description: "Subscription has been canceled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/super-admin/subscriptions/${id}/reactivate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      setSelectedSubscription(null);
      toast({
        title: "Subscription Reactivated",
        description: "Subscription has been reactivated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reactivate subscription.",
        variant: "destructive",
      });
    },
  });

  // Fetch billing history for selected subscription
  const { data: billingHistoryData, isLoading: billingHistoryLoading } = useQuery<{ success: boolean, billing: BillingHistoryItem[] }>({
    queryKey: ['/api/super-admin/subscriptions', selectedSubscription?.id, 'billing'],
    enabled: !!selectedSubscription,
  });
  
  const billingHistory = billingHistoryData?.billing || [];

  // Apply credit mutation
  const applyCreditMutation = useMutation({
    mutationFn: async ({ id, amount, reason }: { id: string; amount: number; reason: string }) => {
      return await apiRequest('POST', `/api/super-admin/subscriptions/${id}/credit`, { amount, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/subscriptions', selectedSubscription?.id, 'billing'] });
      setCreditAmount("");
      setCreditReason("");
      toast({
        title: "Credit Applied",
        description: "Manual credit has been applied successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply credit.",
        variant: "destructive",
      });
    },
  });

  // Impersonate baker mutation
  const impersonateMutation = useMutation({
    mutationFn: async ({ bakerId }: { bakerId: string }) => {
      const res = await apiRequest('POST', `/api/super-admin/impersonate/${bakerId}`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data?.success && data?.token && data?.baker) {
        const currentToken = localStorage.getItem('super_admin_token') || localStorage.getItem('token');
        if (currentToken) {
          localStorage.setItem('admin_token_backup', currentToken);
        }
        localStorage.setItem('baker_token', data.token);
        localStorage.setItem('impersonation_active', JSON.stringify({
          bakerId: data.baker.id,
          bakerName: data.baker.name
        }));
        
        window.open(`/demo/${data.baker.businessName || data.baker.id}`, '_blank');
        
        toast({
          title: "Impersonation Active",
          description: `Now viewing as ${data.baker.name}. New tab opened.`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to impersonate baker.",
        variant: "destructive",
      });
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: { name: string; subject: string; content: string; segmentFilter: any }) => {
      const res = await apiRequest('POST', '/api/super-admin/campaigns', campaign);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/campaigns'] });
      setShowCampaignDialog(false);
      setCampaignName("");
      setCampaignSubject("");
      setCampaignContent("");
      setSelectedPlans([]);
      toast({
        title: "Campaign Created",
        description: "Email campaign has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignName || !campaignSubject || !campaignContent) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      subject: campaignSubject,
      content: campaignContent,
      segmentFilter: {
        plans: selectedPlans.length > 0 ? selectedPlans : undefined
      }
    });
  };

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await apiRequest('POST', `/api/super-admin/campaigns/${campaignId}/send`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/campaigns'] });
      toast({
        title: "Campaign Sent",
        description: `Campaign sent to ${data.recipientCount || 0} recipients.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send campaign.",
        variant: "destructive",
      });
    },
  });

  const handleViewStats = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowStatsDialog(true);
  };

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

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions?.filter((subscription) => {
    const matchesSearch = 
      subscription.bakerName?.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
      subscription.bakerEmail?.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
      subscription.businessName?.toLowerCase().includes(subscriptionSearch.toLowerCase());

    const matchesPlan = 
      planFilter === "all" ||
      subscription.plan === planFilter;

    const matchesStatus = 
      subscriptionStatusFilter === "all" ||
      subscription.status === subscriptionStatusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'past_due':
        return 'destructive';
      case 'canceled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'professional':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'enterprise':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Bakers ({filteredBakers?.length || 0})
              </h3>
              <Button
                onClick={() => {
                  window.location.href = '/api/super-admin/export/bakers';
                }}
                data-testid="button-export-bakers"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
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
          <TabsContent value="subscriptions" className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by baker name or email..."
                    value={subscriptionSearch}
                    onChange={(e) => setSubscriptionSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-subscription-search"
                  />
                </div>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-plan-filter">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subscriptionStatusFilter} onValueChange={setSubscriptionStatusFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Subscriptions Table */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscriptions
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Baker</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>MRR</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Loading subscriptions...
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscriptions && filteredSubscriptions.length > 0 ? (
                      filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id} data-testid={`row-subscription-${subscription.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white" data-testid={`text-baker-name-${subscription.id}`}>
                                {subscription.bakerName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-baker-email-${subscription.id}`}>
                                {subscription.bakerEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPlanBadgeColor(subscription.plan)} data-testid={`badge-plan-${subscription.id}`}>
                              {formatPlanName(subscription.plan)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(subscription.status)} data-testid={`badge-status-${subscription.id}`}>
                              {subscription.status}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-mrr-${subscription.id}`}>
                            {formatCurrency(subscription.mrr)}
                          </TableCell>
                          <TableCell data-testid={`text-period-end-${subscription.id}`}>
                            {formatDate(subscription.currentPeriodEnd)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubscription(subscription)}
                              data-testid={`button-view-details-${subscription.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Email Campaigns Tab */}
          <TabsContent value="emails" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Email Campaigns
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Send targeted email campaigns to your bakers
                </p>
              </div>
              <Button onClick={() => setShowCampaignDialog(true)} data-testid="button-create-campaign">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  Campaign management interface - Create and send targeted emails to segmented baker groups
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Loading campaigns...
                        </TableCell>
                      </TableRow>
                    ) : campaigns.length > 0 ? (
                      campaigns.map((campaign: any) => (
                        <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.subject}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              campaign.status === 'sending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </TableCell>
                          <TableCell>{campaign.stats?.totalRecipients || 0}</TableCell>
                          <TableCell>
                            {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {campaign.stats?.sent > 0 ? (
                              <div className="text-sm">
                                <div>Sent: {campaign.stats.sent}</div>
                                {campaign.stats.opened > 0 && (
                                  <div className="text-gray-500">
                                    Open: {Math.round((campaign.stats.opened / campaign.stats.delivered) * 100)}%
                                  </div>
                                )}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {campaign.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                  disabled={sendCampaignMutation.isPending}
                                  data-testid={`button-send-${campaign.id}`}
                                >
                                  {sendCampaignMutation.isPending ? "Sending..." : "Send"}
                                </Button>
                              )}
                              {campaign.status === 'sent' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewStats(campaign)}
                                  data-testid={`button-stats-${campaign.id}`}
                                >
                                  View Stats
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No campaigns yet. Create your first campaign to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
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

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => impersonateMutation.mutate({ bakerId: selectedBaker.id })}
                  disabled={impersonateMutation.isPending}
                  data-testid="button-impersonate"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {impersonateMutation.isPending ? "Impersonating..." : "Impersonate Baker"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Details Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => { setSelectedSubscription(null); setNewPlan(""); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              View and manage subscription information
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Baker Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Baker Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <p className="text-gray-900 dark:text-white" data-testid="dialog-baker-name">{selectedSubscription.bakerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="text-gray-900 dark:text-white" data-testid="dialog-baker-email">{selectedSubscription.bakerEmail}</p>
                  </div>
                  {selectedSubscription.businessName && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                      <p className="text-gray-900 dark:text-white" data-testid="dialog-business-name">{selectedSubscription.businessName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Information */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Subscription Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan</label>
                    <div className="mt-1">
                      <Badge className={getPlanBadgeColor(selectedSubscription.plan)} data-testid="dialog-current-plan">
                        {formatPlanName(selectedSubscription.plan)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedSubscription.status)} data-testid="dialog-status">
                        {selectedSubscription.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">MRR</label>
                    <p className="text-gray-900 dark:text-white" data-testid="dialog-mrr">{formatCurrency(selectedSubscription.mrr)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period End</label>
                    <p className="text-gray-900 dark:text-white" data-testid="dialog-period-end">{formatDate(selectedSubscription.currentPeriodEnd)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Actions</h4>
                
                {/* Change Plan */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Plan</label>
                  <div className="flex gap-2">
                    <Select value={newPlan} onValueChange={setNewPlan}>
                      <SelectTrigger data-testid="select-new-plan">
                        <SelectValue placeholder="Select new plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        if (newPlan) {
                          changeSubscriptionPlanMutation.mutate({ id: selectedSubscription.id, plan: newPlan });
                        }
                      }}
                      disabled={!newPlan || changeSubscriptionPlanMutation.isPending}
                      data-testid="button-confirm-plan-change"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>

                {/* Other Actions */}
                <div className="flex flex-wrap gap-2">
                  {selectedSubscription.status === 'trialing' && (
                    <Button
                      variant="outline"
                      onClick={() => extendTrialMutation.mutate(selectedSubscription.id)}
                      disabled={extendTrialMutation.isPending}
                      data-testid="button-extend-trial"
                    >
                      Extend Trial (14 days)
                    </Button>
                  )}
                  
                  {(selectedSubscription.status === 'active' || selectedSubscription.status === 'trialing') && (
                    <Button
                      variant="destructive"
                      onClick={() => cancelSubscriptionMutation.mutate(selectedSubscription.id)}
                      disabled={cancelSubscriptionMutation.isPending}
                      data-testid="button-cancel-subscription"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  
                  {selectedSubscription.status === 'canceled' && (
                    <Button
                      variant="default"
                      onClick={() => reactivateSubscriptionMutation.mutate(selectedSubscription.id)}
                      disabled={reactivateSubscriptionMutation.isPending}
                      data-testid="button-reactivate-subscription"
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>

              {/* Manual Credit/Discount Section */}
              <div className="border-t pt-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="credit">
                    <AccordionTrigger className="text-sm font-semibold text-gray-900 dark:text-white">
                      Apply Manual Credit
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Credit Amount
                          </label>
                          <Input
                            type="number"
                            placeholder="$0.00"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            data-testid="input-credit-amount"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Reason
                          </label>
                          <Input
                            type="text"
                            placeholder="Reason for credit..."
                            value={creditReason}
                            onChange={(e) => setCreditReason(e.target.value)}
                            data-testid="input-credit-reason"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            const amount = parseFloat(creditAmount);
                            if (amount > 0 && creditReason.trim()) {
                              applyCreditMutation.mutate({
                                id: selectedSubscription.id,
                                amount,
                                reason: creditReason,
                              });
                            } else {
                              toast({
                                title: "Validation Error",
                                description: "Please enter a valid amount and reason.",
                                variant: "destructive",
                              });
                            }
                          }}
                          disabled={applyCreditMutation.isPending}
                          data-testid="button-apply-credit"
                        >
                          Apply Credit
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Billing History Section */}
              <div className="border-t pt-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="billing">
                    <AccordionTrigger className="text-sm font-semibold text-gray-900 dark:text-white">
                      Billing History
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2">
                        {billingHistoryLoading ? (
                          <p className="text-sm text-gray-500 text-center py-4">Loading billing history...</p>
                        ) : billingHistory && billingHistory.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {billingHistory.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell data-testid={`billing-date-${item.id}`}>
                                    {formatDate(item.date)}
                                  </TableCell>
                                  <TableCell data-testid={`billing-amount-${item.id}`}>
                                    {formatCurrency(item.amount)}
                                  </TableCell>
                                  <TableCell data-testid={`billing-status-${item.id}`}>
                                    <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell data-testid={`billing-description-${item.id}`}>
                                    {item.description}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No billing history</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign to send to your bakers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g., February Product Update"
                data-testid="input-campaign-name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g., New Features Available Now!"
                data-testid="input-campaign-subject"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Email Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={campaignContent}
                onChange={(e) => setCampaignContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Write your email content here..."
                data-testid="textarea-campaign-content"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Target Audience (leave empty for all bakers)
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes('starter')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlans([...selectedPlans, 'starter']);
                      } else {
                        setSelectedPlans(selectedPlans.filter(p => p !== 'starter'));
                      }
                    }}
                    className="mr-2"
                    data-testid="checkbox-plan-starter"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Starter Plan (Free)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes('professional')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlans([...selectedPlans, 'professional']);
                      } else {
                        setSelectedPlans(selectedPlans.filter(p => p !== 'professional'));
                      }
                    }}
                    className="mr-2"
                    data-testid="checkbox-plan-professional"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Professional Plan ($19/mo)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes('enterprise')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlans([...selectedPlans, 'enterprise']);
                      } else {
                        setSelectedPlans(selectedPlans.filter(p => p !== 'enterprise'));
                      }
                    }}
                    className="mr-2"
                    data-testid="checkbox-plan-enterprise"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enterprise Plan ($39/mo)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCampaignDialog(false)}
                data-testid="button-cancel-campaign"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
                data-testid="button-save-campaign"
              >
                {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Campaign Statistics</DialogTitle>
            <DialogDescription>
              View detailed statistics for this email campaign
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Campaign Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCampaign.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Subject
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCampaign.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCampaign.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    selectedCampaign.status === 'sending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    selectedCampaign.status === 'scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Sent At
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCampaign.sentAt ? new Date(selectedCampaign.sentAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Send Statistics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Recipients</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {selectedCampaign.stats?.totalRecipients || 0}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {selectedCampaign.stats?.sent || 0}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {selectedCampaign.stats?.delivered || 0}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {selectedCampaign.stats?.failed || 0}
                    </div>
                  </Card>
                </div>
              </div>

              {selectedCampaign.stats?.opened > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Engagement</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Opened</div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {selectedCampaign.stats?.opened || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedCampaign.stats?.delivered > 0 
                          ? `${Math.round((selectedCampaign.stats.opened / selectedCampaign.stats.delivered) * 100)}% open rate`
                          : '0% open rate'}
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clicked</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {selectedCampaign.stats?.clicked || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedCampaign.stats?.delivered > 0 
                          ? `${Math.round((selectedCampaign.stats.clicked / selectedCampaign.stats.delivered) * 100)}% click rate`
                          : '0% click rate'}
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bounced</div>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                        {selectedCampaign.stats?.bounced || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedCampaign.stats?.sent > 0 
                          ? `${Math.round((selectedCampaign.stats.bounced / selectedCampaign.stats.sent) * 100)}% bounce rate`
                          : '0% bounce rate'}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Email Content</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedCampaign.content}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowStatsDialog(false)} data-testid="button-close-stats">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
