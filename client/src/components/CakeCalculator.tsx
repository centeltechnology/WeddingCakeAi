import React, { useState, useEffect, useMemo } from 'react';
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
  tenantSlug?: string;
  className?: string;
}

interface CakeTier {
  id: string;
  size: string;
  shape: string;
  flavor: string;
  servings: number;
  basePrice: number;
  shapeUpcharge: number;
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
  { size: "4-inch", servings: 6, basePrice: 45 },
  { size: "6-inch", servings: 12, basePrice: 65 },
  { size: "8-inch", servings: 24, basePrice: 85 },
  { size: "10-inch", servings: 38, basePrice: 115 },
  { size: "12-inch", servings: 56, basePrice: 145 },
  { size: "14-inch", servings: 78, basePrice: 185 }
];

const CAKE_SHAPES = [
  { id: "round", name: "Round", baseUpcharge: 0 },
  { id: "heart", name: "Heart", baseUpcharge: 15 },
  { id: "square", name: "Square", baseUpcharge: 10 }
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
  { id: "setup-service", name: "Setup Service", description: "Professional cake setup at venue", price: 75, category: "extras" },
  { id: "cutting-set", name: "Engraved Cutting Set", description: "Personalized cake knife and server", price: 85, category: "extras" },
  { id: "preservation-kit", name: "Top Tier Preservation", description: "Professional preservation of top tier", price: 45, category: "extras" }
];

