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
import { DreamCakeDesigner } from './DreamCakeDesigner';
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
  Check,
  Eye,
  Wand2,
  Send
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

// Default fallback values - these will be replaced by dynamic pricing
const DEFAULT_CAKE_SIZES = [
  { size: "6-inch", servings: 12, basePrice: 65 },
  { size: "8-inch", servings: 24, basePrice: 85 },
  { size: "10-inch", servings: 38, basePrice: 115 },
  { size: "12-inch", servings: 56, basePrice: 145 },
  { size: "14-inch", servings: 78, basePrice: 185 }
];

const DEFAULT_CAKE_FLAVORS = [
  { id: "vanilla", name: "Classic Vanilla", premium: false, upcharge: 0 },
  { id: "chocolate", name: "Rich Chocolate", premium: false, upcharge: 0 },
  { id: "strawberry", name: "Fresh Strawberry", premium: false, upcharge: 0 },
  { id: "lemon", name: "Lemon Zest", premium: false, upcharge: 0 },
  { id: "red-velvet", name: "Red Velvet", premium: true, upcharge: 15 },
  { id: "funfetti", name: "Funfetti", premium: false, upcharge: 0 },
  { id: "carrot", name: "Carrot Spice", premium: true, upcharge: 15 },
  { id: "champagne", name: "Champagne", premium: true, upcharge: 15 },
  { id: "salted-caramel", name: "Salted Caramel", premium: true, upcharge: 15 },
  { id: "cookies-cream", name: "Cookies & Cream", premium: true, upcharge: 15 }
];

