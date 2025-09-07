import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Upload,
  BarChart3,
  FileText,
  CreditCard,
  FileCheck,
  Code,
  Settings,
  Briefcase,
  Monitor,
  UserCog,
  Globe
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PortfolioUploader from "./PortfolioUploader";
import { QuoteBuilder } from "./QuoteBuilder";
import { ContractManager } from "./ContractManager";
import { PaymentManager } from "./PaymentManager";
import { EmbeddableWidget } from "./EmbeddableWidget";
import { PricingManager } from "./PricingManager";
import { AccountSettings } from "./AccountSettings";
import type { Lead, Baker } from "@shared/schema";

interface BakerDashboardProps {
  bakerId: string;
}

export default function BakerDashboard({ bakerId }: BakerDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: baker } = useQuery<Baker>({
    queryKey: ['/api/bakers', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch baker');
      return response.json();
    }
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/bakers', bakerId, 'leads'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) => {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update lead');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'leads'] });
      toast({
        title: "Lead Updated",
        description: "Lead status has been updated successfully!",
      });
    }
  });

  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateLeadMutation.mutate({ leadId, updates: { status: newStatus } });
  };

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'contacted': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'quoted': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'booked': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'declined': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Eye className="w-4 h-4" />;
      case 'contacted': return <MessageSquare className="w-4 h-4" />;
      case 'quoted': return <DollarSign className="w-4 h-4" />;
      case 'booked': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const leadStats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    quoted: leads?.filter(l => l.status === 'quoted').length || 0,
    booked: leads?.filter(l => l.status === 'booked').length || 0,
  };

  const subscriptionPlan = baker?.subscriptionPlan || 'free';
  const planLimits = {
    free: { leads: 3, portfolio: 5 },
    pro: { leads: -1, portfolio: -1 }, // unlimited
    plus: { leads: -1, portfolio: -1 }  // unlimited
  };

  if (!baker) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Baker Dashboard</h1>
            <p className="text-xl text-gray-600">Welcome back, {baker.name}!</p>
          </div>
          <Badge className={`backdrop-blur-sm border-0 text-sm font-semibold px-4 py-2 shadow-lg ${
            subscriptionPlan === 'free' 
              ? 'bg-white/80 text-gray-800' 
              : subscriptionPlan === 'pro' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
          }`}>
            {subscriptionPlan.toUpperCase()} Plan
          </Badge>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Leads</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{leadStats.total}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-full blur-lg"></div>
                <BarChart3 className="w-8 h-8 text-blue-600 relative" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">New</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">{leadStats.new}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-full blur-lg"></div>
                <Eye className="w-8 h-8 text-amber-600 relative" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Quoted</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{leadStats.quoted}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-purple-600/30 rounded-full blur-lg"></div>
                <DollarSign className="w-8 h-8 text-purple-600 relative" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Booked</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">{leadStats.booked}</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-emerald-600/30 rounded-full blur-lg"></div>
                <CheckCircle className="w-8 h-8 text-emerald-600 relative" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600">Conversion</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent">
                  {leadStats.total > 0 ? Math.round((leadStats.booked / leadStats.total) * 100) : 0}%
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/30 to-rose-600/30 rounded-full blur-lg"></div>
                <BarChart3 className="w-8 h-8 text-rose-600 relative" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs - Organized by Category */}
      <Tabs defaultValue="leads" className="space-y-6">
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1">
            <TabsTrigger value="leads" className="flex-col h-20 gap-2 text-xs">
              <Users className="w-5 h-5" />
              <span>Leads</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex-col h-20 gap-2 text-xs">
              <FileText className="w-5 h-5" />
              <span>Quotes</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex-col h-20 gap-2 text-xs">
              <FileCheck className="w-5 h-5" />
              <span>Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-col h-20 gap-2 text-xs">
              <CreditCard className="w-5 h-5" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex-col h-20 gap-2 text-xs">
              <BarChart3 className="w-5 h-5" />
              <span>Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-col h-20 gap-2 text-xs">
              <Upload className="w-5 h-5" />
              <span>Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="widgets" className="flex-col h-20 gap-2 text-xs">
              <Code className="w-5 h-5" />
              <span>Widgets</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-col h-20 gap-2 text-xs">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="domain" className="flex-col h-20 gap-2 text-xs">
              <Globe className="w-5 h-5" />
              <span>Domain</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop Card-based Navigation */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Business Operations */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Business
              </h3>
            </CardHeader>
            <CardContent className="space-y-1">
              <TabsList className="flex-col h-auto bg-transparent p-0 gap-1">
                <TabsTrigger value="leads" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Users className="w-4 h-4 mr-2" />
                  Leads
                </TabsTrigger>
                <TabsTrigger value="quotes" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Quotes
                </TabsTrigger>
                <TabsTrigger value="contracts" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Contracts
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Revenue Management */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Revenue
              </h3>
            </CardHeader>
            <CardContent className="space-y-1">
              <TabsList className="flex-col h-auto bg-transparent p-0 gap-1">
                <TabsTrigger value="payments" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="pricing" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Pricing
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Marketing & Portfolio */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Marketing
              </h3>
            </CardHeader>
            <CardContent className="space-y-1">
              <TabsList className="flex-col h-auto bg-transparent p-0 gap-1">
                <TabsTrigger value="portfolio" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="widgets" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Code className="w-4 h-4 mr-2" />
                  Widgets
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Account & Settings */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <UserCog className="w-4 h-4 mr-2" />
                Account
              </h3>
            </CardHeader>
            <CardContent className="space-y-1">
              <TabsList className="flex-col h-auto bg-transparent p-0 gap-1">
                <TabsTrigger value="account" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="domain" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Globe className="w-4 h-4 mr-2" />
                  Domain
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="leads">
          <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
            <CardHeader className="border-b border-rose-100/50">
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Your Leads</h3>
                
                {/* Desktop: Horizontal layout */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500 shadow-sm"
                      data-testid="input-search-leads"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500 shadow-sm" data-testid="select-status-filter">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile: Stacked layout */}
                <div className="md:hidden space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500 shadow-sm"
                      data-testid="input-search-leads-mobile"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-rose-500 focus:ring-rose-500 shadow-sm" data-testid="select-status-filter-mobile">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {leadsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Loading leads...</p>
                </div>
              ) : filteredLeads.length > 0 ? (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <Card key={lead.id} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {lead.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">{lead.customerName}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {lead.customerEmail}
                                </div>
                                {lead.customerPhone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {lead.customerPhone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(lead.status || 'new')} flex items-center space-x-1 px-3 py-1`}>
                              {getStatusIcon(lead.status || 'new')}
                              <span className="capitalize">{lead.status || 'new'}</span>
                            </Badge>
                            <Select value={lead.status || 'new'} onValueChange={(value) => handleStatusChange(lead.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {lead.weddingDate && (
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{new Date(lead.weddingDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {lead.guestCount && (
                            <div className="flex items-center text-sm">
                              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{lead.guestCount} guests</span>
                            </div>
                          )}
                          {lead.budget && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{lead.budget}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{new Date(lead.createdAt!).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {lead.message && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-4">
                            <p className="text-sm text-foreground">{lead.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No leads yet</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No leads match your current filters.' 
                      : 'New customer inquiries will appear here.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <QuoteBuilder bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="widgets">
          <EmbeddableWidget bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioUploader bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="domain">
          <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
            <CardHeader className="border-b border-rose-100/50">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Domain Settings</h3>
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  Professional Branding
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Subdomain Configuration */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Your Bakewise Subdomain
                    </h4>
                    <p className="text-sm text-blue-600">Create your professional subdomain</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-800">Choose your subdomain:</label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="yourbakery" 
                          className="flex-1"
                          data-testid="input-subdomain"
                        />
                        <span className="text-sm text-gray-600">.bakewise.com</span>
                      </div>
                      <p className="text-xs text-blue-600">This will be your professional URL: yourbakery.bakewise.com</p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-subdomain">
                      Save Subdomain
                    </Button>
                  </CardContent>
                </Card>

                {/* Custom Domain */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader>
                    <h4 className="text-lg font-semibold text-purple-800 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Custom Domain (Pro)
                    </h4>
                    <p className="text-sm text-purple-600">Use your own domain name</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-purple-800">Your domain:</label>
                      <Input 
                        placeholder="yourbakery.com" 
                        className="w-full"
                        data-testid="input-custom-domain"
                      />
                      <p className="text-xs text-purple-600">Point your domain to our servers for professional branding</p>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-save-custom-domain">
                      Configure Custom Domain
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Current Domain Status */}
              <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <h4 className="text-lg font-semibold text-green-800">Current Configuration</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">Active Domain</p>
                        <p className="text-sm text-green-600">hotbunsbakery.bakewise.com</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">SSL Certificate</p>
                        <p className="font-semibold text-green-800">✓ Secured</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">Status</p>
                        <p className="font-semibold text-green-800">✓ Active</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">Propagation</p>
                        <p className="font-semibold text-green-800">✓ Complete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}