export function CakeCalculator({ bakerId, tenantSlug, className }: CakeCalculatorProps) {
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
    contactPreference: "email" as 'email' | 'phone',
    timeline: "flexible"
  });

  // Fetch baker information for branding - with retry and fallback
  const { data: baker } = useQuery({
    queryKey: [`/api/bakers/${bakerId}`],
    enabled: !!bakerId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dynamic pricing configuration - with retry and fallback
  const { data: pricingConfig } = useQuery({
    queryKey: [`/api/bakers/${bakerId}/pricing`],
    enabled: !!bakerId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use dynamic pricing or fallback to defaults (memoized for performance)
  const CAKE_SIZES = useMemo(() => {
    const dynamicSizes = (pricingConfig as any)?.cakeSizes;
    return (dynamicSizes && dynamicSizes.length > 0) ? dynamicSizes : DEFAULT_CAKE_SIZES;
  }, [pricingConfig]);
  
  const CAKE_FLAVORS = useMemo(() => {
    const dynamicFlavors = (pricingConfig as any)?.flavors;
    if (dynamicFlavors && dynamicFlavors.length > 0) {
      return dynamicFlavors.map((f: any) => ({
        id: f.id,
        name: f.name,
        premium: f.isPremium,
        upcharge: f.upcharge
      }));
    }
    return DEFAULT_CAKE_FLAVORS;
  }, [pricingConfig]);
  
  const DECORATION_OPTIONS = useMemo(() => {
    const dynamicDecorations = (pricingConfig as any)?.decorations?.filter((d: any) => d.isActive);
    return (dynamicDecorations && dynamicDecorations.length > 0) ? dynamicDecorations : DEFAULT_DECORATION_OPTIONS;
  }, [pricingConfig]);
  
  const SHAPE_OPTIONS = useMemo(() => {
    const dynamicShapes = (pricingConfig as any)?.shapes;
    return (dynamicShapes && dynamicShapes.length > 0) ? dynamicShapes : CAKE_SHAPES;
  }, [pricingConfig]);
  
  const TAX_RATE = ((pricingConfig as any)?.taxRate || 8.75) / 100;
  const DELIVERY_FEE = (pricingConfig as any)?.deliverySettings?.baseDeliveryFee || 50;

  // Add initial tier
  useEffect(() => {
    if (tiers.length === 0) {
      addTier();
    }
  }, []);

  const addTier = () => {
    if (tiers.length >= 6) return; // Limit to 6 tiers
    
    const newTier: CakeTier = {
      id: `tier-${Date.now()}`,
      size: "8-inch",
      shape: "round",
      flavor: "vanilla",
      servings: 24,
      basePrice: 85,
      shapeUpcharge: 0
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
            servings: updates.size ? CAKE_SIZES.find((s: any) => s.size === updates.size)?.servings || tier.servings : tier.servings,
            shapeUpcharge: updates.shape ? SHAPE_OPTIONS.find((s: any) => s.id === updates.shape)?.baseUpcharge || tier.shapeUpcharge : tier.shapeUpcharge
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
      const shapeUpcharge = tier.shapeUpcharge || 0;
      return sum + sizePrice + flavorUpcharge + shapeUpcharge;
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
    const decorationConfig = {
      fondant: selectedDecorations.includes('fondant-draping'),
      flowers: selectedDecorations.some(d => d.includes('rose') || d.includes('flower') || d.includes('peonies')),
      goldAccents: selectedDecorations.includes('gold-leaf'),
      customTopper: selectedDecorations.some(d => d.includes('topper') || d.includes('monogram'))
    };

    return {
      tiers: tiers.map(tier => ({
        size: parseInt(tier.size.replace('-inch', '')) || 8,
        shape: tier.shape || "round",
        flavor: tier.flavor || "vanilla"
      })),
      totalTiers: tiers.length,
      decorations: decorationConfig,
      specialRequests: specialRequests
    };
  };

  // Don't block on baker loading - calculator can work with fallback data
  // if (!baker) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50 to-pink-100">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //         <p className="mt-2 text-muted-foreground">Loading cake calculator...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
                  {(baker as any)?.name || 'Wedding Cake Calculator'}
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
                    
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Shape</Label>
                          <Select
                            value={tier.shape || "round"}
                            onValueChange={(shape) => updateTier(tier.id, { shape })}
                          >
                            <SelectTrigger className="bg-white border-gray-200" data-testid={`select-shape-${tier.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SHAPE_OPTIONS.map((shape: any) => (
                                <SelectItem key={shape.id} value={shape.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{shape.name}</span>
                                    {shape.baseUpcharge > 0 && (
                                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">+${shape.baseUpcharge}</Badge>
                                    )}
                                  </div>
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
                            {tier.shapeUpcharge > 0 && (
                              <span className="text-blue-600"> (+${tier.shapeUpcharge} shape)</span>
                            )}
                            {CAKE_FLAVORS.find((f: any) => f.id === tier.flavor)?.upcharge > 0 && (
                              <span className="text-pink-600"> (+${CAKE_FLAVORS.find((f: any) => f.id === tier.flavor)?.upcharge} flavor)</span>
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
                    disabled={tiers.length >= 6}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600"
                    data-testid="button-add-tier"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Tier
                  </Button>
                  <p className="text-xs text-gray-500">
                    {tiers.length >= 6 ? "Maximum 6 tiers" : "You can add up to 6 tiers"}
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
                      onValueChange={(value) => setCustomerInfo({...customerInfo, contactPreference: value as 'email' | 'phone'})}
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
        onIncludeInQuote={(aiConfig, imageUrl) => {
          // Convert AI configuration to quote request for this baker
          const tierSizes = aiConfig.tiers.map(tier => `${tier.size}-inch`).join(', ');
          const flavors = [...new Set(aiConfig.tiers.map(tier => tier.flavor))].join(', ');
          const decorationsList = Object.entries(aiConfig.decorations)
            .filter(([_, enabled]) => enabled)
            .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
            .join(', ');
          
          const message = `AI-Generated Dream Cake Request:
• ${aiConfig.totalTiers} tiers: ${tierSizes}
• Flavors: ${flavors}
• Decorations: ${decorationsList || 'none'}
${aiConfig.specialRequests ? `• Special requests: ${aiConfig.specialRequests}` : ''}
${imageUrl ? `• AI visualization: ${imageUrl}` : ''}

Generated from AI Dream Cake Designer. Please provide a detailed quote for this custom design.`;

          // Pre-fill the quote request with AI cake details
          setCustomerInfo(prev => ({
            ...prev,
            // Keep existing customer info but add AI cake details to notes
          }));
          
          // Add AI cake configuration to special requests
          setSpecialRequests(message);
          
          // Navigate to the quote request step
          setStep(3);
          
          toast({
            title: "AI Cake Added!",
            description: "Your dream cake design has been added to the quote request. Please fill in your contact details.",
          });
        }}
      />

      {/* Social Media Footer */}
      {baker && (baker as any).socialMedia && Object.values((baker as any).socialMedia).some(Boolean) && (
        <div className="mt-12 border-t border-rose-200 pt-8">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-6">
                {(baker as any).socialMedia.instagram && (
                  <a
                    href={`https://instagram.com/${(baker as any).socialMedia.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white p-2 rounded-lg transition-all duration-300"
                    data-testid="link-instagram"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987s11.987-5.367 11.987-11.987C24.003 5.367 18.636.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.326-1.297C4.198 14.553 3.85 13.096 3.85 12c0-1.094.348-2.551 1.273-3.691.878-.807 2.029-1.297 3.326-1.297s2.448.49 3.326 1.297c.925 1.14 1.273 2.597 1.273 3.691 0 1.096-.348 2.553-1.273 3.691-.878.807-2.029 1.297-3.326 1.297zm7.718 0c-1.297 0-2.448-.49-3.326-1.297-.925-1.138-1.273-2.595-1.273-3.691 0-1.094.348-2.551 1.273-3.691.878-.807 2.029-1.297 3.326-1.297s2.448.49 3.326 1.297c.925 1.14 1.273 2.597 1.273 3.691 0 1.096-.348 2.553-1.273 3.691-.878.807-2.029 1.297-3.326 1.297z" clipRule="evenodd"/>
                    </svg>
                  </a>
                )}
                {(baker as any).socialMedia.facebook && (
                  <a
                    href={(() => {
                      let url = (baker as any).socialMedia.facebook;
                      // Remove any existing protocol
                      url = url.replace(/^https?:\/\//, '');
                      // Remove www. if it exists
                      url = url.replace(/^www\./, '');
                      // If it doesn't start with facebook.com, prepend it
                      if (!url.startsWith('facebook.com/')) {
                        url = `facebook.com/${url}`;
                      }
                      return `https://www.${url}`;
                    })()} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all duration-300"
                    data-testid="link-facebook"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {(baker as any).socialMedia.tiktok && (
                  <a
                    href={`https://tiktok.com/@${(baker as any).socialMedia.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:bg-black hover:text-white p-2 rounded-lg transition-all duration-300"
                    data-testid="link-tiktok"
                  >
                    <span className="sr-only">TikTok</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                    </svg>
                  </a>
                )}
                {(baker as any).socialMedia.pinterest && (
                  <a
                    href={(() => {
                      let url = (baker as any).socialMedia.pinterest;
                      // Remove any existing protocol
                      url = url.replace(/^https?:\/\//, '');
                      // Remove www. if it exists
                      url = url.replace(/^www\./, '');
                      // If it doesn't start with pinterest.com, prepend it
                      if (!url.startsWith('pinterest.com/')) {
                        url = `pinterest.com/${url}`;
                      }
                      return `https://www.${url}`;
                    })()} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all duration-300"
                    data-testid="link-pinterest"
                  >
                    <span className="sr-only">Pinterest</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.014C24.007 5.36 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                )}
                {(baker as any).socialMedia.website && (
                  <a
                    href={(baker as any).socialMedia.website.startsWith('http') ? (baker as any).socialMedia.website : `https://${(baker as any).socialMedia.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    data-testid="link-website"
                  >
                    <span className="sr-only">Website</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" clipRule="evenodd"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}