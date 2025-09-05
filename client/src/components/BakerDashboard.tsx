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
  BarChart3
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PortfolioUploader from "./PortfolioUploader";
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
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Baker Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome back, {baker.name}!</p>
        </div>
        <Badge className={`${subscriptionPlan === 'free' ? 'bg-gray-100 text-gray-800' : subscriptionPlan === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'} text-sm font-semibold px-4 py-2`}>
          {subscriptionPlan.toUpperCase()} Plan
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Leads</p>
                <p className="text-3xl font-bold text-blue-900">{leadStats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">New</p>
                <p className="text-3xl font-bold text-amber-900">{leadStats.new}</p>
              </div>
              <Eye className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Quoted</p>
                <p className="text-3xl font-bold text-purple-900">{leadStats.quoted}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Booked</p>
                <p className="text-3xl font-bold text-green-900">{leadStats.booked}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600">Conversion</p>
                <p className="text-3xl font-bold text-rose-900">
                  {leadStats.total > 0 ? Math.round((leadStats.booked / leadStats.total) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList className="bg-white/60 backdrop-blur-sm p-2 rounded-2xl shadow-lg">
          <TabsTrigger value="leads" className="rounded-xl">Lead Management</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-xl">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-white/95">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-foreground">Your Leads</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
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
                          <div className="bg-gray-50 rounded-xl p-4 mt-4">
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

        <TabsContent value="portfolio">
          <PortfolioUploader bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-white/95">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}