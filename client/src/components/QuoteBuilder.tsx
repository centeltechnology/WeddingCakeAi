import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  Download,
  DollarSign,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Plus,
  Minus
} from 'lucide-react';
import jsPDF from 'jspdf';

interface QuoteBuilderProps {
  bakerId: string;
}

interface CakeQuote {
  // Customer Info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  deliveryAddress: string;
  
  // Cake Details
  tiers: CakeTier[];
  flavor: string;
  filling: string;
  frosting: string;
  decorations: string[];
  specialRequests: string;
  
  // Delivery & Setup
  deliveryFee: number;
  setupFee: number;
  
  // Terms
  notes: string;
}

interface CakeTier {
  id: string;
  size: number; // inches
  shape: 'round' | 'square' | 'custom';
  basePrice: number;
}

export function QuoteBuilder({ bakerId }: QuoteBuilderProps) {
  const { toast } = useToast();
  const [quote, setQuote] = useState<CakeQuote>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventDate: '',
    eventType: 'wedding',
    guestCount: 50,
    deliveryAddress: '',
    
    tiers: [
      { id: '1', size: 10, shape: 'round', basePrice: 0 }
    ],
    flavor: '',
    filling: '',
    frosting: '',
    decorations: [],
    specialRequests: '',
    
    deliveryFee: 0,
    setupFee: 0,
    
    notes: ''
  });

  // Fetch baker's pricing configuration
  const { data: pricing } = useQuery({
    queryKey: [`/api/bakers/${bakerId}/pricing`],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/pricing`);
      if (!response.ok) throw new Error('Failed to fetch pricing');
      return response.json();
    }
  });

  // Cake options
  const cakeFlavors = [
    'Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Strawberry', 
    'Carrot', 'Funfetti', 'Coconut', 'Almond', 'Custom'
  ];
  
  const cakeFillings = [
    'Buttercream', 'Chocolate Ganache', 'Fruit Preserves', 'Cream Cheese',
    'Lemon Curd', 'Caramel', 'Raspberry', 'None', 'Custom'
  ];
  
  const frostingOptions = [
    'Buttercream', 'Cream Cheese', 'Swiss Meringue', 'Italian Meringue',
    'Chocolate Ganache', 'Fondant', 'Naked/Semi-Naked', 'Custom'
  ];
  
  const decorationOptions = [
    'Fresh Flowers', 'Sugar Flowers', 'Piped Roses', 'Fondant Decorations',
    'Chocolate Decorations', 'Fruit', 'Gold Leaf', 'Pearls', 'Custom Design'
  ];

  // Add/remove cake tiers
  const addTier = () => {
    const newTier: CakeTier = {
      id: String(Date.now()),
      size: 8,
      shape: 'round',
      basePrice: 0
    };
    setQuote(prev => ({
      ...prev,
      tiers: [...prev.tiers, newTier]
    }));
  };

  const removeTier = (tierId: string) => {
    if (quote.tiers.length > 1) {
      setQuote(prev => ({
        ...prev,
        tiers: prev.tiers.filter(tier => tier.id !== tierId)
      }));
    }
  };

  const updateTier = (tierId: string, updates: Partial<CakeTier>) => {
    setQuote(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === tierId ? { ...tier, ...updates } : tier
      )
    }));
  };

  // Calculate pricing
  const calculateTotalPrice = () => {
    if (!pricing) return 0;

    let total = 0;

    // Calculate cake tiers
    quote.tiers.forEach(tier => {
      const sizeMultiplier = tier.size / 10; // Base price for 10" cake
      const shapeMultiplier = tier.shape === 'square' ? 1.2 : tier.shape === 'custom' ? 1.5 : 1;
      
      // Use base cake price from pricing configuration
      const tierPrice = (pricing.baseCakePrice || 150) * sizeMultiplier * shapeMultiplier;
      total += tierPrice;
    });

    // Add decoration costs
    const decorationCost = quote.decorations.length * (pricing.decorationCost || 25);
    total += decorationCost;

    // Add delivery and setup
    total += quote.deliveryFee + quote.setupFee;

    return total;
  };

  const subtotal = calculateTotalPrice();
  const taxRate = pricing?.taxRate || 0.0875;
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + taxAmount;

  const generatePDF = () => {
    if (!quote.customerName || !quote.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and email before generating PDF.",
        variant: "destructive"
      });
      return;
    }

    const pdf = new jsPDF();
    const quoteNumber = `CQ${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(139, 69, 19); // Saddle brown
    pdf.text('CAKE QUOTE', 20, 30);
    
    // Quote details
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Quote #: ${quoteNumber}`, 20, 45);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Customer info
    pdf.text(`Customer: ${quote.customerName}`, 20, 70);
    pdf.text(`Email: ${quote.customerEmail}`, 20, 80);
    if (quote.customerPhone) pdf.text(`Phone: ${quote.customerPhone}`, 20, 90);
    if (quote.eventDate) pdf.text(`Event Date: ${quote.eventDate}`, 20, 100);
    pdf.text(`Event Type: ${quote.eventType}`, 20, 110);
    pdf.text(`Guest Count: ${quote.guestCount}`, 20, 120);
    
    // Cake details
    let yPos = 140;
    pdf.setFontSize(14);
    pdf.text('CAKE DETAILS', 20, yPos);
    
    pdf.setFontSize(11);
    yPos += 15;
    
    // Tiers
    quote.tiers.forEach((tier, index) => {
      pdf.text(`Tier ${index + 1}: ${tier.size}" ${tier.shape} cake`, 25, yPos);
      yPos += 10;
    });
    
    if (quote.flavor) {
      pdf.text(`Flavor: ${quote.flavor}`, 25, yPos);
      yPos += 10;
    }
    if (quote.filling) {
      pdf.text(`Filling: ${quote.filling}`, 25, yPos);
      yPos += 10;
    }
    if (quote.frosting) {
      pdf.text(`Frosting: ${quote.frosting}`, 25, yPos);
      yPos += 10;
    }
    if (quote.decorations.length > 0) {
      pdf.text(`Decorations: ${quote.decorations.join(', ')}`, 25, yPos);
      yPos += 10;
    }
    
    if (quote.specialRequests) {
      yPos += 5;
      pdf.text('Special Requests:', 25, yPos);
      yPos += 10;
      const splitRequests = pdf.splitTextToSize(quote.specialRequests, 160);
      pdf.text(splitRequests, 25, yPos);
      yPos += splitRequests.length * 5 + 10;
    }
    
    // Pricing
    yPos += 10;
    pdf.setFontSize(14);
    pdf.text('PRICING', 20, yPos);
    
    pdf.setFontSize(11);
    yPos += 15;
    
    pdf.text(`Cake: $${subtotal.toFixed(2)}`, 25, yPos);
    yPos += 10;
    
    if (quote.deliveryFee > 0) {
      pdf.text(`Delivery: $${quote.deliveryFee.toFixed(2)}`, 25, yPos);
      yPos += 10;
    }
    
    if (quote.setupFee > 0) {
      pdf.text(`Setup: $${quote.setupFee.toFixed(2)}`, 25, yPos);
      yPos += 10;
    }
    
    pdf.text(`Tax (${(taxRate * 100).toFixed(1)}%): $${taxAmount.toFixed(2)}`, 25, yPos);
    yPos += 15;
    
    pdf.setFontSize(14);
    pdf.text(`TOTAL: $${finalTotal.toFixed(2)}`, 25, yPos);
    
    // Terms
    yPos += 20;
    pdf.setFontSize(12);
    pdf.text('Terms & Conditions:', 20, yPos);
    yPos += 10;
    
    const terms = [
      '• 50% deposit required to secure booking',
      '• Final payment due 48 hours before delivery',
      '• Changes to design may affect final price',
      '• Delivery within 20 miles included'
    ];
    
    pdf.setFontSize(10);
    terms.forEach(term => {
      pdf.text(term, 25, yPos);
      yPos += 8;
    });
    
    if (quote.notes) {
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text('Additional Notes:', 20, yPos);
      yPos += 8;
      const splitNotes = pdf.splitTextToSize(quote.notes, 170);
      pdf.text(splitNotes, 25, yPos);
    }
    
    pdf.save(`cake-quote-${quoteNumber}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your cake quote has been downloaded as a PDF!",
    });
  };

  const resetForm = () => {
    setQuote({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      eventDate: '',
      eventType: 'wedding',
      guestCount: 50,
      deliveryAddress: '',
      
      tiers: [
        { id: '1', size: 10, shape: 'round', basePrice: 0 }
      ],
      flavor: '',
      filling: '',
      frosting: '',
      decorations: [],
      specialRequests: '',
      
      deliveryFee: 0,
      setupFee: 0,
      
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cake Quote Calculator</h2>
          <p className="text-muted-foreground">Create detailed cake quotes with pricing breakdown</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetForm} data-testid="button-reset">
            Clear Form
          </Button>
          <Button onClick={generatePDF} data-testid="button-generate-pdf">
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quote Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={quote.customerName}
                    onChange={(e) => setQuote(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Jane Smith"
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={quote.customerEmail}
                    onChange={(e) => setQuote(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="jane@example.com"
                    data-testid="input-customer-email"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={quote.customerPhone}
                    onChange={(e) => setQuote(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    data-testid="input-customer-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={quote.eventDate}
                    onChange={(e) => setQuote(prev => ({ ...prev, eventDate: e.target.value }))}
                    data-testid="input-event-date"
                  />
                </div>
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select 
                    value={quote.eventType} 
                    onValueChange={(value) => setQuote(prev => ({ ...prev, eventType: value }))}
                  >
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="guestCount">Guest Count</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={quote.guestCount}
                    onChange={(e) => setQuote(prev => ({ ...prev, guestCount: parseInt(e.target.value) || 0 }))}
                    data-testid="input-guest-count"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="deliveryAddress">Delivery/Venue Address</Label>
                <Input
                  id="deliveryAddress"
                  value={quote.deliveryAddress}
                  onChange={(e) => setQuote(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  placeholder="123 Main St, City, State"
                  data-testid="input-delivery-address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cake Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Cake Design
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addTier}
                  data-testid="button-add-tier"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Cake Tiers */}
              <div className="space-y-4">
                <h4 className="font-semibold">Cake Tiers</h4>
                {quote.tiers.map((tier, index) => (
                  <Card key={tier.id} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Tier {index + 1}</h5>
                        {quote.tiers.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeTier(tier.id)}
                            data-testid={`button-remove-tier-${index}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Size (inches)</Label>
                          <Input
                            type="number"
                            value={tier.size}
                            onChange={(e) => updateTier(tier.id, { size: parseInt(e.target.value) || 8 })}
                            min="4"
                            max="18"
                            data-testid={`input-tier-size-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Shape</Label>
                          <Select 
                            value={tier.shape} 
                            onValueChange={(value: 'round' | 'square' | 'custom') => updateTier(tier.id, { shape: value })}
                          >
                            <SelectTrigger data-testid={`select-tier-shape-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="round">Round</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Flavors & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cake Flavor</Label>
                  <Select 
                    value={quote.flavor} 
                    onValueChange={(value) => setQuote(prev => ({ ...prev, flavor: value }))}
                  >
                    <SelectTrigger data-testid="select-flavor">
                      <SelectValue placeholder="Choose flavor" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeFlavors.map(flavor => (
                        <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Filling</Label>
                  <Select 
                    value={quote.filling} 
                    onValueChange={(value) => setQuote(prev => ({ ...prev, filling: value }))}
                  >
                    <SelectTrigger data-testid="select-filling">
                      <SelectValue placeholder="Choose filling" />
                    </SelectTrigger>
                    <SelectContent>
                      {cakeFillings.map(filling => (
                        <SelectItem key={filling} value={filling}>{filling}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Frosting</Label>
                  <Select 
                    value={quote.frosting} 
                    onValueChange={(value) => setQuote(prev => ({ ...prev, frosting: value }))}
                  >
                    <SelectTrigger data-testid="select-frosting">
                      <SelectValue placeholder="Choose frosting" />
                    </SelectTrigger>
                    <SelectContent>
                      {frostingOptions.map(frosting => (
                        <SelectItem key={frosting} value={frosting}>{frosting}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Decorations</Label>
                  <div className="space-y-2 mt-1 max-h-32 overflow-y-auto">
                    {decorationOptions.map(decoration => (
                      <label key={decoration} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={quote.decorations.includes(decoration)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuote(prev => ({
                                ...prev,
                                decorations: [...prev.decorations, decoration]
                              }));
                            } else {
                              setQuote(prev => ({
                                ...prev,
                                decorations: prev.decorations.filter(d => d !== decoration)
                              }));
                            }
                          }}
                          data-testid={`checkbox-${decoration}`}
                        />
                        <span>{decoration}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={quote.specialRequests}
                  onChange={(e) => setQuote(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any special design requirements, dietary restrictions, or notes..."
                  data-testid="textarea-special-requests"
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery & Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deliveryFee">Delivery Fee</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    value={quote.deliveryFee}
                    onChange={(e) => setQuote(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-delivery-fee"
                  />
                </div>
                <div>
                  <Label htmlFor="setupFee">Setup Fee</Label>
                  <Input
                    id="setupFee"
                    type="number"
                    step="0.01"
                    value={quote.setupFee}
                    onChange={(e) => setQuote(prev => ({ ...prev, setupFee: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-setup-fee"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={quote.notes}
                  onChange={(e) => setQuote(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or terms for this quote..."
                  data-testid="textarea-notes"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Customer Summary */}
              {quote.customerName && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold text-sm">Customer</h4>
                  <p className="text-sm">{quote.customerName}</p>
                  {quote.customerEmail && <p className="text-xs text-muted-foreground">{quote.customerEmail}</p>}
                  {quote.eventDate && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(quote.eventDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Cake Summary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Cake Details</h4>
                <div className="text-sm space-y-1">
                  <p>{quote.tiers.length} tier{quote.tiers.length !== 1 ? 's' : ''}</p>
                  {quote.tiers.map((tier, index) => (
                    <p key={tier.id} className="text-xs text-muted-foreground">
                      • {tier.size}" {tier.shape} cake
                    </p>
                  ))}
                  {quote.flavor && <p className="text-xs">{quote.flavor} flavor</p>}
                  {quote.frosting && <p className="text-xs">{quote.frosting} frosting</p>}
                  {quote.decorations.length > 0 && (
                    <p className="text-xs">{quote.decorations.length} decoration{quote.decorations.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Pricing</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Cake</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {quote.deliveryFee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span>${quote.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {quote.setupFee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Setup</span>
                      <span>${quote.setupFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Deposit (50%)</span>
                    <span>${(finalTotal * 0.5).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={generatePDF} 
                  className="w-full"
                  disabled={!quote.customerName || !quote.customerEmail}
                  data-testid="button-generate-quote-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Quote PDF
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  PDF includes full quote details and pricing breakdown
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}