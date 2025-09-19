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
import type { Quote, QuoteTemplate, Customer, QuoteItem, Lead } from '@shared/schema';
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
    terms: '50% deposit required to secure date. Final payment due 7 days before event.',
    subtotal: '0.00',
    taxRate: '0.0875',
    taxAmount: '0.00',
    total: '0.00',
    depositAmount: '0.00'
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

  // Fetch leads (potential customers)
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/bakers', bakerId, 'leads'],
    queryFn: async () => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/bakers/${bakerId}/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    }
  });

  // Convert lead to customer mutation
  const convertLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest(`/api/leads/${leadId}/convert-to-customer`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to convert lead to customer');
      return response.json();
    },
    onSuccess: async (customer, leadId) => {
      // Invalidate specific customer and lead queries
      queryClient.invalidateQueries({ queryKey: ['/api/customers', bakerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'leads'] });
      
      // Get the lead data to access estimate pricing
      const selectedLead = leads.find(lead => lead.id === leadId);
      
      // Pre-populate quote with customer and calculator pricing data
      if (customer && customer.id) {
        const quoteTitleSuffix = selectedLead?.weddingDate 
          ? `Wedding Cake for ${selectedLead.customerName}`
          : `Cake for ${selectedLead.customerName}`;
        
        setNewQuote(prev => ({ 
          ...prev, 
          customerId: customer.id,
          title: quoteTitleSuffix,
          eventDate: selectedLead?.weddingDate || '',
          guestCount: selectedLead?.guestCount || 100,
          eventType: 'wedding',
          customerNotes: selectedLead?.message || '',
        }));
        
        // If lead has calculator estimate, fetch and pre-populate pricing
        if (selectedLead?.estimateId) {
          try {
            const { makeAuthenticatedRequest } = await import('@/lib/csrf');
            const estimateResponse = await makeAuthenticatedRequest(`/api/estimates/${selectedLead.estimateId}`);
            if (estimateResponse.ok) {
              const estimate = await estimateResponse.json();
              
              // Pre-populate quote with calculator pricing AND numeric values
              setNewQuote(prev => ({
                ...prev,
                description: `${estimate.tiers || 1}-tier ${estimate.shape || 'round'} cake, ${estimate.cakeFlavor || 'vanilla'} flavor` +
                            (estimate.filling ? ` with ${estimate.filling} filling` : '') +
                            (estimate.decorations ? `. Decorations: ${Object.keys(estimate.decorations).filter(k => estimate.decorations[k]).join(', ')}` : '') +
                            (estimate.specialRequests ? `. Special requests: ${estimate.specialRequests}` : ''),
                // Pre-populate numeric pricing fields from calculator
                subtotal: estimate.subtotal || '0.00',
                taxAmount: estimate.tax || '0.00',
                total: estimate.total || '0.00',
                taxRate: '0.0875', // Default tax rate
              }));
            }
          } catch (error) {
            console.error('Failed to fetch estimate data:', error);
          }
        }
      }
      
      toast({
        title: "Lead Converted & Quote Pre-filled",
        description: "Lead converted to customer and quote pre-populated with calculator pricing data.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert lead to customer. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return apiRequest('POST', '/api/quotes', quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', bakerId] });
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
        terms: '50% deposit required to secure date. Final payment due 7 days before event.',
        subtotal: '0.00',
        taxRate: '0.0875',
        taxAmount: '0.00',
        total: '0.00',
        depositAmount: '0.00'
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
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', bakerId] });
      toast({
        title: "Quote Updated",
        description: "Your quote has been updated successfully!",
      });
    }
  });

  // Send quote mutation
  const sendQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      return apiRequest('POST', `/api/quotes/${quoteId}/send`);
    },
    onSuccess: (_, quoteId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', bakerId] });
      const quote = quotes.find(q => q.id === quoteId);
      toast({
        title: "Quote Sent!",
        description: `Quote ${quote?.quoteNumber} has been sent to the customer successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive",
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
      // Preserve pre-populated values from lead/template, fallback to defaults
      subtotal: newQuote.subtotal || '0.00',
      taxRate: newQuote.taxRate || '0.0875',
      taxAmount: newQuote.taxAmount || '0.00',
      total: newQuote.total || '0.00',
      depositAmount: newQuote.depositAmount || '0.00',
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

  // Create default template function
  const createDefaultTemplate = (type: 'wedding' | 'birthday' | 'corporate' | 'cupcakes') => {
    const templateData = {
      bakerId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Cake Template`,
      description: getTemplateDescription(type),
      basePrice: getTemplateBasePrice(type),
      pricePerServing: getTemplatePricePerServing(type),
      minimumOrder: getTemplateMinimumOrder(type),
      pricingModel: 'per_serving',
      isActive: true,
      categoryTags: [type, 'cake'],
      flavorOptions: getTemplateFlavors(type),
      sizeOptions: getTemplateSizes(type),
      decorationOptions: getTemplateDecorations(type)
    };

    createTemplateMutation.mutate(templateData);
  };

  const getTemplateDescription = (type: string) => {
    switch (type) {
      case 'wedding': return 'Beautiful multi-tier wedding cakes with elegant decorations and premium flavors';
      case 'birthday': return 'Fun and colorful birthday cakes perfect for any celebration';
      case 'corporate': return 'Professional cakes for corporate events, meetings, and office celebrations';
      case 'cupcakes': return 'Delicious cupcakes perfect for parties, events, or individual treats';
      default: return 'Custom cake template';
    }
  };

  const getTemplateBasePrice = (type: string) => {
    switch (type) {
      case 'wedding': return '300.00';
      case 'birthday': return '75.00';
      case 'corporate': return '150.00';
      case 'cupcakes': return '36.00';
      default: return '100.00';
    }
  };

  const getTemplatePricePerServing = (type: string) => {
    switch (type) {
      case 'wedding': return '8.50';
      case 'birthday': return '4.50';
      case 'corporate': return '5.00';
      case 'cupcakes': return '3.00';
      default: return '5.00';
    }
  };

  const getTemplateMinimumOrder = (type: string) => {
    switch (type) {
      case 'wedding': return '300.00';
      case 'birthday': return '50.00';
      case 'corporate': return '100.00';
      case 'cupcakes': return '24.00';
      default: return '75.00';
    }
  };

  const getTemplateFlavors = (type: string) => {
    const common = ['vanilla', 'chocolate', 'strawberry'];
    switch (type) {
      case 'wedding': return [...common, 'red-velvet', 'lemon', 'carrot', 'funfetti'];
      case 'birthday': return [...common, 'funfetti', 'cookies-and-cream', 'birthday-cake'];
      case 'corporate': return [...common, 'lemon', 'carrot'];
      case 'cupcakes': return [...common, 'red-velvet', 'funfetti', 'lemon', 'chocolate-chip'];
      default: return common;
    }
  };

  const getTemplateSizes = (type: string) => {
    switch (type) {
      case 'wedding': return ['2-tier', '3-tier', '4-tier', '5-tier'];
      case 'birthday': return ['6-inch', '8-inch', '10-inch', '12-inch'];
      case 'corporate': return ['quarter-sheet', 'half-sheet', 'full-sheet'];
      case 'cupcakes': return ['dozen', '2-dozen', '3-dozen', '4-dozen'];
      default: return ['6-inch', '8-inch', '10-inch'];
    }
  };

  const getTemplateDecorations = (type: string) => {
    switch (type) {
      case 'wedding': return ['fresh-flowers', 'buttercream-roses', 'fondant-details', 'gold-accents'];
      case 'birthday': return ['buttercream-decorations', 'sprinkles', 'themed-toppers', 'writing'];
      case 'corporate': return ['logo-decoration', 'simple-borders', 'company-colors'];
      case 'cupcakes': return ['buttercream-swirls', 'sprinkles', 'fondant-toppers', 'themed-decorations'];
      default: return ['buttercream-decorations', 'simple-borders'];
    }
  };

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return apiRequest('POST', '/api/quote-templates', templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates'] });
      toast({
        title: "Template Created",
        description: "Your template has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  });

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  onValueChange={(value) => {
                    if (value.startsWith('lead:')) {
                      // Extract lead ID and convert to customer
                      const leadId = value.substring(5);
                      convertLeadMutation.mutate(leadId);
                    } else {
                      setNewQuote(prev => ({ ...prev, customerId: value }));
                    }
                  }}
                  disabled={customersLoading || leadsLoading || convertLeadMutation.isPending}
                >
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder={
                      customersLoading || leadsLoading 
                        ? "Loading..." 
                        : convertLeadMutation.isPending 
                          ? "Converting lead..." 
                          : "Select customer or convert lead"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                          Existing Customers
                        </div>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {leads.filter(lead => lead.status !== 'converted').length > 0 && (
                      <>
                        {customers.length > 0 && <div className="h-px bg-border mx-2 my-1" />}
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                          Leads (Select to Convert)
                        </div>
                        {leads
                          .filter(lead => lead.status !== 'converted')
                          .map((lead) => (
                            <SelectItem key={lead.id} value={`lead:${lead.id}`}>
                              <div className="flex flex-col">
                                <span className="font-medium">{lead.customerName}</span>
                                <span className="text-xs text-muted-foreground">{lead.customerEmail} • Convert to customer</span>
                              </div>
                            </SelectItem>
                          ))}
                      </>
                    )}
                    
                    {customers.length === 0 && leads.filter(lead => lead.status !== 'converted').length === 0 && (
                      <SelectItem value="no-customers-available" disabled>
                        No customers or leads available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="templateId">Quote Template (Optional)</Label>
                <Select 
                  value={newQuote.templateId} 
                  onValueChange={(value) => {
                    if (value === 'no-template') {
                      setNewQuote(prev => ({ ...prev, templateId: '' }));
                    } else {
                      // Find selected template and pre-populate pricing fields
                      const selectedTemplate = templates.find(t => t.id === value);
                      if (selectedTemplate) {
                        setNewQuote(prev => ({ 
                          ...prev, 
                          templateId: value,
                          title: selectedTemplate.name,
                          description: selectedTemplate.description || '',
                          subtotal: selectedTemplate.basePrice || '0.00',
                          total: selectedTemplate.basePrice || '0.00',
                        }));
                        
                        toast({
                          title: "Template Applied",
                          description: "Template pricing loaded. You can edit all fields before creating the quote.",
                        });
                      } else {
                        setNewQuote(prev => ({ ...prev, templateId: value }));
                      }
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="Choose a template or start from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-template">No template (start from scratch)</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - ${template.basePrice}
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

              {/* Pricing Section */}
              <div className="md:col-span-2 border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Pricing (Editable)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="subtotal">Subtotal</Label>
                    <Input
                      id="subtotal"
                      type="number"
                      step="0.01"
                      value={newQuote.subtotal || '0.00'}
                      onChange={(e) => {
                        const subtotal = parseFloat(e.target.value) || 0;
                        const taxRate = parseFloat(newQuote.taxRate || '0.0875');
                        const tax = subtotal * taxRate;
                        const total = subtotal + tax;
                        
                        setNewQuote(prev => ({ 
                          ...prev, 
                          subtotal: e.target.value,
                          taxAmount: tax.toFixed(2),
                          total: total.toFixed(2)
                        }));
                      }}
                      placeholder="0.00"
                      data-testid="input-subtotal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.001"
                      value={(parseFloat(newQuote.taxRate || '0.0875') * 100).toFixed(3)}
                      onChange={(e) => {
                        const taxRatePercent = parseFloat(e.target.value) || 0;
                        const taxRate = taxRatePercent / 100;
                        const subtotal = parseFloat(newQuote.subtotal || '0');
                        const tax = subtotal * taxRate;
                        const total = subtotal + tax;
                        
                        setNewQuote(prev => ({ 
                          ...prev, 
                          taxRate: taxRate.toFixed(4),
                          taxAmount: tax.toFixed(2),
                          total: total.toFixed(2)
                        }));
                      }}
                      placeholder="8.750"
                      data-testid="input-tax-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      value={newQuote.total || '0.00'}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, total: e.target.value }))}
                      placeholder="0.00"
                      data-testid="input-total"
                      className="font-semibold"
                    />
                  </div>
                </div>
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
                        {quote.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => sendQuoteMutation.mutate(quote.id)}
                            disabled={sendQuoteMutation.isPending}
                            data-testid={`button-send-quote-${quote.id}`}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        )}
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
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create reusable templates to speed up your quote process. Start with your most common cake types and pricing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => createDefaultTemplate('wedding')} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Wedding Cake Template
                  </Button>
                  <Button onClick={() => createDefaultTemplate('birthday')} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Birthday Cake Template
                  </Button>
                  <Button onClick={() => createDefaultTemplate('corporate')} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Corporate Event Template
                  </Button>
                  <Button onClick={() => createDefaultTemplate('cupcakes')} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Cupcakes Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {template.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Template</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${template.basePrice || '0.00'} base price
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {template.tiers?.length || 1} pricing tier{template.tiers?.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        // Use template to create new quote with full pricing pre-population
                        setNewQuote({
                          ...newQuote,
                          templateId: template.id,
                          title: template.name,
                          description: template.description || '',
                          subtotal: template.basePrice || '0.00',
                          total: template.basePrice || '0.00',
                        });
                        setIsCreating(true);
                        toast({
                          title: "Template Applied",
                          description: "Template pricing loaded. You can edit all fields before creating the quote.",
                        });
                      }}>
                        <Plus className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Template Editor",
                          description: "Template editing feature coming soon!",
                        });
                      }}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}