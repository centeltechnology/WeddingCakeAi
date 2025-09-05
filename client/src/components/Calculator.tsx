import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Printer, Save, Cake } from "lucide-react";
import { calculateTotal } from "@/lib/calculator";
import { generatePDF } from "@/lib/pdf-generator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CakeConfiguration {
  eventDate: string;
  guestCount: number;
  tiers: number;
  baseSize: number;
  shape: string;
  cakeFlavor: string;
  filling: string;
  decorations: {
    fondant: boolean;
    flowers: boolean;
    goldAccents: boolean;
    customTopper: boolean;
  };
  delivery: string;
  distance: string;
  specialRequests: string;
}

export default function Calculator() {
  const { toast } = useToast();
  const [config, setConfig] = useState<CakeConfiguration>({
    eventDate: '',
    guestCount: 75,
    tiers: 2,
    baseSize: 10,
    shape: 'round',
    cakeFlavor: 'chocolate',
    filling: 'cream-cheese',
    decorations: {
      fondant: false,
      flowers: false,
      goldAccents: true,
      customTopper: false,
    },
    delivery: 'standard',
    distance: 'extended',
    specialRequests: '',
  });

  const [pricing, setPricing] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
    lineItems: [] as Array<{ description: string; price: number }>
  });

  const saveEstimateMutation = useMutation({
    mutationFn: async (estimate: any) => {
      return await apiRequest('POST', '/api/estimates', estimate);
    },
    onSuccess: () => {
      toast({
        title: "Estimate saved",
        description: "Your cake estimate has been saved to your profile.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save estimate",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    const result = calculateTotal(config);
    setPricing(result);
  }, [config]);

  const updateConfig = (updates: Partial<CakeConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleDecorationChange = (decoration: keyof CakeConfiguration['decorations'], checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      decorations: {
        ...prev.decorations,
        [decoration]: checked
      }
    }));
  };

  const handleSaveEstimate = () => {
    const estimate = {
      profileId: null, // TODO: Get from user session
      name: `${config.tiers}-Tier ${config.cakeFlavor} Wedding Cake`,
      eventDate: config.eventDate,
      guestCount: config.guestCount,
      tiers: config.tiers,
      baseSize: config.baseSize,
      shape: config.shape,
      cakeFlavor: config.cakeFlavor,
      filling: config.filling,
      decorations: config.decorations,
      delivery: config.delivery,
      distance: config.distance,
      specialRequests: config.specialRequests,
      subtotal: pricing.subtotal.toString(),
      tax: pricing.tax.toString(),
      total: pricing.total.toString(),
    };

    saveEstimateMutation.mutate(estimate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePDF = () => {
    generatePDF(config, pricing);
  };

  return (
    <div className="calculator-grid">
      {/* Calculator Form Section */}
      <div className="space-y-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/95 dark:from-card dark:to-card/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  Cake Configuration
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Design your perfect wedding cake
                </p>
              </div>
            </div>

            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={config.eventDate}
                  onChange={(e) => updateConfig({ eventDate: e.target.value })}
                  data-testid="input-event-date"
                />
              </div>
              <div>
                <Label htmlFor="guestCount">Guest Count</Label>
                <Input
                  id="guestCount"
                  type="number"
                  placeholder="75"
                  value={config.guestCount}
                  onChange={(e) => updateConfig({ guestCount: parseInt(e.target.value) || 0 })}
                  data-testid="input-guest-count"
                />
              </div>
            </div>

            {/* Cake Size & Tiers */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📏</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">Size & Structure</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="tiers">Number of Tiers</Label>
                  <Select value={config.tiers.toString()} onValueChange={(value) => updateConfig({ tiers: parseInt(value) })}>
                    <SelectTrigger data-testid="select-tiers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Tier</SelectItem>
                      <SelectItem value="2">2 Tiers</SelectItem>
                      <SelectItem value="3">3 Tiers</SelectItem>
                      <SelectItem value="4">4 Tiers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="baseSize">Base Tier Size</Label>
                  <Select value={config.baseSize.toString()} onValueChange={(value) => updateConfig({ baseSize: parseInt(value) })}>
                    <SelectTrigger data-testid="select-base-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 inch</SelectItem>
                      <SelectItem value="10">10 inch</SelectItem>
                      <SelectItem value="12">12 inch</SelectItem>
                      <SelectItem value="14">14 inch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shape">Cake Shape</Label>
                  <Select value={config.shape} onValueChange={(value) => updateConfig({ shape: value })}>
                    <SelectTrigger data-testid="select-shape">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="hexagon">Hexagon</SelectItem>
                      <SelectItem value="heart">Heart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Flavors */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🍰</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">Flavors</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cakeFlavor">Cake Flavor</Label>
                  <Select value={config.cakeFlavor} onValueChange={(value) => updateConfig({ cakeFlavor: value })}>
                    <SelectTrigger data-testid="select-cake-flavor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vanilla">Vanilla</SelectItem>
                      <SelectItem value="chocolate">Chocolate</SelectItem>
                      <SelectItem value="red-velvet">Red Velvet</SelectItem>
                      <SelectItem value="lemon">Lemon</SelectItem>
                      <SelectItem value="strawberry">Strawberry</SelectItem>
                      <SelectItem value="funfetti">Funfetti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filling">Filling</Label>
                  <Select value={config.filling} onValueChange={(value) => updateConfig({ filling: value })}>
                    <SelectTrigger data-testid="select-filling">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buttercream">Buttercream</SelectItem>
                      <SelectItem value="cream-cheese">Cream Cheese</SelectItem>
                      <SelectItem value="chocolate-ganache">Chocolate Ganache</SelectItem>
                      <SelectItem value="fruit-compote">Fruit Compote</SelectItem>
                      <SelectItem value="caramel">Caramel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Decorations */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✨</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">Decorations & Add-ons</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="fondant"
                      checked={config.decorations.fondant}
                      onCheckedChange={(checked) => handleDecorationChange('fondant', checked as boolean)}
                      data-testid="checkbox-fondant"
                    />
                    <Label htmlFor="fondant" className="font-semibold">Fondant Covering</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$150</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="flowers"
                      checked={config.decorations.flowers}
                      onCheckedChange={(checked) => handleDecorationChange('flowers', checked as boolean)}
                      data-testid="checkbox-flowers"
                    />
                    <Label htmlFor="flowers" className="font-semibold">Fresh Flowers</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$75</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="goldAccents"
                      checked={config.decorations.goldAccents}
                      onCheckedChange={(checked) => handleDecorationChange('goldAccents', checked as boolean)}
                      data-testid="checkbox-gold-accents"
                    />
                    <Label htmlFor="goldAccents" className="font-semibold">Gold Leaf Accents</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$100</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="customTopper"
                      checked={config.decorations.customTopper}
                      onCheckedChange={(checked) => handleDecorationChange('customTopper', checked as boolean)}
                      data-testid="checkbox-custom-topper"
                    />
                    <Label htmlFor="customTopper" className="font-semibold">Custom Cake Topper</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$50</span>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🚚</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">Delivery & Setup</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="delivery">Delivery Option</Label>
                  <Select value={config.delivery} onValueChange={(value) => updateConfig({ delivery: value })}>
                    <SelectTrigger data-testid="select-delivery">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Pickup (Free)</SelectItem>
                      <SelectItem value="standard">Standard Delivery (+$50)</SelectItem>
                      <SelectItem value="white-glove">White Glove Setup (+$150)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Delivery Distance</Label>
                  <Select value={config.distance} onValueChange={(value) => updateConfig({ distance: value })}>
                    <SelectTrigger data-testid="select-distance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local (0-15 miles)</SelectItem>
                      <SelectItem value="extended">Extended (15-30 miles) +$25</SelectItem>
                      <SelectItem value="distant">Distant (30+ miles) +$75</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Summary Section */}
      <div className="space-y-8">
        <Card className="sticky top-6 border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/30 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">💰</span>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  Pricing Estimate
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Live calculation updates
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 mb-6">
              {pricing.lineItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <span className="text-foreground" data-testid={`item-description-${index}`}>
                    {item.description}
                  </span>
                  <span className="font-medium" data-testid={`item-price-${index}`}>
                    ${item.price.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal & Tax */}
            <div className="space-y-2 mb-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Subtotal</span>
                <span className="font-medium" data-testid="text-subtotal">
                  ${pricing.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax (8.5%)</span>
                <span className="text-muted-foreground" data-testid="text-tax">
                  ${pricing.tax.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl mb-8 border border-primary/20 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-serif font-bold text-foreground">Total Estimate</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Serves approximately {config.guestCount} guests
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent" data-testid="text-total">
                    ${pricing.total.toFixed(2)}
                  </span>
                  <div className="text-sm text-muted-foreground font-medium">
                    ${(pricing.total / config.guestCount).toFixed(2)} per guest
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleGeneratePDF}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-generate-pdf"
              >
                <FileText className="w-5 h-5 mr-3" />
                Download PDF Estimate
              </Button>
              <Button
                onClick={handlePrint}
                className="w-full h-12 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-print-estimate"
              >
                <Printer className="w-5 h-5 mr-3" />
                Print Estimate
              </Button>
              <Button
                onClick={handleSaveEstimate}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                disabled={saveEstimateMutation.isPending}
                data-testid="button-save-estimate"
              >
                <Save className="w-5 h-5 mr-3" />
                {saveEstimateMutation.isPending ? 'Saving...' : 'Save to Profile'}
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">Important Notice</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    This is an estimated price based on standard pricing models. Final pricing may vary based on specific requirements, 
                    complexity, availability, and other factors determined by individual bakers. Please contact bakers directly for 
                    accurate quotes and confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="pt-6 border-t border-border">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                rows={3}
                placeholder="Any special dietary requirements, design notes, or additional requests..."
                value={config.specialRequests}
                onChange={(e) => updateConfig({ specialRequests: e.target.value })}
                data-testid="textarea-special-requests"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
