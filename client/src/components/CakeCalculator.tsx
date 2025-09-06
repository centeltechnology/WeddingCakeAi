import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Cake,
  Heart,
  Star,
  Plus,
  Minus,
  Sparkles,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  ChevronRight,
  Check
} from 'lucide-react';

interface CakeCalculatorProps {
  bakerId?: string;
  className?: string;
}

interface CakeTier {
  id: string;
  size: string;
  flavor: string;
  servings: number;
  basePrice: number;
}

interface DecorationOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'flowers' | 'design' | 'topper' | 'extras';
}

interface PricingBreakdown {
  baseCake: number;
  decorations: number;
  delivery: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface QuoteRequest {
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  venue: string;
  cakeDesign: {
    tiers: CakeTier[];
    decorations: string[];
    specialRequests: string;
  };
  pricing: PricingBreakdown;
  contactPreference: 'email' | 'phone';
  timeline: string;
}

const CAKE_SIZES = [
  { size: "6-inch", servings: 12, basePrice: 65 },
  { size: "8-inch", servings: 24, basePrice: 85 },
  { size: "10-inch", servings: 38, basePrice: 115 },
  { size: "12-inch", servings: 56, basePrice: 145 },
  { size: "14-inch", servings: 78, basePrice: 185 }
];

const CAKE_FLAVORS = [
  { id: "vanilla", name: "Classic Vanilla", premium: false },
  { id: "chocolate", name: "Rich Chocolate", premium: false },
  { id: "strawberry", name: "Fresh Strawberry", premium: false },
  { id: "lemon", name: "Lemon Zest", premium: false },
  { id: "red-velvet", name: "Red Velvet", premium: true },
  { id: "funfetti", name: "Funfetti", premium: false },
  { id: "carrot", name: "Carrot Spice", premium: true },
  { id: "champagne", name: "Champagne", premium: true },
  { id: "salted-caramel", name: "Salted Caramel", premium: true },
  { id: "cookies-cream", name: "Cookies & Cream", premium: true }
];

const DECORATION_OPTIONS: DecorationOption[] = [
  // Fresh Flowers
  { id: "fresh-roses", name: "Fresh Roses", description: "Beautiful fresh roses in your choice of colors", price: 45, category: "flowers" },
  { id: "fresh-peonies", name: "Fresh Peonies", description: "Elegant peonies for a romantic touch", price: 65, category: "flowers" },
  { id: "wildflower-mix", name: "Wildflower Bouquet", description: "Charming mix of seasonal wildflowers", price: 35, category: "flowers" },
  { id: "eucalyptus-greenery", name: "Eucalyptus Greenery", description: "Sophisticated eucalyptus and greenery accents", price: 25, category: "flowers" },
  
  // Design Elements
  { id: "buttercream-rosettes", name: "Buttercream Rosettes", description: "Hand-piped buttercream roses", price: 35, category: "design" },
  { id: "fondant-draping", name: "Fondant Draping", description: "Elegant fondant draping and swags", price: 55, category: "design" },
  { id: "sugar-pearls", name: "Edible Pearl Details", description: "Delicate sugar pearls and beading", price: 25, category: "design" },
  { id: "gold-leaf", name: "Gold Leaf Accent", description: "Luxurious edible gold leaf details", price: 85, category: "design" },
  { id: "hand-painted", name: "Hand-Painted Art", description: "Custom hand-painted watercolor design", price: 125, category: "design" },
  
  // Cake Toppers
  { id: "custom-monogram", name: "Custom Monogram", description: "Personalized monogram or initials", price: 45, category: "topper" },
  { id: "bride-groom-figurine", name: "Bride & Groom Figurine", description: "Classic wedding cake topper", price: 55, category: "topper" },
  { id: "fresh-flower-topper", name: "Fresh Flower Crown", description: "Stunning fresh flower arrangement on top", price: 75, category: "topper" },
  { id: "acrylic-topper", name: "Acrylic Name Topper", description: "Modern acrylic with names or date", price: 35, category: "topper" },
  
  // Extra Touches
  { id: "tier-lights", name: "LED Tier Lighting", description: "Subtle LED lights between tiers", price: 65, category: "extras" },
  { id: "cake-stand-rental", name: "Elegant Cake Stand", description: "Beautiful cake stand rental included", price: 35, category: "extras" },
  { id: "cutting-set", name: "Engraved Cutting Set", description: "Personalized cake knife and server", price: 85, category: "extras" },
  { id: "preservation-kit", name: "Top Tier Preservation", description: "Professional preservation of top tier", price: 45, category: "extras" }
];

export function CakeCalculator({ bakerId = "baker-1", className }: CakeCalculatorProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [tiers, setTiers] = useState<CakeTier[]>([]);
  const [selectedDecorations, setSelectedDecorations] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "wedding",
    guestCount: 100,
    venue: "",
    contactPreference: "email" as const,
    timeline: "flexible"
  });

  // Fetch baker information for branding
  const { data: baker } = useQuery({
    queryKey: [`/api/bakers/${bakerId}`],
  });

  // Add initial tier
  useEffect(() => {
    if (tiers.length === 0) {
      addTier();
    }
  }, []);

  const addTier = () => {
    const newTier: CakeTier = {
      id: `tier-${Date.now()}`,
      size: "8-inch",
      flavor: "vanilla",
      servings: 24,
      basePrice: 85
    };
    setTiers([...tiers, newTier]);
  };

  const removeTier = (tierId: string) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter(tier => tier.id !== tierId));
    }
  };

  const updateTier = (tierId: string, updates: Partial<CakeTier>) => {
    setTiers(tiers.map(tier => 
      tier.id === tierId 
        ? { 
            ...tier, 
            ...updates,
            basePrice: updates.size ? CAKE_SIZES.find(s => s.size === updates.size)?.basePrice || tier.basePrice : tier.basePrice,
            servings: updates.size ? CAKE_SIZES.find(s => s.size === updates.size)?.servings || tier.servings : tier.servings
          } 
        : tier
    ));
  };

  const toggleDecoration = (decorationId: string) => {
    setSelectedDecorations(prev => 
      prev.includes(decorationId)
        ? prev.filter(id => id !== decorationId)
        : [...prev, decorationId]
    );
  };

  const calculatePricing = (): PricingBreakdown => {
    const baseCake = tiers.reduce((sum, tier) => {
      const sizePrice = tier.basePrice;
      const flavorUpcharge = CAKE_FLAVORS.find(f => f.id === tier.flavor)?.premium ? 15 : 0;
      return sum + sizePrice + flavorUpcharge;
    }, 0);

    const decorations = selectedDecorations.reduce((sum, decorationId) => {
      const decoration = DECORATION_OPTIONS.find(d => d.id === decorationId);
      return sum + (decoration?.price || 0);
    }, 0);

    const delivery = customerInfo.venue ? 50 : 0;
    const subtotal = baseCake + decorations + delivery;
    const tax = subtotal * 0.0875; // 8.75% tax
    const total = subtotal + tax;

    return { baseCake, decorations, delivery, subtotal, tax, total };
  };

  const submitQuoteRequest = useMutation({
    mutationFn: async (quoteRequest: QuoteRequest) => {
      return await apiRequest("POST", `/api/bakers/${bakerId}/quote-requests`, quoteRequest);
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Sent!",
        description: "We'll get back to you within 24 hours with a personalized quote.",
      });
      setStep(4); // Success step
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an issue sending your quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const pricing = calculatePricing();
    const quoteRequest: QuoteRequest = {
      customerName: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      eventDate: customerInfo.eventDate,
      eventType: customerInfo.eventType,
      guestCount: customerInfo.guestCount,
      venue: customerInfo.venue,
      cakeDesign: {
        tiers,
        decorations: selectedDecorations,
        specialRequests
      },
      pricing,
      contactPreference: customerInfo.contactPreference,
      timeline: customerInfo.timeline
    };

    submitQuoteRequest.mutate(quoteRequest);
  };

  const pricing = calculatePricing();
  const totalServings = tiers.reduce((sum, tier) => sum + tier.servings, 0);

  if (!baker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading cake calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 ${className || ''}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Cake className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{baker.name}</h1>
              <p className="text-sm text-gray-600">Dream Cake Calculator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Design Your Cake", icon: Cake },
              { step: 2, title: "Choose Decorations", icon: Sparkles },
              { step: 3, title: "Your Information", icon: Heart },
              { step: 4, title: "Quote Sent!", icon: Check }
            ].map(({ step: stepNum, title, icon: Icon }) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs mt-2 text-center">{title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Cake Design */}
        {step === 1 && (
          <div className="space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Design Your Dream Cake</CardTitle>
                <CardDescription>
                  Build your perfect cake layer by layer. Choose sizes, flavors, and see real-time pricing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tiers.map((tier, index) => (
                  <div key={tier.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Tier {index + 1} {index === 0 ? "(Bottom)" : index === tiers.length - 1 ? "(Top)" : "(Middle)"}
                      </h3>
                      {tiers.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTier(tier.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-tier-${tier.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Cake Size</Label>
                        <Select
                          value={tier.size}
                          onValueChange={(size) => updateTier(tier.id, { size })}
                        >
                          <SelectTrigger data-testid={`select-size-${tier.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CAKE_SIZES.map((size) => (
                              <SelectItem key={size.size} value={size.size}>
                                {size.size} - Serves {size.servings} - ${size.basePrice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Flavor</Label>
                        <Select
                          value={tier.flavor}
                          onValueChange={(flavor) => updateTier(tier.id, { flavor })}
                        >
                          <SelectTrigger data-testid={`select-flavor-${tier.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CAKE_FLAVORS.map((flavor) => (
                              <SelectItem key={flavor.id} value={flavor.id}>
                                {flavor.name} {flavor.premium && <Badge variant="secondary" className="ml-2">Premium +$15</Badge>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      Serves {tier.servings} people • Base price: ${tier.basePrice}
                      {CAKE_FLAVORS.find(f => f.id === tier.flavor)?.premium && (
                        <span className="text-pink-600"> (+$15 premium flavor)</span>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={addTier}
                    disabled={tiers.length >= 4}
                    data-testid="button-add-tier"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Tier
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    {tiers.length >= 4 ? "Maximum 4 tiers" : "You can add up to 4 tiers"}
                  </p>
                </div>

                {/* Current Pricing */}
                <Card className="bg-pink-50 border-pink-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          Current Cake Total
                        </p>
                        <p className="text-sm text-gray-600">
                          {totalServings} servings • {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-600">
                          ${pricing.baseCake.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Base cake only</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button 
                    onClick={() => setStep(2)}
                    size="lg"
                    className="px-8"
                    data-testid="button-continue-to-decorations"
                  >
                    Continue to Decorations
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Decorations */}
        {step === 2 && (
          <div className="space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose Your Decorations</CardTitle>
                <CardDescription>
                  Add beautiful decorative elements to make your cake truly special.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Decoration Categories */}
                {[
                  { category: 'flowers', title: 'Fresh Flowers', icon: '🌸' },
                  { category: 'design', title: 'Design Elements', icon: '🎨' },
                  { category: 'topper', title: 'Cake Toppers', icon: '👰‍♀️' },
                  { category: 'extras', title: 'Extra Touches', icon: '✨' }
                ].map(({ category, title, icon }) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <span className="mr-2">{icon}</span>
                      {title}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {DECORATION_OPTIONS
                        .filter(decoration => decoration.category === category)
                        .map((decoration) => (
                          <div
                            key={decoration.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedDecorations.includes(decoration.id)
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleDecoration(decoration.id)}
                            data-testid={`decoration-${decoration.id}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{decoration.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{decoration.description}</p>
                              </div>
                              <div className="ml-4 text-right">
                                <div className="text-lg font-bold text-pink-600">
                                  +${decoration.price}
                                </div>
                                {selectedDecorations.includes(decoration.id) && (
                                  <Check className="h-5 w-5 text-pink-500 ml-auto mt-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Special Requests */}
                <div className="mt-6">
                  <Label>Special Requests or Custom Ideas</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Tell us about any special design ideas, dietary restrictions, or custom requests..."
                    rows={3}
                    className="mt-2"
                    data-testid="textarea-special-requests"
                  />
                </div>

                {/* Pricing Summary */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Cake</span>
                        <span>${pricing.baseCake.toFixed(2)}</span>
                      </div>
                      {pricing.decorations > 0 && (
                        <div className="flex justify-between">
                          <span>Decorations ({selectedDecorations.length} selected)</span>
                          <span>${pricing.decorations.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Estimated Subtotal</span>
                        <span className="text-purple-600">${(pricing.baseCake + pricing.decorations).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Final pricing may vary based on your specific requirements
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    data-testid="button-back-to-design"
                  >
                    Back to Design
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    size="lg"
                    data-testid="button-continue-to-info"
                  >
                    Continue to Contact Info
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Customer Information */}
        {step === 3 && (
          <div className="space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Tell Us About Your Event</CardTitle>
                <CardDescription>
                  Help us create the perfect quote for your special day.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Your Name *</Label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Full name"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="your@email.com"
                      data-testid="input-customer-email"
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      data-testid="input-customer-phone"
                    />
                  </div>
                  <div>
                    <Label>Event Date *</Label>
                    <Input
                      type="date"
                      value={customerInfo.eventDate}
                      onChange={(e) => setCustomerInfo({...customerInfo, eventDate: e.target.value})}
                      data-testid="input-event-date"
                    />
                  </div>
                  <div>
                    <Label>Event Type</Label>
                    <Select
                      value={customerInfo.eventType}
                      onValueChange={(eventType) => setCustomerInfo({...customerInfo, eventType})}
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
                        <SelectItem value="other">Other Celebration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expected Guest Count</Label>
                    <Input
                      type="number"
                      value={customerInfo.guestCount}
                      onChange={(e) => setCustomerInfo({...customerInfo, guestCount: parseInt(e.target.value) || 0})}
                      placeholder="Number of guests"
                      data-testid="input-guest-count"
                    />
                  </div>
                </div>

                <div>
                  <Label>Venue Name & Address</Label>
                  <Input
                    value={customerInfo.venue}
                    onChange={(e) => setCustomerInfo({...customerInfo, venue: e.target.value})}
                    placeholder="Venue name and full address for delivery"
                    data-testid="input-venue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Preferred Contact Method</Label>
                    <Select
                      value={customerInfo.contactPreference}
                      onValueChange={(contactPreference: 'email' | 'phone') => 
                        setCustomerInfo({...customerInfo, contactPreference})
                      }
                    >
                      <SelectTrigger data-testid="select-contact-preference">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <Select
                      value={customerInfo.timeline}
                      onValueChange={(timeline) => setCustomerInfo({...customerInfo, timeline})}
                    >
                      <SelectTrigger data-testid="select-timeline">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">ASAP (Rush order)</SelectItem>
                        <SelectItem value="soon">Within 2 weeks</SelectItem>
                        <SelectItem value="month">Within a month</SelectItem>
                        <SelectItem value="flexible">I'm flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Final Pricing Summary */}
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Cake ({totalServings} servings, {tiers.length} tier{tiers.length !== 1 ? 's' : ''})</span>
                        <span>${pricing.baseCake.toFixed(2)}</span>
                      </div>
                      {pricing.decorations > 0 && (
                        <div className="flex justify-between">
                          <span>Decorations ({selectedDecorations.length} items)</span>
                          <span>${pricing.decorations.toFixed(2)}</span>
                        </div>
                      )}
                      {pricing.delivery > 0 && (
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span>${pricing.delivery.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8.75%)</span>
                        <span>${pricing.tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Estimated Total</span>
                        <span className="text-pink-600">${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      * This is an estimated quote. Final pricing will be confirmed after consultation with {baker.name}.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    data-testid="button-back-to-decorations"
                  >
                    Back to Decorations
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    size="lg"
                    disabled={!customerInfo.name || !customerInfo.email || !customerInfo.eventDate || submitQuoteRequest.isPending}
                    data-testid="button-submit-quote-request"
                  >
                    {submitQuoteRequest.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Quote Request
                        <Heart className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="space-y-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Quote Request Sent Successfully!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for choosing {baker.name}! We've received your cake design and will get back to you within 24 hours with a detailed quote.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                  <div className="text-left space-y-2">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm">We'll review your design and requirements</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm">You'll receive a detailed quote via {customerInfo.contactPreference}</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm">Schedule a consultation to finalize your dream cake</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => {
                      setStep(1);
                      setTiers([]);
                      setSelectedDecorations([]);
                      setSpecialRequests("");
                      setCustomerInfo({
                        name: "", email: "", phone: "", eventDate: "", eventType: "wedding",
                        guestCount: 100, venue: "", contactPreference: "email", timeline: "flexible"
                      });
                    }}
                    variant="outline"
                    data-testid="button-create-another-quote"
                  >
                    Create Another Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}