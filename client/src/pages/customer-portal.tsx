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
  FileText,
  CreditCard,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  CheckCircle,
  Download,
  Eye,
  LogOut
} from 'lucide-react';
import type { Customer, Quote, Transaction } from '@shared/schema';

interface CustomerPortalProps {
  customerId: string;
}

interface CustomerSession {
  customerId: string;
  name: string;
  email: string;
}

export default function CustomerPortal({ customerId }: CustomerPortalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch customer profile
  const { data: customer, isLoading: customerLoading } = useQuery<Customer>({
    queryKey: [`/api/customers/${customerId}`],
  });

  // Fetch customer quotes
  const { data: quotes = [], isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: [`/api/customers/${customerId}/quotes`],
  });

  // Fetch customer transactions  
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/customers/${customerId}/transactions`],
  });

  const handleLogout = () => {
    // Clear customer session
    localStorage.removeItem('customer_session');
    window.location.href = '/customer-login';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Unable to load customer portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Welcome back, {customer.name}!</h1>
                <p className="text-sm text-muted-foreground">Manage your orders and profile</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">My Quotes</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Event Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <CardTitle className="text-lg">Your Event</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize font-medium">{customer.eventType}</span>
                  </div>
                  {customer.eventDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(customer.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {customer.venue && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium truncate ml-2">{customer.venue}</span>
                    </div>
                  )}
                  {customer.guestCount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{customer.guestCount}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quotes Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Quotes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Quotes:</span>
                      <span className="font-bold">{quotes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved:</span>
                      <span className="font-bold text-green-600">
                        {quotes.filter(q => q.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending:</span>
                      <span className="font-bold text-yellow-600">
                        {quotes.filter(q => q.status && ['sent', 'viewed'].includes(q.status)).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Payments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Paid:</span>
                      <span className="font-bold text-green-600">
                        ${transactions.filter(t => t.status === 'succeeded')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transactions:</span>
                      <span className="font-bold">{transactions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest quotes and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotes.slice(0, 3).map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{quote.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: ${quote.total}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(quote.status || 'draft')}>
                        {quote.status || 'draft'}
                      </Badge>
                    </div>
                  ))}
                  {quotes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No quotes yet. Your baker will send you quotes soon!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Quotes</CardTitle>
                  <CardDescription>View and manage all your quotes</CardDescription>
                </CardHeader>
                <CardContent>
                  {quotesLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">Loading quotes...</p>
                    </div>
                  ) : quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <Card key={quote.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{quote.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Quote #{quote.quoteNumber}
                                </p>
                                {quote.description && (
                                  <p className="text-sm mt-1">{quote.description}</p>
                                )}
                              </div>
                              <Badge className={getStatusColor(quote.status || 'draft')}>
                                {quote.status || 'draft'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {quote.eventDate && (
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{quote.eventDate}</span>
                                </div>
                              )}
                              {quote.guestCount && (
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{quote.guestCount} guests</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">${quote.total}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  Valid until: {quote.validUntil}
                                </span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" data-testid={`button-view-quote-${quote.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-download-quote-${quote.id}`}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                              {quote.status === 'sent' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-approve-quote-${quote.id}`}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Quote
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No quotes yet</h3>
                      <p className="text-muted-foreground">
                        Your baker will send you personalized quotes once they review your requirements.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Track all your payments and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="mt-2 text-muted-foreground">Loading payments...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">
                                ${parseFloat(transaction.amount).toFixed(2)} - {transaction.type}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'} at {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : 'N/A'}
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={getTransactionStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No payments yet</h3>
                      <p className="text-muted-foreground">
                        Your payment history will appear here once you start making payments.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Your personal and event details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.name}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    </div>

                    {customer.phone && (
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    )}

                    {customer.partnerName && (
                      <div className="space-y-2">
                        <Label>Partner Name</Label>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.partnerName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Information about your special event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Event Type</Label>
                      <div className="p-3 border rounded-lg bg-muted/50 capitalize">
                        {customer.eventType}
                      </div>
                    </div>

                    {customer.eventDate && (
                      <div className="space-y-2">
                        <Label>Event Date</Label>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(customer.eventDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {customer.venue && (
                      <div className="space-y-2">
                        <Label>Venue</Label>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.venue}</span>
                        </div>
                      </div>
                    )}

                    {customer.guestCount && (
                      <div className="space-y-2">
                        <Label>Guest Count</Label>
                        <div className="p-3 border rounded-lg bg-muted/50">
                          {customer.guestCount}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences and Dietary Restrictions */}
              {(customer.preferences || customer.dietaryRestrictions) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences & Dietary Requirements</CardTitle>
                    <CardDescription>Your specific preferences and requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customer.dietaryRestrictions && Object.keys(customer.dietaryRestrictions).length > 0 && (
                      <div>
                        <Label className="mb-2 block">Dietary Restrictions</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(customer.dietaryRestrictions).map(([key, value]) => {
                            if (value === true) {
                              return (
                                <Badge key={key} variant="secondary">
                                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </Badge>
                              );
                            }
                            if (key === 'other' && value) {
                              return (
                                <Badge key={key} variant="secondary">
                                  {value}
                                </Badge>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}

                    {customer.preferences && Object.keys(customer.preferences).length > 0 && (
                      <div>
                        <Label className="mb-2 block">Preferences</Label>
                        <div className="space-y-2">
                          {Object.entries(customer.preferences).map(([key, values]) => (
                            values && Array.isArray(values) && values.length > 0 && (
                              <div key={key}>
                                <span className="text-sm font-medium capitalize">{key}: </span>
                                <div className="inline-flex flex-wrap gap-1 mt-1">
                                  {values.map((value, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}