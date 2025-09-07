import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  DollarSign,
  Save,
  RotateCcw,
  Eye,
  Calculator,
  TrendingUp,
  Settings,
  Cake,
  Sparkles,
  Percent,
  MapPin,
  Heart
} from 'lucide-react';

interface PricingManagerProps {
  bakerId: string;
  className?: string;
}

interface CakeSizePricing {
  size: string;
  servings: number;
  basePrice: number;
  costToMake: number;
  profitMargin: number;
}

interface FlavorPricing {
  id: string;
  name: string;
  upcharge: number;
  isPremium: boolean;
}

interface ShapePricing {
  id: string;
  name: string;
  baseUpcharge: number;
  costToMake: number;
  profitMargin: number;
}

interface DecorationPricing {
  id: string;
  name: string;
  description: string;
  price: number;
  costToMake: number;
  category: string;
  isActive: boolean;
}

interface BakerPricingConfig {
  id?: string;
  bakerId: string;
  cakeSizes: CakeSizePricing[];
  shapes?: ShapePricing[];
  flavors: FlavorPricing[];
  decorations: DecorationPricing[];
  taxRate: number;
  deliverySettings: {
    baseDeliveryFee: number;
    freeDeliveryMinimum: number;
    deliveryRadius: number;
    perMileRate: number;
  };
  profitSettings: {
    defaultMargin: number;
    minimumMargin: number;
    laborRate: number;
  };
  lastUpdated?: string;
}

const DEFAULT_CAKE_SIZES: CakeSizePricing[] = [
  { size: "6-inch", servings: 12, basePrice: 65, costToMake: 25, profitMargin: 62 },
  { size: "8-inch", servings: 24, basePrice: 85, costToMake: 35, profitMargin: 59 },
  { size: "10-inch", servings: 38, basePrice: 115, costToMake: 50, profitMargin: 57 },
  { size: "12-inch", servings: 56, basePrice: 145, costToMake: 70, profitMargin: 52 },
  { size: "14-inch", servings: 78, basePrice: 185, costToMake: 95, profitMargin: 49 }
];

const DEFAULT_FLAVORS: FlavorPricing[] = [
  { id: "vanilla", name: "Classic Vanilla", upcharge: 0, isPremium: false },
  { id: "chocolate", name: "Rich Chocolate", upcharge: 0, isPremium: false },
  { id: "strawberry", name: "Fresh Strawberry", upcharge: 0, isPremium: false },
  { id: "lemon", name: "Lemon Zest", upcharge: 0, isPremium: false },
  { id: "red-velvet", name: "Red Velvet", upcharge: 15, isPremium: true },
  { id: "funfetti", name: "Funfetti", upcharge: 5, isPremium: false },
  { id: "carrot", name: "Carrot Spice", upcharge: 18, isPremium: true },
  { id: "champagne", name: "Champagne", upcharge: 25, isPremium: true },
  { id: "salted-caramel", name: "Salted Caramel", upcharge: 22, isPremium: true },
  { id: "cookies-cream", name: "Cookies & Cream", upcharge: 12, isPremium: true }
];

const DEFAULT_DECORATIONS: DecorationPricing[] = [
  { id: "fresh-roses", name: "Fresh Roses", description: "Beautiful fresh roses", price: 45, costToMake: 20, category: "flowers", isActive: true },
  { id: "fresh-peonies", name: "Fresh Peonies", description: "Elegant peonies", price: 65, costToMake: 30, category: "flowers", isActive: true },
  { id: "buttercream-rosettes", name: "Buttercream Rosettes", description: "Hand-piped roses", price: 35, costToMake: 15, category: "design", isActive: true },
  { id: "fondant-draping", name: "Fondant Draping", description: "Elegant draping", price: 55, costToMake: 25, category: "design", isActive: true },
  { id: "gold-leaf", name: "Gold Leaf Accent", description: "Edible gold leaf", price: 85, costToMake: 45, category: "design", isActive: true },
  { id: "custom-monogram", name: "Custom Monogram", description: "Personalized monogram", price: 45, costToMake: 15, category: "topper", isActive: true }
];

