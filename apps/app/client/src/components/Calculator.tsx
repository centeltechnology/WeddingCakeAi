import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Printer, Save, Cake, Sparkles } from "lucide-react";
import { calculateTotal } from "@/lib/calculator";
import { generatePDF } from "@/lib/pdf-generator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DreamCakeDesigner } from "@/components/DreamCakeDesigner";
import SocialShare from "@/components/SocialShare";
import { useCalculatorTheme } from "@/hooks/useCalculatorTheme";

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
    pipingBorders: boolean;
    edibleGlitter: boolean;
    handPainted: boolean;
    sugarFlowers: boolean;
  };
  delivery: string;
  distance: string;
  specialRequests: string;
}

interface CalculatorProps {
  themeId?: string;
}

export default function Calculator({ themeId = 'classic-elegance' }: CalculatorProps) {
  const { toast } = useToast();
  const { currentTheme, setTheme } = useCalculatorTheme(themeId);
  
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
      pipingBorders: false,
      edibleGlitter: false,
      handPainted: false,
      sugarFlowers: false,
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

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [networkOptIn, setNetworkOptIn] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const [isDreamCakeDesignerOpen, setIsDreamCakeDesignerOpen] = useState(false);

  const saveLeadMutation = useMutation({
    mutationFn: async (lead: any) => {
      return await apiRequest('POST', '/api/calculator-leads', lead);
    },
    onSuccess: () => {
      toast({
        title: "Quote Saved!",
        description: "We've saved your cake quote and you're now on our mailing list for special offers!",
      });
      setShowContactForm(false);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setNetworkOptIn(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save your quote",
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

  const handleSaveQuote = () => {
    if (!customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email to save your quote.",
        variant: "destructive",
      });
      return;
    }

    const lead = {
      customerName,
      customerEmail,
      customerPhone,
      eventDate: config.eventDate,
      cakeConfiguration: config,
      estimatedPrice: pricing.total.toString(),
      networkOptIn,
      consentedAt: networkOptIn ? new Date().toISOString() : null,
      source: 'calculator',
    };

    saveLeadMutation.mutate(lead);
  };

  const handleOpenContactForm = () => {
    setShowContactForm(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePDF = () => {
    generatePDF(config, pricing);
  };

  // Apply theme when themeId prop changes
  useEffect(() => {
    setTheme(themeId);
  }, [themeId, setTheme]);

  return (
    <div 
      className="calculator-grid min-h-screen"
      style={{ background: `var(--calc-background)` }}
      data-calculator-theme={currentTheme.id}
      data-testid="calculator-container"
    >
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Calculator Form Section */}
      <div className="space-y-8 relative z-10">
        <Card className="calculator-card backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            <div className="calculator-header flex items-center space-x-3 mb-8 p-4 rounded-lg">
              <div className="relative">
                <div className="absolute inset-0 theme-gradient rounded-2xl blur-lg opacity-30"></div>
                <div className="calculator-icon w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative">
                  <Cake className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Cake Configuration
                </h2>
                <p className="text-sm text-gray-600 font-medium">
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
                  className="calculator-input"
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
                  className="calculator-input"
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
                    <SelectTrigger className="calculator-select" data-testid="select-tiers">
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
                    <SelectTrigger className="calculator-select" data-testid="select-base-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 inch (serves ~6)</SelectItem>
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
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="pipingBorders"
                      checked={config.decorations.pipingBorders}
                      onCheckedChange={(checked) => handleDecorationChange('pipingBorders', checked as boolean)}
                      data-testid="checkbox-piping-borders"
                    />
                    <Label htmlFor="pipingBorders" className="font-semibold">Piping & Borders</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$40</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="edibleGlitter"
                      checked={config.decorations.edibleGlitter}
                      onCheckedChange={(checked) => handleDecorationChange('edibleGlitter', checked as boolean)}
                      data-testid="checkbox-edible-glitter"
                    />
                    <Label htmlFor="edibleGlitter" className="font-semibold">Edible Glitter</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$30</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="handPainted"
                      checked={config.decorations.handPainted}
                      onCheckedChange={(checked) => handleDecorationChange('handPainted', checked as boolean)}
                      data-testid="checkbox-hand-painted"
                    />
                    <Label htmlFor="handPainted" className="font-semibold">Hand-painted Design</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$125</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-card to-muted/50 dark:from-card dark:to-muted/50 rounded-xl border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="sugarFlowers"
                      checked={config.decorations.sugarFlowers}
                      onCheckedChange={(checked) => handleDecorationChange('sugarFlowers', checked as boolean)}
                      data-testid="checkbox-sugar-flowers"
                    />
                    <Label htmlFor="sugarFlowers" className="font-semibold">Sugar Flowers</Label>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">+$90</span>
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
        <Card className="sticky top-6 border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/30 dark:from-card dark:via-card dark:to-muted/30 backdrop-blur-sm">
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
            <div className="pricing-display p-6 rounded-2xl mb-8 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-serif font-bold">Total Estimate</span>
                  <p className="text-sm opacity-90 mt-1">
                    Serves approximately {config.guestCount} guests
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold drop-shadow-sm" data-testid="text-total">
                    ${pricing.total.toFixed(2)}
                  </span>
                  <div className="text-sm opacity-90 font-medium">
                    ${(pricing.total / config.guestCount).toFixed(2)} per guest
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleGeneratePDF}
                className="calculator-primary-btn w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-generate-pdf"
              >
                <FileText className="w-5 h-5 mr-3" />
                Download PDF Estimate
              </Button>
              <Button
                onClick={handlePrint}
                className="calculator-secondary-btn w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-print-estimate"
              >
                <Printer className="w-5 h-5 mr-3" />
                Print Estimate
              </Button>
              <Button
                onClick={handleOpenContactForm}
                className="calculator-accent-btn w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-save-quote"
              >
                <Save className="w-5 h-5 mr-3" />
                Save My Quote
              </Button>
              
              <div className="flex justify-center">
                <SocialShare 
                  title="Check out my wedding cake estimate!"
                  description={`I estimated my dream wedding cake cost using Wedding CakeAI`}
                  estimateTotal={pricing.total}
                />
              </div>
            </div>

            {/* DreamCake Designer Section */}
            <div className="pt-6 border-t border-border">
              <Button
                onClick={() => {
                  // Check if required fields are filled
                  if (!config.eventDate || config.guestCount <= 0 || !config.cakeFlavor) {
                    toast({
                      title: "Please Complete Cake Details",
                      description: "Add event date, guest count, and cake flavor before visualizing your cake.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setIsDreamCakeDesignerOpen(true);
                }}
                className="calculator-primary-btn w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                data-testid="button-visualize-cake"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                Visualize My Cake
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                ✨ Premium Feature: Unlimited cake visualizations available in Bride Plus Pack.
              </p>
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
      
      {/* DreamCake Designer Modal */}
      <DreamCakeDesigner
        config={{
          // Convert the Calculator config to DreamCakeDesigner format
          tiers: Array.from({ length: config.tiers }, (_, i) => ({
            size: config.baseSize - (i * 2), // Each tier is 2 inches smaller than the previous
            shape: config.shape,
            flavor: config.cakeFlavor
          })),
          totalTiers: config.tiers,
          decorations: config.decorations,
          specialRequests: config.specialRequests || ''
        }}
        isOpen={isDreamCakeDesignerOpen}
        onClose={() => setIsDreamCakeDesignerOpen(false)}
      />

      {/* Contact Information Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Save Your Quote
            </DialogTitle>
            <DialogDescription>
              Enter your contact information to save your cake quote and receive special offers & updates!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="customer-name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="customer-name"
                placeholder="Jane Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                data-testid="input-customer-name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customer-email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="jane@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                data-testid="input-customer-email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone" className="text-sm font-medium">
                Phone Number (Optional)
              </Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                data-testid="input-customer-phone"
                className="mt-1"
              />
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Checkbox
                id="network-opt-in"
                checked={networkOptIn}
                onCheckedChange={(checked) => setNetworkOptIn(checked as boolean)}
                data-testid="checkbox-network-opt-in"
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label 
                  htmlFor="network-opt-in" 
                  className="text-sm font-medium cursor-pointer text-blue-900 dark:text-blue-100"
                >
                  I'd like relevant offers from BakerIQ partners (optional)
                </Label>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Get exclusive deals on wedding services like venues, photography, and more.
                </p>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                💌 By saving your quote, you'll be added to our exclusive mailing list for wedding cake tips, special promotions, and seasonal offers!
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowContactForm(false)}
              className="flex-1"
              data-testid="button-cancel-contact"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuote}
              disabled={saveLeadMutation.isPending}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
              data-testid="button-submit-contact"
            >
              {saveLeadMutation.isPending ? 'Saving...' : 'Save Quote'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
