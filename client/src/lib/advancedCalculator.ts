// Advanced pricing calculator for quote templates
interface QuoteTemplate {
  id: string;
  pricingModel: string;
  basePrice: string;
  pricePerServing: string;
  minimumOrder: string;
  seasonalPricing: Array<{
    season: string;
    multiplier: number;
    startDate: string;
    endDate: string;
  }>;
  volumeDiscounts: Array<{
    minQuantity: number;
    maxQuantity: number | null;
    discountPercentage: number;
    discountType: 'percentage' | 'fixed_amount';
  }>;
  tiers: Array<{
    tierNumber: number;
    name: string;
    diameter: number;
    height: number;
    servings: number;
    basePrice: number;
    priceMultiplier: number;
    isOptional: boolean;
  }>;
  addOns: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    pricingType: 'fixed' | 'per_serving' | 'per_tier';
    isRequired: boolean;
    maxQuantity?: number;
  }>;
  flavorOptions: Array<{
    id: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
  }>;
  fillingOptions: Array<{
    id: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
  }>;
  deliveryOptions: Array<{
    type: string;
    name: string;
    basePrice: number;
    pricePerMile?: number;
    maxDistance?: number;
    setupIncluded: boolean;
    leadTime: number;
  }>;
  profitMargin: string;
}

interface PricingSpecifications {
  selectedTiers: string[]; // tier IDs
  selectedAddOns: Array<{
    id: string;
    quantity: number;
  }>;
  selectedFlavor?: string;
  selectedFilling?: string;
  guestCount?: number;
  eventDate?: string;
  deliveryAddress?: string;
  distance?: number;
  setupRequired?: boolean;
}

interface PricingResult {
  subtotal: number;
  discounts: Array<{
    description: string;
    amount: number;
    type: 'percentage' | 'fixed_amount';
  }>;
  seasonalAdjustments: Array<{
    description: string;
    amount: number;
    multiplier: number;
  }>;
  deliveryCost: number;
  tax: number;
  total: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
  }>;
  breakdown: {
    basePrice: number;
    tiersPrice: number;
    addOnsPrice: number;
    flavorPrice: number;
    fillingPrice: number;
    deliveryPrice: number;
    discountsApplied: number;
    seasonalAdjustment: number;
  };
}

