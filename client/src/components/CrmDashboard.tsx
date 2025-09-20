import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import type { Customer } from '@shared/schema';

interface CrmDashboardProps {
  bakerId: string;
}

const statusColors = {
  inquiry: 'bg-blue-100 text-blue-800',
  quoted: 'bg-yellow-100 text-yellow-800',
  contracted: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800', 
  low: 'bg-gray-100 text-gray-800',
};

export function CrmDashboard({ bakerId }: CrmDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['/api/customers', bakerId],
    queryFn: () => apiRequest('GET', `/api/customers?bakerId=${bakerId}`).then(r => r.json()),
  });

  // Filter customers based on search and tab
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || customer.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Get customer counts by status
  const statusCounts = customers.reduce((acc: Record<string, number>, customer: Customer) => {
    acc[customer.status || 'inquiry'] = (acc[customer.status || 'inquiry'] || 0) + 1;
    return acc;
  }, {});

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedCustomer(customer)}
      data-testid={`customer-card-${customer.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{customer.name}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <Mail className="h-4 w-4" />
              <span>{customer.email}</span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={statusColors[customer.status as keyof typeof statusColors] || statusColors.inquiry}>
              {customer.status || 'inquiry'}
            </Badge>
            {customer.priority && (
              <Badge variant="outline" className={priorityColors[customer.priority as keyof typeof priorityColors]}>
                {customer.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {customer.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.eventDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(customer.eventDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {customer.eventType && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{customer.eventType === 'wedding' ? '💒' : customer.eventType === 'birthday' ? '🎂' : '🎉'}</span>
                <span className="capitalize">{customer.eventType}</span>
              </div>
            )}
            {customer.guestCount && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{customer.guestCount} guests</span>
              </div>
            )}
          </div>
        </div>
        {customer.tags && customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {customer.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CustomerDetailModal = ({ customer }: { customer: Customer }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="customer-detail-modal">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <Button variant="ghost" onClick={() => setSelectedCustomer(null)} data-testid="close-modal">
              ×
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{customer.phone}</p>
                  </div>
                )}
                {customer.partnerName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Partner</label>
                    <p>{customer.partnerName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={statusColors[customer.status as keyof typeof statusColors] || statusColors.inquiry}>
                    {customer.status || 'inquiry'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p className="capitalize">{customer.source || 'Unknown'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Event Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.eventDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Event Date</label>
                    <p>{new Date(customer.eventDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                  <p className="capitalize">{customer.eventType || 'Not specified'}</p>
                </div>
                {customer.venue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Venue</label>
                    <p>{customer.venue}</p>
                  </div>
                )}
                {customer.guestCount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Guest Count</label>
                    <p>{customer.guestCount} guests</p>
                  </div>
                )}
                {customer.budget && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget</label>
                    <p>{customer.budget}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            {(customer.dietaryRestrictions || customer.preferences) && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Preferences & Dietary Restrictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.dietaryRestrictions && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dietary Restrictions</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(customer.dietaryRestrictions as any).map(([key, value]) => 
                            value ? (
                              <Badge key={key} variant="outline">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </Badge>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                    {customer.preferences && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Preferences</label>
                        <div className="space-y-2 mt-2">
                          {Object.entries(customer.preferences as any).map(([key, values]) => 
                            values && Array.isArray(values) && values.length > 0 ? (
                              <div key={key}>
                                <span className="text-xs font-medium capitalize">{key}:</span>
                                <div className="flex flex-wrap gap-1">
                                  {values.map((value: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <div className="flex space-x-2">
              <Button variant="outline" data-testid="btn-edit-customer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
              <Button variant="outline" data-testid="btn-add-note">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                data-testid="btn-create-quote"
              >
                Create Quote
              </Button>
              <Button variant="outline" data-testid="btn-view-history">
                View History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="crm-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer CRM</h1>
          <p className="text-muted-foreground">
            Manage your customers and track leads through your sales pipeline
          </p>
        </div>
        <Button data-testid="btn-add-customer">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-customers">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="active-inquiries">{statusCounts.inquiry || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="pending-quotes">{statusCounts.quoted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="active-contracts">{statusCounts.contracted || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-customers"
          />
        </div>
        <Button variant="outline" data-testid="btn-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Customer List with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All ({customers.length})</TabsTrigger>
          <TabsTrigger value="inquiry" data-testid="tab-inquiry">Inquiries ({statusCounts.inquiry || 0})</TabsTrigger>
          <TabsTrigger value="quoted" data-testid="tab-quoted">Quoted ({statusCounts.quoted || 0})</TabsTrigger>
          <TabsTrigger value="contracted" data-testid="tab-contracted">Contracted ({statusCounts.contracted || 0})</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed ({statusCounts.completed || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No customers found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first customer'}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" data-testid="btn-add-first-customer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Customer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer: Customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Customer Detail Modal */}
      {selectedCustomer && <CustomerDetailModal customer={selectedCustomer} />}
    </div>
  );
}