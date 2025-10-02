import React, { useState, useEffect } from "react";
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
  Globe,
  LogOut,
  Menu,
  X,
  Save,
  MapPin,
  Trash2,
  Star,
  Plus,
  Tag,
  Cake,
  Archive,
  Calculator,
  ExternalLink,
  HelpCircle,
  Bell,
  CalendarCheck
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PortfolioUploader from "./PortfolioUploader";
import { QuoteBuilder } from "./QuoteBuilder";
import { QuoteTemplateManager } from "./QuoteTemplateManager";
import { ContractManager } from "./ContractManager";
import { PaymentManager } from "./PaymentManager";
import { BrandingSystem } from "./BrandingSystem";
import { PricingManager } from "./PricingManager";
import { AccountSettings } from "./AccountSettings";
import { CalendarSystem } from "./CalendarSystem";
import { ConsultationsManager } from "./ConsultationsManager";
import BulkEmailLeads from "./BulkEmailLeads";
import LeadsExportButton from "./LeadsExportButton";
import type { Lead, Baker } from "@shared/schema";

interface BakerDashboardProps {
  bakerId: string;
}

export default function BakerDashboard({ bakerId }: BakerDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [cakeTypes, setCakeTypes] = useState<string[]>([]);
  const [newCakeType, setNewCakeType] = useState("");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("leads");

  const handleLogout = () => {
    // Clear authentication tokens using centralized token manager
    import('@/lib/auth').then(({ tokenManager }) => {
      tokenManager.clearToken();
      
      // Redirect to login page
      window.location.href = '/baker-login';
    });
  };

  const { data: baker } = useQuery<Baker>({
    queryKey: ['/api/bakers', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch baker');
      return response.json();
    }
  });

  // Fetch baker domain configuration
  const { data: domainConfig } = useQuery({
    queryKey: ['/api/bakers', bakerId, 'domain'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/domain`);
      if (!response.ok) return { subdomain: null, customDomain: null, isActive: false };
      return response.json();
    }
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/bakers', bakerId, 'leads'],
    queryFn: async () => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/leads/${leadId}`, {
        method: 'PUT',
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

  // Subdomain save mutation
  const saveSubdomainMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}/domain`, {
        method: 'PUT',
        body: JSON.stringify({ subdomain })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save subdomain');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subdomain Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'domain'] });
      setSubdomainInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // About section update mutation
  const updateAboutMutation = useMutation({
    mutationFn: async (description: string) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}`, {
        method: 'PUT',
        body: JSON.stringify({ description })
      });
      if (!response.ok) throw new Error('Failed to update about section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId] });
      toast({
        title: "About Section Updated",
        description: "Your about section has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Specialties update mutation
  const updateSpecialtiesMutation = useMutation({
    mutationFn: async (newSpecialties: string[]) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}`, {
        method: 'PUT',
        body: JSON.stringify({ specialties: newSpecialties })
      });
      if (!response.ok) throw new Error('Failed to update specialties');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId] });
      toast({
        title: "Specialties Updated",
        description: "Your specialties have been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cake types update mutation
  const updateCakeTypesMutation = useMutation({
    mutationFn: async (newCakeTypes: string[]) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}`, {
        method: 'PUT',
        body: JSON.stringify({ cakeTypes: newCakeTypes })
      });
      if (!response.ok) throw new Error('Failed to update cake types');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId] });
      toast({
        title: "Cake Types Updated",
        description: "Your cake types have been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      const updatedSpecialties = [...specialties, newSpecialty.trim()];
      const previousSpecialties = [...specialties]; // Store for rollback
      setSpecialties(updatedSpecialties);
      setNewSpecialty("");
      updateSpecialtiesMutation.mutate(updatedSpecialties, {
        onError: () => {
          // Rollback on error
          setSpecialties(previousSpecialties);
          setNewSpecialty(newSpecialty.trim()); // Restore input
        }
      });
    }
  };

  const removeSpecialty = (specialty: string) => {
    const updatedSpecialties = specialties.filter(s => s !== specialty);
    const previousSpecialties = [...specialties]; // Store for rollback
    setSpecialties(updatedSpecialties);
    updateSpecialtiesMutation.mutate(updatedSpecialties, {
      onError: () => {
        // Rollback on error
        setSpecialties(previousSpecialties);
      }
    });
  };

  const addCakeType = () => {
    if (newCakeType.trim() && !cakeTypes.includes(newCakeType.trim())) {
      const updatedCakeTypes = [...cakeTypes, newCakeType.trim()];
      const previousCakeTypes = [...cakeTypes]; // Store for rollback
      setCakeTypes(updatedCakeTypes);
      setNewCakeType("");
      updateCakeTypesMutation.mutate(updatedCakeTypes, {
        onError: () => {
          // Rollback on error
          setCakeTypes(previousCakeTypes);
          setNewCakeType(newCakeType.trim()); // Restore input
        }
      });
    }
  };

  const removeCakeType = (cakeType: string) => {
    const updatedCakeTypes = cakeTypes.filter(c => c !== cakeType);
    const previousCakeTypes = [...cakeTypes]; // Store for rollback
    setCakeTypes(updatedCakeTypes);
    updateCakeTypesMutation.mutate(updatedCakeTypes, {
      onError: () => {
        // Rollback on error
        setCakeTypes(previousCakeTypes);
      }
    });
  };

  const handleSpecialtyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  const handleCakeTypeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCakeType();
    }
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateLeadMutation.mutate({ leadId, updates: { status: newStatus } });
  };

  const handleSaveSubdomain = async () => {
    if (!subdomainInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a slug for your bakery URL",
        variant: "destructive",
      });
      return;
    }
    
    // Validate slug format (no spaces, URL-safe characters only)
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomainInput) || subdomainInput.includes(' ')) {
      toast({
        title: "Error",
        description: "Invalid slug format. Use only lowercase letters, numbers, and hyphens. No spaces allowed.",
        variant: "destructive",
      });
      return;
    }
    
    saveSubdomainMutation.mutate(subdomainInput);
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

  // Initialize aboutText, specialties, and cakeTypes when baker data loads
  useEffect(() => {
    if (baker?.description) {
      setAboutText(baker.description);
    }
    if (baker?.specialties) {
      setSpecialties(baker.specialties);
    }
    if (baker?.cakeTypes) {
      setCakeTypes(baker.cakeTypes);
    }
  }, [baker?.description, baker?.specialties, baker?.cakeTypes]);

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
      {/* Navigation Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Baker Name */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BakerIQ</h1>
                  <p className="text-sm text-gray-500">
                    {baker?.name || 'Baker Dashboard'}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Badge className={`backdrop-blur-sm border-0 text-sm font-semibold px-4 py-2 shadow-lg ${
                subscriptionPlan === 'free' 
                  ? 'bg-white/80 text-gray-800' 
                  : subscriptionPlan === 'pro' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              }`}>
                {subscriptionPlan.toUpperCase()} Plan
              </Badge>
              
              {/* Notification Indicators */}
              <div className="flex items-center space-x-2">
                {/* New Leads Notification */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-blue-600 relative"
                    data-testid="notification-leads"
                    onClick={() => setActiveTab("leads")}
                  >
                    <Bell className="w-5 h-5" />
                    {leadStats.new > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-blue-500 text-white text-xs flex items-center justify-center">
                        {leadStats.new}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* New Bookings Notification */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-green-600 relative"
                    data-testid="notification-bookings"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <CalendarCheck className="w-5 h-5" />
                    {/* TODO: Add booking count when bookings data is available */}
                  </Button>
                </div>
                
                {/* New Contracts Notification */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-purple-600 relative"
                    data-testid="notification-contracts"
                    onClick={() => setActiveTab("contracts")}
                  >
                    <FileText className="w-5 h-5" />
                    {/* TODO: Add contract count when contracts data is available */}
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  // Always use internal route for now since external subdomains aren't set up
                  const previewUrl = `/baker/${baker?.slug || bakerId}/profile`;
                  window.open(previewUrl, '_blank');
                }}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button
                onClick={() => window.open('/help', '_blank')}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-help"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`backdrop-blur-sm border-0 text-sm font-semibold px-4 py-2 shadow-lg ${
                    subscriptionPlan === 'free' 
                      ? 'bg-white/80 text-gray-800' 
                      : subscriptionPlan === 'pro' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  }`}>
                    {subscriptionPlan.toUpperCase()} Plan
                  </Badge>
                  <Button
                    onClick={() => window.open('/help', '_blank')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                    data-testid="button-help-mobile"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            <TabsTrigger value="leads" className="flex-col h-20 gap-2 text-xs">
              <Users className="w-5 h-5" />
              <span>Leads</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-col h-20 gap-2 text-xs">
              <User className="w-5 h-5" />
              <span>About</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex-col h-20 gap-2 text-xs">
              <FileText className="w-5 h-5" />
              <span>Quotes</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-col h-20 gap-2 text-xs">
              <Cake className="w-5 h-5" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex-col h-20 gap-2 text-xs">
              <FileCheck className="w-5 h-5" />
              <span>Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-col h-20 gap-2 text-xs">
              <Calendar className="w-5 h-5" />
              <span>Bookings</span>
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
            <TabsTrigger value="branding" className="flex-col h-20 gap-2 text-xs">
              <Tag className="w-5 h-5" />
              <span>Branding</span>
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
                <TabsTrigger value="templates" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Cake className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="contracts" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Contracts
                </TabsTrigger>
                <TabsTrigger value="bookings" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bookings
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
                <TabsTrigger value="about" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <User className="w-4 h-4 mr-2" />
                  About
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="branding" className="w-full justify-start rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white hover:bg-rose-50">
                  <Tag className="w-4 h-4 mr-2" />
                  Branding
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

        <TabsContent value="about">
          <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">About Your Business</h3>
              <p className="text-gray-600 mt-2">
                Write a compelling description of your business that will appear on your public page. Tell potential customers about your specialties, experience, and what makes your cakes special.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="about-textarea" className="text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <textarea
                  id="about-textarea"
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Tell customers about your business, specialties, and what makes your cakes unique..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary resize-vertical"
                  data-testid="textarea-about"
                />
                <p className="text-sm text-gray-500">
                  {aboutText.length}/500 characters
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>This will appear on your public profile</span>
                </div>
                <Button
                  onClick={() => updateAboutMutation.mutate(aboutText)}
                  disabled={updateAboutMutation.isPending || aboutText === baker?.description}
                  className="bg-primary hover:from-rose-600 hover:to-pink-600 text-white"
                  data-testid="button-save-about"
                >
                  {updateAboutMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save About
                    </>
                  )}
                </Button>
              </div>
              
              {/* Specialties Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Specialties & Services
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Add specialties like "Wedding Cakes", "Custom Decorations", etc.
                    </p>
                  </div>
                  
                  {/* Add New Specialty */}
                  <div className="flex space-x-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="e.g., Wedding Cakes, Custom Decorations..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSpecialty();
                        }
                      }}
                      data-testid="input-new-specialty"
                    />
                    <Button
                      type="button"
                      onClick={addSpecialty}
                      disabled={!newSpecialty.trim() || updateSpecialtiesMutation.isPending}
                      size="sm"
                      className="bg-rose-500 hover:bg-rose-600 text-white"
                      data-testid="button-add-specialty"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Current Specialties */}
                  {specialties.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`bg-rose-100 text-rose-800 hover:bg-rose-200 flex items-center space-x-1 px-3 py-1 ${
                              updateSpecialtiesMutation.isPending ? 'opacity-50' : ''
                            }`}
                          >
                            <span>{specialty}</span>
                            <button
                              onClick={() => removeSpecialty(specialty)}
                              className="ml-1 hover:text-rose-600"
                              disabled={updateSpecialtiesMutation.isPending}
                              aria-label={`Remove ${specialty} specialty`}
                              data-testid={`button-remove-specialty-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {updateSpecialtiesMutation.isPending && (
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="animate-spin w-3 h-3 border border-gray-300 border-t-rose-500 rounded-full mr-2" />
                          Updating specialties...
                        </div>
                      )}
                    </div>
                  )}
                  
                  {specialties.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No specialties added yet. Add your first specialty above!
                    </div>
                  )}
                </div>
              </div>

              {/* Cake Types Management */}
              <div className="space-y-4 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Cake className="w-4 h-4 mr-2" />
                      Cake Types
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Add cake types like "Layer Cakes", "Cupcakes", "Sheet Cakes", etc.
                    </p>
                  </div>
                  
                  {/* Add New Cake Type */}
                  <div className="flex space-x-2">
                    <Input
                      value={newCakeType}
                      onChange={(e) => setNewCakeType(e.target.value)}
                      placeholder="e.g., Layer Cakes, Cupcakes, Sheet Cakes..."
                      className="flex-1"
                      onKeyPress={handleCakeTypeKeyPress}
                      data-testid="input-new-cake-type"
                    />
                    <Button
                      type="button"
                      onClick={addCakeType}
                      disabled={!newCakeType.trim() || updateCakeTypesMutation.isPending}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      data-testid="button-add-cake-type"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Current Cake Types */}
                  {cakeTypes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {cakeTypes.map((cakeType, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`bg-orange-100 text-orange-800 hover:bg-orange-200 flex items-center space-x-1 px-3 py-1 ${
                              updateCakeTypesMutation.isPending ? 'opacity-50' : ''
                            }`}
                          >
                            <span>{cakeType}</span>
                            <button
                              onClick={() => removeCakeType(cakeType)}
                              className="ml-1 hover:text-orange-600"
                              disabled={updateCakeTypesMutation.isPending}
                              aria-label={`Remove ${cakeType} cake type`}
                              data-testid={`button-remove-cake-type-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {updateCakeTypesMutation.isPending && (
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="animate-spin w-3 h-3 border border-gray-300 border-t-orange-500 rounded-full mr-2" />
                          Updating cake types...
                        </div>
                      )}
                    </div>
                  )}
                  
                  {cakeTypes.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No cake types added yet. Add your first cake type above!
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Section */}
              {aboutText && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-rose-500">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{aboutText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
            <CardHeader className="border-b border-gray-200">
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
                      className="pl-10 w-64 bg-white border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                      data-testid="input-search-leads"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white border-gray-300 focus:border-primary focus:ring-primary shadow-sm" data-testid="select-status-filter">
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
                  <div className="flex-1" />
                  <BulkEmailLeads 
                    bakerId={bakerId} 
                    userPlan={baker?.subscriptionPlan || "starter"}
                  />
                  <LeadsExportButton 
                    bakerId={bakerId}
                    userPlan={baker?.subscriptionPlan || "starter"}
                  />
                </div>

                {/* Mobile: Stacked layout */}
                <div className="md:hidden space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full bg-white border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                      data-testid="input-search-leads-mobile"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:border-primary focus:ring-primary shadow-sm" data-testid="select-status-filter-mobile">
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
                  <div className="flex space-x-2">
                    <BulkEmailLeads 
                      bakerId={bakerId} 
                      userPlan={baker?.subscriptionPlan || "starter"}
                    />
                    <LeadsExportButton 
                      bakerId={bakerId}
                      userPlan={baker?.subscriptionPlan || "starter"}
                    />
                  </div>
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
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedLead(selectedLead === lead.id ? null : lead.id);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              data-testid={`button-view-${lead.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
                                  updateLeadMutation.mutate({ leadId: lead.id, updates: { status: 'archived' } });
                                  toast({
                                    title: "Lead Deleted",
                                    description: "Lead has been permanently deleted",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-${lead.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

                        {/* Enhanced Formatted Lead Details */}
                        {selectedLead === lead.id && (
                          <div className="mt-6 p-6 bg-white dark:from-rose-900/20 dark:via-pink-900/20 dark:to-gray-800 rounded-xl border border-gray-200 shadow-lg">
                            {/* Header with Lead Info */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                  {lead.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h5 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100">{lead.customerName}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">Wedding Cake Inquiry</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Received</div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {new Date(lead.createdAt!).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Contact Information Card */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <Mail className="w-4 h-4 mr-2 text-primary" />
                                  Contact Information
                                </h6>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center">
                                    <span className="w-12 text-gray-500">Email:</span>
                                    <a href={`mailto:${lead.customerEmail}`} className="text-blue-600 hover:text-blue-700 underline">
                                      {lead.customerEmail}
                                    </a>
                                  </div>
                                  {lead.customerPhone && (
                                    <div className="flex items-center">
                                      <span className="w-12 text-gray-500">Phone:</span>
                                      <a href={`tel:${lead.customerPhone}`} className="text-blue-600 hover:text-blue-700 underline">
                                        {lead.customerPhone}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Event Details Card */}
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                                  Event Details
                                </h6>
                                <div className="space-y-2 text-sm">
                                  {lead.weddingDate && (
                                    <div className="flex items-center">
                                      <span className="w-16 text-gray-500">Date:</span>
                                      <span className="font-medium">{new Date(lead.weddingDate).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}</span>
                                    </div>
                                  )}
                                  {lead.guestCount && (
                                    <div className="flex items-center">
                                      <span className="w-16 text-gray-500">Guests:</span>
                                      <span className="font-medium">{lead.guestCount} people</span>
                                    </div>
                                  )}
                                  {lead.budget && (
                                    <div className="flex items-center">
                                      <span className="w-16 text-gray-500">Budget:</span>
                                      <span className="font-medium text-green-600">{lead.budget}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced Rich Text Message Section */}
                            {lead.message && (
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600 mb-6">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                                  Customer Message
                                </h6>
                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
                                  {/* Parse and format the message with rich text */}
                                  <div className="space-y-3">
                                    {lead.message.split('\n\n').map((paragraph, index) => {
                                      // Check if paragraph contains image URLs
                                      const imageUrlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
                                      const linkRegex = /(https?:\/\/[^\s]+)/gi;
                                      
                                      // Split paragraph by image URLs to handle them separately
                                      const parts = paragraph.split(imageUrlRegex);
                                      
                                      return (
                                        <div key={index} className="mb-3">
                                          {parts.map((part, partIndex) => {
                                            // If it's an image URL
                                            if (imageUrlRegex.test(part)) {
                                              return (
                                                <div key={partIndex} className="my-3">
                                                  <div className="inline-block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2">
                                                    <a 
                                                      href={part} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                                                      data-testid={`link-image-${partIndex}`}
                                                    >
                                                      <Eye className="w-4 h-4" />
                                                      <span>View Image</span>
                                                      <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <div className="text-xs text-gray-500 mt-1 break-all">{part}</div>
                                                  </div>
                                                </div>
                                              );
                                            }
                                            // If it's a regular URL
                                            else if (linkRegex.test(part)) {
                                              return (
                                                <a 
                                                  key={partIndex}
                                                  href={part} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:text-blue-700 underline inline-flex items-center space-x-1"
                                                >
                                                  <span>{part}</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              );
                                            }
                                            // Regular text with enhanced formatting
                                            else {
                                              return (
                                                <span key={partIndex} className="inline">
                                                  {part.split('\n').map((line, lineIndex) => (
                                                    <span key={lineIndex}>
                                                      {lineIndex > 0 && <br />}
                                                      {/* Bold text detection */}
                                                      {line.includes('**') ? 
                                                        line.split('**').map((segment, segIndex) => 
                                                          segIndex % 2 === 1 ? 
                                                            <strong key={segIndex} className="font-semibold text-gray-800 dark:text-gray-200">{segment}</strong> : 
                                                            segment
                                                        ) : line
                                                      }
                                                    </span>
                                                  ))}
                                                </span>
                                              );
                                            }
                                          })}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Message metadata */}
                                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between text-xs text-gray-500">
                                    <span>💬 Customer inquiry</span>
                                    <span>{lead.message.length} characters</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Calculator Details if available */}
                            {lead.estimateId && (
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600 mb-6">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <Calculator className="w-4 h-4 mr-2 text-primary" />
                                  Calculator Estimate
                                </h6>
                                <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                  This lead includes a calculator estimate. Click "Create Quote" to view and edit the pricing details.
                                </div>
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <Button
                                onClick={() => {
                                  // Navigate to quotes with this lead pre-selected for conversion
                                  setActiveTab('quotes');
                                  setSelectedLead(null);
                                  toast({
                                    title: "Quote Creation Ready",
                                    description: "Navigate to Quotes section and convert this lead to create a customized quote.",
                                  });
                                }}
                                className="bg-primary hover:from-rose-600 hover:to-pink-600 text-white shadow-lg"
                                data-testid={`button-create-quote-${lead.id}`}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Create Quote
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // Open email client or consultation booking
                                  const subject = encodeURIComponent(`Consultation Request - ${lead.customerName} Wedding Cake`);
                                  const body = encodeURIComponent(`Hi ${lead.customerName},\n\nI'd love to schedule a consultation to discuss your wedding cake requirements in more detail.\n\nWhen would be a good time for you?\n\nBest regards,\n${baker?.name || 'Your Baker'}`);
                                  window.open(`mailto:${lead.customerEmail}?subject=${subject}&body=${body}`);
                                  
                                  toast({
                                    title: "Email Client Opened",
                                    description: "Consultation request email template has been prepared.",
                                  });
                                }}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                data-testid={`button-request-consultation-${lead.id}`}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Request Consultation
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => {
                                  updateLeadMutation.mutate({
                                    leadId: lead.id!,
                                    updates: { status: 'contacted' }
                                  });
                                  toast({
                                    title: "Lead Status Updated",
                                    description: "Lead marked as contacted.",
                                  });
                                }}
                                disabled={updateLeadMutation.isPending}
                                className="border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700"
                                data-testid={`button-mark-contacted-${lead.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Contacted
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to archive this lead? It will be moved to your archived leads.')) {
                                    updateLeadMutation.mutate({
                                      leadId: lead.id!,
                                      updates: { status: 'archived' }
                                    });
                                    setSelectedLead(null);
                                    toast({
                                      title: "Lead Archived",
                                      description: "Lead has been moved to archives.",
                                    });
                                  }
                                }}
                                disabled={updateLeadMutation.isPending}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                data-testid={`button-archive-${lead.id}`}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </Button>
                            </div>
                          </div>
                        )}

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

        <TabsContent value="templates">
          <QuoteTemplateManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="bookings">
          <div className="space-y-6">
            <ConsultationsManager bakerId={bakerId} />
            <CalendarSystem bakerId={bakerId} isOwner={true} />
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingSystem tenantId={bakerId} />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioUploader bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="domain">
          <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Domain Settings</h3>
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  Professional Branding
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* URL Slug Configuration */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 max-w-2xl">
                <CardHeader>
                  <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Your BakerIQ URL
                  </h4>
                  <p className="text-sm text-blue-600">Create your professional bakery URL</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">Choose your URL slug (no spaces):</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">bakeriq.app/baker/</span>
                      <Input 
                        placeholder="yourbakery" 
                        className="flex-1"
                        value={subdomainInput}
                        onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        data-testid="input-subdomain"
                      />
                    </div>
                    <p className="text-xs text-blue-600">Your professional URL: bakeriq.app/baker/{subdomainInput || 'yourbakery'}</p>
                    <p className="text-xs text-orange-600 font-medium">⚠️ Use only lowercase letters, numbers, and hyphens. No spaces allowed!</p>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={handleSaveSubdomain}
                    disabled={saveSubdomainMutation.isPending}
                    data-testid="button-save-subdomain"
                  >
                    {saveSubdomainMutation.isPending ? "Saving..." : "Save URL Slug"}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Domain Status */}
              <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <h4 className="text-lg font-semibold text-green-800">Current Configuration</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">Active URL</p>
                        <p className="text-sm text-green-600">
                          {domainConfig?.customDomain || 
                           (domainConfig?.subdomain ? `bakeriq.app/baker/${domainConfig.subdomain}/calculator` : 
                            'No URL configured')}
                        </p>
                      </div>
                      <Badge className={domainConfig?.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {domainConfig?.isActive ? 'Active' : 'Not Configured'}
                      </Badge>
                    </div>
                    {domainConfig?.isActive && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-sm text-green-600">SSL Certificate</p>
                          <p className="font-semibold text-green-800">
                            {domainConfig?.sslStatus === 'secured' ? '✓ Secured' : '⏳ Pending'}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-sm text-green-600">Status</p>
                          <p className="font-semibold text-green-800">
                            {domainConfig?.isActive ? '✓ Active' : '⏳ Pending'}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-sm text-green-600">Propagation</p>
                          <p className="font-semibold text-green-800">
                            {domainConfig?.propagationStatus === 'complete' ? '✓ Complete' : '⏳ In Progress'}
                          </p>
                        </div>
                      </div>
                    )}
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