const DEFAULT_DECORATION_OPTIONS: DecorationOption[] = [
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
  const [showAIDesigner, setShowAIDesigner] = useState(false);
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

  // Fetch dynamic pricing configuration
  const { data: pricingConfig } = useQuery({
    queryKey: [`/api/bakers/${bakerId}/pricing`],
  });

  // Use dynamic pricing or fallback to defaults (memoized for performance)
  const CAKE_SIZES = React.useMemo(() => 
    (pricingConfig as any)?.cakeSizes || DEFAULT_CAKE_SIZES, 
    [pricingConfig]
  );
  
  const CAKE_FLAVORS = React.useMemo(() => 
    (pricingConfig as any)?.flavors?.map((f: any) => ({
      id: f.id,
      name: f.name,
      premium: f.isPremium,
      upcharge: f.upcharge
    })) || DEFAULT_CAKE_FLAVORS, 
    [pricingConfig]
  );
  
  const DECORATION_OPTIONS = React.useMemo(() => 
    (pricingConfig as any)?.decorations?.filter((d: any) => d.isActive) || DEFAULT_DECORATION_OPTIONS, 
    [pricingConfig]
  );
  
  const TAX_RATE = ((pricingConfig as any)?.taxRate || 8.75) / 100;
  const DELIVERY_FEE = (pricingConfig as any)?.deliverySettings?.baseDeliveryFee || 50;

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
            basePrice: updates.size ? CAKE_SIZES.find((s: any) => s.size === updates.size)?.basePrice || tier.basePrice : tier.basePrice,
            servings: updates.size ? CAKE_SIZES.find((s: any) => s.size === updates.size)?.servings || tier.servings : tier.servings
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
      const flavorUpcharge = CAKE_FLAVORS.find((f: any) => f.id === tier.flavor)?.upcharge || 0;
      return sum + sizePrice + flavorUpcharge;
    }, 0);

    const decorations = selectedDecorations.reduce((sum, decorationId) => {
      const decoration = DECORATION_OPTIONS.find((d: any) => d.id === decorationId);
      return sum + (decoration?.price || 0);
    }, 0);

    const delivery = customerInfo.venue ? DELIVERY_FEE : 0;
    const subtotal = baseCake + decorations + delivery;
    const tax = subtotal * TAX_RATE;
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

  // AI Configuration for Dream Cake Designer
  const getAIConfiguration = () => {
    const primaryTier = tiers[0] || { size: "8-inch", flavor: "vanilla" };
    const decorationConfig = {
      fondant: selectedDecorations.includes('fondant-draping'),
      flowers: selectedDecorations.some(d => d.includes('rose') || d.includes('flower') || d.includes('peonies')),
      goldAccents: selectedDecorations.includes('gold-leaf'),
      customTopper: selectedDecorations.some(d => d.includes('topper') || d.includes('monogram'))
    };

    return {
      tiers: tiers.length,
      baseSize: parseInt(primaryTier.size.replace('-inch', '')) || 8,
      shape: "round",
      cakeFlavor: primaryTier.flavor,
      filling: "buttercream",
      decorations: decorationConfig,
      specialRequests: specialRequests
    };
  };

  if (!baker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50 to-pink-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading cake calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-pink-100 ${className || ''}`}>
      {/* Modern Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Cake className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {(baker as any)?.name || 'Loading...'}
                </h1>
                <p className="text-sm text-gray-600 font-medium">AI-Powered Cake Designer</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Button
                onClick={() => setShowAIDesigner(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={tiers.length === 0}
                data-testid="button-ai-visualize"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Visualize My Cake
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {/* Modern Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-8">
                {[
                  { step: 1, title: "Design", icon: Cake, color: "from-blue-500 to-indigo-500" },
                  { step: 2, title: "Decorations", icon: Sparkles, color: "from-purple-500 to-pink-500" },
                  { step: 3, title: "Details", icon: Heart, color: "from-pink-500 to-rose-500" },
                  { step: 4, title: "Complete", icon: Check, color: "from-emerald-500 to-teal-500" }
                ].map(({ step: stepNum, title, icon: Icon, color }, index) => (
                  <div key={stepNum} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        step >= stepNum 
                          ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-110` 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                        {step > stepNum && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className={`text-sm mt-2 font-medium transition-colors ${
                        step >= stepNum ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {title}
                      </p>
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-3 transition-colors ${
                        step > stepNum ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Modern Cake Design */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">Design Your Dream Cake</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Create your perfect cake layer by layer with our intelligent designer
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8 space-y-8">
                {tiers.map((tier, index) => (
                  <div key={tier.id} className="group relative">
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {index === 0 ? "Base Tier" : index === tiers.length - 1 ? "Top Tier" : "Middle Tier"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {index === 0 ? "Foundation layer" : index === tiers.length - 1 ? "Perfect finale" : "Supporting layer"}
                            </p>
                          </div>
                        </div>
                        {tiers.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeTier(tier.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                            data-testid={`button-remove-tier-${tier.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Cake Size</Label>
                          <Select
                            value={tier.size}
                            onValueChange={(size) => updateTier(tier.id, { size })}
                          >
                            <SelectTrigger className="bg-white border-gray-200" data-testid={`select-size-${tier.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CAKE_SIZES.map((size: any) => (
                                <SelectItem key={size.size} value={size.size}>
                                  {size.size} - Serves {size.servings} - ${size.basePrice}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Flavor</Label>
                          <Select
                            value={tier.flavor}
                            onValueChange={(flavor) => updateTier(tier.id, { flavor })}
                          >
                            <SelectTrigger className="bg-white border-gray-200" data-testid={`select-flavor-${tier.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CAKE_FLAVORS.map((flavor: any) => (
                                <SelectItem key={flavor.id} value={flavor.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{flavor.name}</span>
                                    {flavor.upcharge > 0 && (
                                      <Badge variant="secondary" className="ml-2 text-xs">+${flavor.upcharge}</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Serves {tier.servings} people</span>
                          <span className="font-semibold text-blue-600">
                            ${tier.basePrice}
                            {CAKE_FLAVORS.find((f: any) => f.id === tier.flavor)?.upcharge > 0 && (
                              <span className="text-pink-600"> (+${CAKE_FLAVORS.find((f: any) => f.id === tier.flavor)?.upcharge})</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={addTier}
                    disabled={tiers.length >= 4}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600"
                    data-testid="button-add-tier"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Tier
                  </Button>
                  <p className="text-xs text-gray-500">
                    {tiers.length >= 4 ? "Maximum 4 tiers" : "You can add up to 4 tiers"}
                  </p>
                </div>

                {/* Current Pricing */}
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
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

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* AI Visualization Button for Mobile */}
                  <Button
                    onClick={() => setShowAIDesigner(true)}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 md:hidden"
                    disabled={tiers.length === 0}
                    data-testid="button-ai-visualize-mobile"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Visualize My Cake
                  </Button>
                  
                  <Button 
                    onClick={() => setStep(2)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="button-continue-to-decorations"
                  >
                    Continue to Decorations
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Decorations - Keep existing logic but modernize styling */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">Choose Your Decorations</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Add beautiful decorative elements to make your cake truly special
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Decoration Categories */}
                {[
                  { category: 'flowers', title: 'Fresh Flowers', icon: '🌸', color: 'from-pink-500 to-rose-500' },
                  { category: 'design', title: 'Design Elements', icon: '🎨', color: 'from-purple-500 to-pink-500' },
                  { category: 'topper', title: 'Cake Toppers', icon: '👰‍♀️', color: 'from-blue-500 to-indigo-500' },
                  { category: 'extras', title: 'Extra Touches', icon: '✨', color: 'from-emerald-500 to-teal-500' }
                ].map(({ category, title, icon, color }) => (
                  <div key={category}>
                    <div className={`flex items-center mb-4 p-3 bg-gradient-to-r ${color} rounded-xl text-white`}>
                      <span className="text-2xl mr-3">{icon}</span>
                      <h3 className="text-xl font-semibold">{title}</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {DECORATION_OPTIONS
                        .filter((decoration: any) => decoration.category === category)
                        .map((decoration: any) => (
                          <div
                            key={decoration.id}
                            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                              selectedDecorations.includes(decoration.id)
                                ? 'border-pink-400 bg-pink-50 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
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
                <div className="mt-8">
                  <Label className="text-lg font-semibold text-gray-900 mb-3 block">Special Requests or Custom Ideas</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Tell us about any special design ideas, dietary restrictions, or custom requests..."
                    rows={4}
                    className="bg-white border-gray-200 text-base"
                    data-testid="textarea-special-requests"
                  />
                </div>

                {/* Pricing Summary */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-medium">Base Cake</span>
                        <span>${pricing.baseCake.toFixed(2)}</span>
                      </div>
                      {pricing.decorations > 0 && (
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Decorations ({selectedDecorations.length} selected)</span>
                          <span>${pricing.decorations.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-xl">
                        <span>Estimated Subtotal</span>
                        <span className="text-purple-600">${(pricing.baseCake + pricing.decorations).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        *Final pricing may vary based on your specific requirements and will be confirmed in your personalized quote.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <Button 
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    data-testid="button-back-to-design"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Back to Design
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => setShowAIDesigner(true)}
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      disabled={tiers.length === 0}
                      data-testid="button-ai-visualize-step2"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Visualize My Cake
                    </Button>
                    
                    <Button 
                      onClick={() => setStep(3)}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                      data-testid="button-continue-to-details"
                    >
                      Continue to Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customer Information */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">Tell Us About Your Event</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Help us create the perfect quote for your special occasion
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Your Name *</Label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="bg-white border-gray-200"
                      data-testid="input-customer-name"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address *</Label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="your.email@example.com"
                      className="bg-white border-gray-200"
                      data-testid="input-customer-email"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</Label>
                    <Input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      className="bg-white border-gray-200"
                      data-testid="input-customer-phone"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Event Date *</Label>
                    <Input
                      type="date"
                      value={customerInfo.eventDate}
                      onChange={(e) => setCustomerInfo({...customerInfo, eventDate: e.target.value})}
                      className="bg-white border-gray-200"
                      data-testid="input-event-date"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</Label>
                    <Select
                      value={customerInfo.eventType}
                      onValueChange={(eventType) => setCustomerInfo({...customerInfo, eventType})}
                    >
                      <SelectTrigger className="bg-white border-gray-200" data-testid="select-event-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="baby-shower">Baby Shower</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Guest Count</Label>
                    <Input
                      type="number"
                      value={customerInfo.guestCount}
                      onChange={(e) => setCustomerInfo({...customerInfo, guestCount: parseInt(e.target.value) || 0})}
                      placeholder="100"
                      className="bg-white border-gray-200"
                      data-testid="input-guest-count"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Venue Address (for delivery estimates)</Label>
                  <Input
                    value={customerInfo.venue}
                    onChange={(e) => setCustomerInfo({...customerInfo, venue: e.target.value})}
                    placeholder="Enter venue address or leave blank for pickup"
                    className="bg-white border-gray-200"
                    data-testid="input-venue"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Contact Method</Label>
                    <Select
                      value={customerInfo.contactPreference}
                      onValueChange={(contactPreference) => setCustomerInfo({...customerInfo, contactPreference: contactPreference as 'email' | 'phone'})}
                    >
                      <SelectTrigger className="bg-white border-gray-200" data-testid="select-contact-preference">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Timeline</Label>
                    <Select
                      value={customerInfo.timeline}
                      onValueChange={(timeline) => setCustomerInfo({...customerInfo, timeline})}
                    >
                      <SelectTrigger className="bg-white border-gray-200" data-testid="select-timeline">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="urgent">Urgent (within 2 weeks)</SelectItem>
                        <SelectItem value="soon">Soon (2-4 weeks)</SelectItem>
                        <SelectItem value="planning">Planning ahead (1+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Final Summary */}
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Base Cake ({tiers.length} tier{tiers.length !== 1 ? 's' : ''})</span>
                        <span>${pricing.baseCake.toFixed(2)}</span>
                      </div>
                      {pricing.decorations > 0 && (
                        <div className="flex justify-between">
                          <span>Decorations</span>
                          <span>${pricing.decorations.toFixed(2)}</span>
                        </div>
                      )}
                      {pricing.delivery > 0 && (
                        <div className="flex justify-between">
                          <span>Estimated Delivery</span>
                          <span>${pricing.delivery.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax</span>
                        <span>${pricing.tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Estimated Total</span>
                        <span className="text-emerald-600">${pricing.total.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        *This is an estimate. Final pricing will be confirmed in your personalized quote.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <Button 
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    data-testid="button-back-to-decorations"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Back to Decorations
                  </Button>

                  <Button 
                    onClick={handleSubmit}
                    size="lg"
                    disabled={!customerInfo.name || !customerInfo.email || !customerInfo.eventDate || submitQuoteRequest.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    data-testid="button-submit-quote"
                  >
                    {submitQuoteRequest.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Quote Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Quote Request Sent!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for choosing {(baker as any)?.name || 'us'}! We'll review your requirements and get back to you within 24 hours with a personalized quote.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  We'll contact you via {customerInfo.contactPreference} at {customerInfo.contactPreference === 'email' ? customerInfo.email : customerInfo.phone}
                </p>
                <Button 
                  onClick={() => {
                    setStep(1);
                    setTiers([]);
                    setSelectedDecorations([]);
                    setSpecialRequests("");
                    setCustomerInfo({
                      name: "",
                      email: "",
                      phone: "",
                      eventDate: "",
                      eventType: "wedding",
                      guestCount: 100,
                      venue: "",
                      contactPreference: "email",
                      timeline: "flexible"
                    });
                  }}
                  variant="outline"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  data-testid="button-create-another"
                >
                  Create Another Quote
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Dream Cake Designer Modal */}
      <DreamCakeDesigner
        config={getAIConfiguration()}
        isOpen={showAIDesigner}
        onClose={() => setShowAIDesigner(false)}
      />
    </div>
  );
}