export function PricingManager({ bakerId, className }: PricingManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('cakes');
  const [hasChanges, setHasChanges] = useState(false);
  const [pricing, setPricing] = useState<BakerPricingConfig>({
    bakerId,
    cakeSizes: DEFAULT_CAKE_SIZES,
    flavors: DEFAULT_FLAVORS,
    decorations: DEFAULT_DECORATIONS,
    taxRate: 8.75,
    deliverySettings: {
      baseDeliveryFee: 50,
      freeDeliveryMinimum: 200,
      deliveryRadius: 25,
      perMileRate: 2.50
    },
    profitSettings: {
      defaultMargin: 55,
      minimumMargin: 35,
      laborRate: 25
    }
  });

  // Fetch current pricing configuration
  const { data: existingPricing, isLoading } = useQuery<BakerPricingConfig>({
    queryKey: [`/api/bakers/${bakerId}/pricing`],
    onSuccess: (data) => {
      if (data) {
        setPricing(data);
      }
    }
  });

  // Save pricing configuration
  const savePricingMutation = useMutation({
    mutationFn: async (pricingConfig: BakerPricingConfig) => {
      return await apiRequest("PUT", `/api/bakers/${bakerId}/pricing`, pricingConfig);
    },
    onSuccess: () => {
      toast({
        title: "Pricing Updated!",
        description: "Your pricing configuration has been saved successfully.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries([`/api/bakers/${bakerId}/pricing`]);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "There was an error saving your pricing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCakeSize = (index: number, updates: Partial<CakeSizePricing>) => {
    const newSizes = [...pricing.cakeSizes];
    newSizes[index] = { ...newSizes[index], ...updates };
    
    // Auto-calculate profit margin if price or cost changes
    if (updates.basePrice || updates.costToMake) {
      const price = updates.basePrice || newSizes[index].basePrice;
      const cost = updates.costToMake || newSizes[index].costToMake;
      newSizes[index].profitMargin = Math.round(((price - cost) / price) * 100);
    }
    
    setPricing({ ...pricing, cakeSizes: newSizes });
    setHasChanges(true);
  };

  const updateFlavor = (index: number, updates: Partial<FlavorPricing>) => {
    const newFlavors = [...pricing.flavors];
    newFlavors[index] = { ...newFlavors[index], ...updates };
    setPricing({ ...pricing, flavors: newFlavors });
    setHasChanges(true);
  };

  const updateShape = (index: number, updates: Partial<ShapePricing>) => {
    const newShapes = [...(pricing.shapes || [])];
    newShapes[index] = { ...newShapes[index], ...updates };
    
    // Auto-calculate profit margin if upcharge or cost changes
    if (updates.baseUpcharge !== undefined || updates.costToMake !== undefined) {
      const upcharge = updates.baseUpcharge !== undefined ? updates.baseUpcharge : newShapes[index].baseUpcharge;
      const cost = updates.costToMake !== undefined ? updates.costToMake : newShapes[index].costToMake;
      newShapes[index].profitMargin = upcharge > 0 ? Math.round(((upcharge - cost) / upcharge) * 100) : 0;
    }
    
    setPricing({ ...pricing, shapes: newShapes });
    setHasChanges(true);
  };

  const updateDecoration = (index: number, updates: Partial<DecorationPricing>) => {
    const newDecorations = [...pricing.decorations];
    newDecorations[index] = { ...newDecorations[index], ...updates };
    
    // Auto-calculate profit margin
    if (updates.price || updates.costToMake) {
      const price = updates.price || newDecorations[index].price;
      const cost = updates.costToMake || newDecorations[index].costToMake;
      // Could add profit margin calculation for decorations too
    }
    
    setPricing({ ...pricing, decorations: newDecorations });
    setHasChanges(true);
  };

  const handleSave = () => {
    savePricingMutation.mutate(pricing);
  };

  const resetToDefaults = () => {
    setPricing({
      ...pricing,
      cakeSizes: DEFAULT_CAKE_SIZES,
      flavors: DEFAULT_FLAVORS,
      decorations: DEFAULT_DECORATIONS
    });
    setHasChanges(true);
    toast({
      title: "Reset to Defaults",
      description: "Pricing has been reset to default values. Remember to save your changes.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading pricing settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header with Save Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pricing Management</h2>
          <p className="text-sm text-muted-foreground">
            Customize your cake calculator pricing to match your business model
          </p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            data-testid="button-reset-pricing"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open(`/baker/${bakerId}/calculator`, '_blank')}
            data-testid="button-preview-calculator"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Calculator
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || savePricingMutation.isPending}
            data-testid="button-save-pricing"
          >
            {savePricingMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="cakes" data-testid="tab-cake-pricing">
            <Cake className="h-4 w-4 mr-2" />
            Cake Sizes
          </TabsTrigger>
          <TabsTrigger value="shapes" data-testid="tab-shapes-pricing">
            <Heart className="h-4 w-4 mr-2" />
            Shapes
          </TabsTrigger>
          <TabsTrigger value="flavors" data-testid="tab-flavor-pricing">
            <Sparkles className="h-4 w-4 mr-2" />
            Flavors
          </TabsTrigger>
          <TabsTrigger value="decorations" data-testid="tab-decoration-pricing">
            <Settings className="h-4 w-4 mr-2" />
            Decorations
          </TabsTrigger>
          <TabsTrigger value="delivery" data-testid="tab-delivery-pricing">
            <MapPin className="h-4 w-4 mr-2" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="profit" data-testid="tab-profit-settings">
            <TrendingUp className="h-4 w-4 mr-2" />
            Profit
          </TabsTrigger>
        </TabsList>

        {/* Cake Sizes Tab */}
        <TabsContent value="cakes">
          <Card>
            <CardHeader>
              <CardTitle>Cake Size Pricing</CardTitle>
              <CardDescription>
                Set your base prices for each cake size. Profit margins are calculated automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>Size</div>
                  <div>Servings</div>
                  <div>Your Price</div>
                  <div>Cost to Make</div>
                  <div>Profit</div>
                  <div>Margin</div>
                </div>
                {pricing.cakeSizes.map((size, index) => (
                  <div key={size.size} className="grid grid-cols-6 gap-4 items-center">
                    <div className="font-medium">{size.size}</div>
                    <div className="text-muted-foreground">{size.servings}</div>
                    <div>
                      <Input
                        type="number"
                        value={size.basePrice}
                        onChange={(e) => updateCakeSize(index, { basePrice: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                        data-testid={`input-cake-price-${size.size}`}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={size.costToMake}
                        onChange={(e) => updateCakeSize(index, { costToMake: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                        data-testid={`input-cake-cost-${size.size}`}
                      />
                    </div>
                    <div className="text-green-600 font-medium">
                      ${(size.basePrice - size.costToMake).toFixed(2)}
                    </div>
                    <div>
                      <Badge 
                        variant={size.profitMargin >= 50 ? "default" : size.profitMargin >= 30 ? "secondary" : "destructive"}
                      >
                        {size.profitMargin}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shapes Tab */}
        <TabsContent value="shapes">
          <Card>
            <CardHeader>
              <CardTitle>Shape Pricing</CardTitle>
              <CardDescription>
                Set upcharges for different cake shapes. Round is typically the base shape.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>Shape Name</div>
                  <div>Upcharge</div>
                  <div>Cost to Make</div>
                  <div>Profit</div>
                  <div>Margin</div>
                </div>
                {(pricing.shapes || []).map((shape, index) => (
                  <div key={shape.id} className="grid grid-cols-5 gap-4 items-center">
                    <div className="font-medium">{shape.name}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">$</span>
                      <Input
                        type="number"
                        value={shape.baseUpcharge}
                        onChange={(e) => updateShape(index, { baseUpcharge: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                        data-testid={`input-shape-upcharge-${shape.id}`}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">$</span>
                      <Input
                        type="number"
                        value={shape.costToMake}
                        onChange={(e) => updateShape(index, { costToMake: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                        data-testid={`input-shape-cost-${shape.id}`}
                      />
                    </div>
                    <div className="text-green-600 font-medium">
                      ${(shape.baseUpcharge - shape.costToMake).toFixed(2)}
                    </div>
                    <div>
                      <Badge 
                        variant={shape.profitMargin >= 50 ? "default" : shape.profitMargin >= 30 ? "secondary" : "destructive"}
                      >
                        {shape.profitMargin}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flavors Tab */}
        <TabsContent value="flavors">
          <Card>
            <CardHeader>
              <CardTitle>Flavor Pricing</CardTitle>
              <CardDescription>
                Set upcharges for premium flavors and specialty ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>Flavor Name</div>
                  <div>Type</div>
                  <div>Upcharge</div>
                  <div>Per Tier</div>
                </div>
                {pricing.flavors.map((flavor, index) => (
                  <div key={flavor.id} className="grid grid-cols-4 gap-4 items-center">
                    <div className="font-medium">{flavor.name}</div>
                    <div>
                      <Badge variant={flavor.isPremium ? "default" : "secondary"}>
                        {flavor.isPremium ? "Premium" : "Standard"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">$</span>
                      <Input
                        type="number"
                        value={flavor.upcharge}
                        onChange={(e) => updateFlavor(index, { upcharge: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                        data-testid={`input-flavor-upcharge-${flavor.id}`}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {flavor.upcharge > 0 ? `+$${flavor.upcharge} per tier` : "No charge"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decorations Tab */}
        <TabsContent value="decorations">
          <Card>
            <CardHeader>
              <CardTitle>Decoration Pricing</CardTitle>
              <CardDescription>
                Customize pricing for decorative elements and add-ons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['flowers', 'design', 'topper', 'extras'].map(category => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                    <div className="space-y-3">
                      {pricing.decorations
                        .filter(decoration => decoration.category === category)
                        .map((decoration, globalIndex) => {
                          const index = pricing.decorations.findIndex(d => d.id === decoration.id);
                          return (
                            <div key={decoration.id} className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{decoration.name}</p>
                                <p className="text-sm text-muted-foreground">{decoration.description}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Your Price</Label>
                                <Input
                                  type="number"
                                  value={decoration.price}
                                  onChange={(e) => updateDecoration(index, { price: parseFloat(e.target.value) || 0 })}
                                  className="w-20 mt-1"
                                  data-testid={`input-decoration-price-${decoration.id}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Cost</Label>
                                <Input
                                  type="number"
                                  value={decoration.costToMake}
                                  onChange={(e) => updateDecoration(index, { costToMake: parseFloat(e.target.value) || 0 })}
                                  className="w-20 mt-1"
                                  data-testid={`input-decoration-cost-${decoration.id}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Profit</Label>
                                <div className="text-green-600 font-medium mt-1">
                                  ${(decoration.price - decoration.costToMake).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Status</Label>
                                <div className="mt-1">
                                  <Badge variant={decoration.isActive ? "default" : "secondary"}>
                                    {decoration.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>
                Configure your delivery fees and service area.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Base Delivery Fee</Label>
                  <Input
                    type="number"
                    value={pricing.deliverySettings.baseDeliveryFee}
                    onChange={(e) => setPricing({
                      ...pricing,
                      deliverySettings: {
                        ...pricing.deliverySettings,
                        baseDeliveryFee: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-base-delivery-fee"
                  />
                </div>
                <div>
                  <Label>Free Delivery Minimum</Label>
                  <Input
                    type="number"
                    value={pricing.deliverySettings.freeDeliveryMinimum}
                    onChange={(e) => setPricing({
                      ...pricing,
                      deliverySettings: {
                        ...pricing.deliverySettings,
                        freeDeliveryMinimum: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-free-delivery-minimum"
                  />
                </div>
                <div>
                  <Label>Service Radius (miles)</Label>
                  <Input
                    type="number"
                    value={pricing.deliverySettings.deliveryRadius}
                    onChange={(e) => setPricing({
                      ...pricing,
                      deliverySettings: {
                        ...pricing.deliverySettings,
                        deliveryRadius: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-delivery-radius"
                  />
                </div>
                <div>
                  <Label>Per Mile Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.deliverySettings.perMileRate}
                    onChange={(e) => setPricing({
                      ...pricing,
                      deliverySettings: {
                        ...pricing.deliverySettings,
                        perMileRate: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-per-mile-rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Settings Tab */}
        <TabsContent value="profit">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Business Settings</CardTitle>
              <CardDescription>
                Configure your business parameters and tax settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.taxRate}
                    onChange={(e) => {
                      setPricing({ ...pricing, taxRate: parseFloat(e.target.value) || 0 });
                      setHasChanges(true);
                    }}
                    data-testid="input-tax-rate"
                  />
                </div>
                <div>
                  <Label>Default Profit Margin (%)</Label>
                  <Input
                    type="number"
                    value={pricing.profitSettings.defaultMargin}
                    onChange={(e) => setPricing({
                      ...pricing,
                      profitSettings: {
                        ...pricing.profitSettings,
                        defaultMargin: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-default-margin"
                  />
                </div>
                <div>
                  <Label>Minimum Profit Margin (%)</Label>
                  <Input
                    type="number"
                    value={pricing.profitSettings.minimumMargin}
                    onChange={(e) => setPricing({
                      ...pricing,
                      profitSettings: {
                        ...pricing.profitSettings,
                        minimumMargin: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-minimum-margin"
                  />
                </div>
                <div>
                  <Label>Labor Rate (per hour)</Label>
                  <Input
                    type="number"
                    value={pricing.profitSettings.laborRate}
                    onChange={(e) => setPricing({
                      ...pricing,
                      profitSettings: {
                        ...pricing.profitSettings,
                        laborRate: parseFloat(e.target.value) || 0
                      }
                    })}
                    data-testid="input-labor-rate"
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Average Cake Margin:</span>
                    <span className="font-medium ml-2">
                      {Math.round(pricing.cakeSizes.reduce((sum, size) => sum + size.profitMargin, 0) / pricing.cakeSizes.length)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tax Rate:</span>
                    <span className="font-medium ml-2">{pricing.taxRate}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Delivery Fee:</span>
                    <span className="font-medium ml-2">${pricing.deliverySettings.baseDeliveryFee}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Service Radius:</span>
                    <span className="font-medium ml-2">{pricing.deliverySettings.deliveryRadius} miles</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}