export function calculateAdvancedPrice(params: {
  template: QuoteTemplate;
  specifications: PricingSpecifications;
  addOns?: string[];
  deliveryType?: string;
  eventDate?: string;
  guestCount?: number;
}): PricingResult {
  const { template, specifications, eventDate, guestCount } = params;
  const lineItems: PricingResult['lineItems'] = [];
  const discounts: PricingResult['discounts'] = [];
  const seasonalAdjustments: PricingResult['seasonalAdjustments'] = [];

  let subtotal = 0;

  // 1. Base Price Calculation
  let basePrice = 0;
  if (template.pricingModel === 'fixed') {
    basePrice = parseFloat(template.basePrice || '0');
  } else if (template.pricingModel === 'per_serving' && guestCount) {
    basePrice = parseFloat(template.pricePerServing || '0') * guestCount;
  }

  if (basePrice > 0) {
    lineItems.push({
      description: 'Base Cake',
      quantity: 1,
      unitPrice: basePrice,
      totalPrice: basePrice,
      category: 'base'
    });
    subtotal += basePrice;
  }

  // 2. Tier Pricing
  let tiersPrice = 0;
  if (specifications.selectedTiers?.length > 0) {
    specifications.selectedTiers.forEach(tierId => {
      const tier = template.tiers.find(t => t.tierNumber.toString() === tierId);
      if (tier) {
        const tierPrice = tier.basePrice * tier.priceMultiplier;
        lineItems.push({
          description: tier.name,
          quantity: 1,
          unitPrice: tierPrice,
          totalPrice: tierPrice,
          category: 'tier'
        });
        tiersPrice += tierPrice;
      }
    });
    subtotal += tiersPrice;
  }

  // 3. Add-ons Pricing
  let addOnsPrice = 0;
  if (specifications.selectedAddOns?.length > 0) {
    specifications.selectedAddOns.forEach(selectedAddon => {
      const addon = template.addOns.find(a => a.id === selectedAddon.id);
      if (addon) {
        let addonPrice = 0;
        
        switch (addon.pricingType) {
          case 'fixed':
            addonPrice = addon.price * selectedAddon.quantity;
            break;
          case 'per_serving':
            addonPrice = addon.price * (guestCount || 1) * selectedAddon.quantity;
            break;
          case 'per_tier':
            addonPrice = addon.price * specifications.selectedTiers.length * selectedAddon.quantity;
            break;
        }

        lineItems.push({
          description: addon.name,
          quantity: selectedAddon.quantity,
          unitPrice: addon.price,
          totalPrice: addonPrice,
          category: 'addon'
        });
        addOnsPrice += addonPrice;
      }
    });
    subtotal += addOnsPrice;
  }

  // 4. Flavor and Filling Pricing
  let flavorPrice = 0;
  if (specifications.selectedFlavor) {
    const flavor = template.flavorOptions.find(f => f.id === specifications.selectedFlavor);
    if (flavor && flavor.priceModifier !== 0) {
      flavorPrice = flavor.priceModifier;
      lineItems.push({
        description: `${flavor.name} Flavor`,
        quantity: 1,
        unitPrice: flavorPrice,
        totalPrice: flavorPrice,
        category: 'flavor'
      });
      subtotal += flavorPrice;
    }
  }

  let fillingPrice = 0;
  if (specifications.selectedFilling) {
    const filling = template.fillingOptions.find(f => f.id === specifications.selectedFilling);
    if (filling && filling.priceModifier !== 0) {
      fillingPrice = filling.priceModifier;
      lineItems.push({
        description: `${filling.name} Filling`,
        quantity: 1,
        unitPrice: fillingPrice,
        totalPrice: fillingPrice,
        category: 'filling'
      });
      subtotal += fillingPrice;
    }
  }

  // 5. Volume Discounts
  let discountsApplied = 0;
  if (guestCount && template.volumeDiscounts.length > 0) {
    const applicableDiscount = template.volumeDiscounts.find(discount => 
      guestCount >= discount.minQuantity && 
      (!discount.maxQuantity || guestCount <= discount.maxQuantity)
    );

    if (applicableDiscount) {
      const discountAmount = applicableDiscount.discountType === 'percentage'
        ? subtotal * (applicableDiscount.discountPercentage / 100)
        : applicableDiscount.discountPercentage;

      discounts.push({
        description: `Volume Discount (${guestCount} guests)`,
        amount: discountAmount,
        type: applicableDiscount.discountType
      });
      discountsApplied += discountAmount;
    }
  }

  // 6. Seasonal Pricing Adjustments
  let seasonalAdjustment = 0;
  if (eventDate && template.seasonalPricing.length > 0) {
    const eventDateObj = new Date(eventDate);
    const eventMonth = eventDateObj.getMonth() + 1;
    const eventDay = eventDateObj.getDate();
    const eventDateString = `${eventMonth.toString().padStart(2, '0')}-${eventDay.toString().padStart(2, '0')}`;

    const applicableSeason = template.seasonalPricing.find(season => {
      const startParts = season.startDate.split('-');
      const endParts = season.endDate.split('-');
      const startMonth = parseInt(startParts[0]);
      const startDay = parseInt(startParts[1]);
      const endMonth = parseInt(endParts[0]);
      const endDay = parseInt(endParts[1]);

      // Simple date range check (doesn't handle year boundaries)
      if (startMonth <= endMonth) {
        return (eventMonth > startMonth || (eventMonth === startMonth && eventDay >= startDay)) &&
               (eventMonth < endMonth || (eventMonth === endMonth && eventDay <= endDay));
      } else {
        // Handle year boundary (e.g., Nov-Feb)
        return (eventMonth > startMonth || (eventMonth === startMonth && eventDay >= startDay)) ||
               (eventMonth < endMonth || (eventMonth === endMonth && eventDay <= endDay));
      }
    });

    if (applicableSeason) {
      const adjustmentAmount = subtotal * (applicableSeason.multiplier - 1);
      seasonalAdjustments.push({
        description: `${applicableSeason.season} Season Pricing`,
        amount: adjustmentAmount,
        multiplier: applicableSeason.multiplier
      });
      seasonalAdjustment += adjustmentAmount;
    }
  }

  // 7. Delivery Pricing
  let deliveryPrice = 0;
  if (params.deliveryType) {
    const deliveryOption = template.deliveryOptions.find(d => d.type === params.deliveryType);
    if (deliveryOption) {
      deliveryPrice = deliveryOption.basePrice;
      
      // Add distance-based pricing if applicable
      if (deliveryOption.pricePerMile && specifications.distance) {
        const distanceCharge = Math.min(specifications.distance, deliveryOption.maxDistance || 100) * deliveryOption.pricePerMile;
        deliveryPrice += distanceCharge;
      }

      lineItems.push({
        description: deliveryOption.name,
        quantity: 1,
        unitPrice: deliveryPrice,
        totalPrice: deliveryPrice,
        category: 'delivery'
      });
    }
  }

  // 8. Apply minimum order requirement
  const adjustedSubtotal = Math.max(
    subtotal - discountsApplied + seasonalAdjustment,
    parseFloat(template.minimumOrder || '0')
  );

  // 9. Calculate tax (assuming 8.75% tax rate)
  const TAX_RATE = 0.0875;
  const finalSubtotal = adjustedSubtotal + deliveryPrice;
  const tax = Math.round(finalSubtotal * TAX_RATE * 100) / 100;
  const total = finalSubtotal + tax;

  return {
    subtotal: adjustedSubtotal,
    discounts,
    seasonalAdjustments,
    deliveryCost: deliveryPrice,
    tax,
    total,
    lineItems,
    breakdown: {
      basePrice,
      tiersPrice,
      addOnsPrice,
      flavorPrice,
      fillingPrice,
      deliveryPrice,
      discountsApplied,
      seasonalAdjustment
    }
  };
}

