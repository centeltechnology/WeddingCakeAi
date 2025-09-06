import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Send, 
  Calculator, 
  Download,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Clock,
  Edit
} from 'lucide-react';
import type { Quote, QuoteTemplate, Customer, QuoteItem } from '@shared/schema';
import jsPDF from 'jspdf';
import { StripeCheckout, QuickPaymentButton } from './StripeCheckout';
import { AdvancedQuoteTemplates } from './AdvancedQuoteTemplates';
import { calculateAdvancedPrice } from '@/lib/advancedCalculator';

interface QuoteBuilderProps {
  bakerId: string;
}

export function QuoteBuilder({ bakerId }: QuoteBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('quotes');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuote, setNewQuote] = useState({
    title: '',
    description: '',
    customerId: '',
    templateId: '',
    eventDate: '',
    eventType: 'wedding',
    guestCount: 100,
    deliveryAddress: '',
    setupTime: '',
    customerNotes: '',
    terms: '50% deposit required to secure date. Final payment due 7 days before event.'
  });

  // Fetch quotes
  const { data: quotes = [], isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ['/api/quotes', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/quotes?bakerId=${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');
      return response.json();
    }
  });

  // Fetch quote templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<QuoteTemplate[]>({
    queryKey: ['/api/quote-templates', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/quote-templates?bakerId=${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers?bakerId=${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    }
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return apiRequest('POST', '/api/quotes', quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Quote Created",
        description: "Your quote has been created successfully!",
      });
      setIsCreating(false);
      setNewQuote({
        title: '',
        description: '',
        customerId: '',
        templateId: '',
        eventDate: '',
        eventType: 'wedding',
        guestCount: 100,
        deliveryAddress: '',
        setupTime: '',
        customerNotes: '',
        terms: '50% deposit required to secure date. Final payment due 7 days before event.'
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update quote mutation
  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest('PUT', `/api/quotes/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Quote Updated",
        description: "Your quote has been updated successfully!",
      });
    }
  });

  const handleCreateQuote = () => {
    if (!newQuote.title || !newQuote.customerId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const quoteData = {
      ...newQuote,
      bakerId,
      quoteNumber: `Q${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
      status: 'draft',
      subtotal: '0.00',
      taxRate: '0.0875',
      taxAmount: '0.00',
      total: '0.00',
      depositAmount: '0.00',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    };

    createQuoteMutation.mutate(quoteData);
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

  const generatePDF = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(24);
    pdf.text('Quote', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Quote #: ${quote.quoteNumber}`, 20, 45);
    pdf.text(`Date: ${new Date(quote.createdAt || '').toLocaleDateString()}`, 20, 55);
    
    if (customer) {
      pdf.text(`Customer: ${customer.name}`, 20, 70);
      pdf.text(`Email: ${customer.email}`, 20, 80);
      if (customer.phone) pdf.text(`Phone: ${customer.phone}`, 20, 90);
    }
    
    // Quote details
    pdf.text(`Title: ${quote.title}`, 20, 110);
    if (quote.description) pdf.text(`Description: ${quote.description}`, 20, 120);
    if (quote.eventDate) pdf.text(`Event Date: ${quote.eventDate}`, 20, 130);
    if (quote.guestCount) pdf.text(`Guest Count: ${quote.guestCount}`, 20, 140);
    
    // Pricing
    const yPos = 160;
    pdf.text(`Subtotal: $${quote.subtotal}`, 20, yPos);
    pdf.text(`Tax: $${quote.taxAmount}`, 20, yPos + 10);
    pdf.text(`Total: $${quote.total}`, 20, yPos + 20);
    if (quote.depositAmount) pdf.text(`Deposit Required: $${quote.depositAmount}`, 20, yPos + 30);
    
    // Terms
    if (quote.terms) {
      pdf.text('Terms & Conditions:', 20, yPos + 50);
      const splitTerms = pdf.splitTextToSize(quote.terms, 170);
      pdf.text(splitTerms, 20, yPos + 60);
    }
    
    pdf.save(`quote-${quote.quoteNumber}.pdf`);
  };

  if (quotesLoading || templatesLoading || customersLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Loading quote builder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Quote Builder</h2>
          <p className="text-muted-foreground">Create and manage professional quotes for your customers</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-quote">
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new quote for your customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Quote Title *</Label>
                <Input
                  id="title"
                  value={newQuote.title}
                  onChange={(e) => setNewQuote(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Wedding Cake for Emily & James"
                  data-testid="input-quote-title"
                />
              </div>
              
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select 
                  value={newQuote.customerId} 
                  onValueChange={(value) => setNewQuote(prev => ({ ...prev, customerId: value }))}
                >
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newQuote.eventDate}
                  onChange={(e) => setNewQuote(prev => ({ ...prev, eventDate: e.target.value }))}
                  data-testid="input-event-date"
                />
              </div>

              <div>
                <Label htmlFor="guestCount">Guest Count</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={newQuote.guestCount}
                  onChange={(e) => setNewQuote(prev => ({ ...prev, guestCount: parseInt(e.target.value) || 0 }))}
                  data-testid="input-guest-count"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newQuote.description}
                  onChange={(e) => setNewQuote(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the cake design and requirements..."
                  data-testid="textarea-description"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Input
                  id="deliveryAddress"
                  value={newQuote.deliveryAddress}
                  onChange={(e) => setNewQuote(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  placeholder="Venue or delivery address"
                  data-testid="input-delivery-address"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateQuote} 
                disabled={createQuoteMutation.isPending}
                data-testid="button-save-quote"
              >
                {createQuoteMutation.isPending ? 'Creating...' : 'Create Quote'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quotes" data-testid="tab-quotes">
            <FileText className="h-4 w-4 mr-2" />
            Quotes ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <Calculator className="h-4 w-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Quotes Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first quote to get started with the quote builder.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Quote
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((quote) => {
                const customer = customers.find(c => c.id === quote.customerId);
                return (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{quote.title}</CardTitle>
                          <CardDescription>
                            {quote.quoteNumber} • {customer?.name || 'Unknown Customer'}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(quote.status || 'draft')}>
                          {(quote.status || 'draft').charAt(0).toUpperCase() + (quote.status || 'draft').slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {quote.eventDate || 'No date set'}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {quote.guestCount || 0} guests
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ${quote.total || '0.00'} total
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedQuote(quote)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => generatePDF(quote)}>
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        {quote.depositAmount && parseFloat(quote.depositAmount) > 0 && (
                          <QuickPaymentButton 
                            quote={quote} 
                            type="deposit"
                            onPaymentComplete={() => {
                              // Refresh quotes after payment
                              queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
                            }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Quote Templates</h3>
              <p className="text-muted-foreground mb-4">
                Create reusable templates to speed up your quote process.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}