// Helper function to calculate profit margin
export function calculateProfitMargin(
  totalRevenue: number,
  materialCosts: number,
  laborHours: number,
  hourlyRate: number = 25
): {
  totalCosts: number;
  profit: number;
  profitMargin: number;
} {
  const laborCosts = laborHours * hourlyRate;
  const totalCosts = materialCosts + laborCosts;
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalCosts,
    profit,
    profitMargin
  };
}

// Helper function to suggest pricing adjustments
export function suggestPricingOptimizations(
  template: QuoteTemplate,
  historicalData?: {
    averageOrderValue: number;
    conversionRate: number;
    seasonalTrends: Record<string, number>;
  }
): {
  suggestions: Array<{
    type: 'pricing' | 'discount' | 'seasonal' | 'addon';
    description: string;
    impact: string;
    recommendation: string;
  }>;
} {
  const suggestions = [];

  // Analyze base pricing
  const basePrice = parseFloat(template.basePrice || '0');
  const targetMargin = parseFloat(template.profitMargin || '30');

  if (basePrice < 100) {
    suggestions.push({
      type: 'pricing',
      description: 'Base price is quite low',
      impact: 'May impact perceived value and profit margins',
      recommendation: 'Consider increasing base price to better reflect value and expertise'
    });
  }

  // Analyze volume discounts
  if (template.volumeDiscounts.length === 0) {
    suggestions.push({
      type: 'discount',
      description: 'No volume discounts configured',
      impact: 'Missing opportunity to encourage larger orders',
      recommendation: 'Add tiered volume discounts for orders over 50 and 100 guests'
    });
  }

  // Analyze seasonal pricing
  if (template.seasonalPricing.length === 0) {
    suggestions.push({
      type: 'seasonal',
      description: 'No seasonal pricing adjustments',
      impact: 'Missing revenue optimization during peak seasons',
      recommendation: 'Consider premium pricing for wedding season (May-October)'
    });
  }

  // Analyze add-ons
  const decorationAddOns = template.addOns.filter(a => a.category === 'decorations');
  if (decorationAddOns.length < 3) {
    suggestions.push({
      type: 'addon',
      description: 'Limited decoration options',
      impact: 'Fewer upselling opportunities',
      recommendation: 'Add more decoration add-ons like sugar flowers, gold leaf, custom toppers'
    });
  }

  return { suggestions };
}