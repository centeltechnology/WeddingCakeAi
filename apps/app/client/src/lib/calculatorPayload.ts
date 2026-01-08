export interface CalculatorTier {
  size: string;
  shape: string;
  flavor: string;
  servings: number;
  basePrice: number;
}

export interface CalculatorDecoration {
  id: string;
  name: string;
  price: number;
}

export interface CalculatorPricing {
  baseCake: number;
  decorations: number;
  delivery: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CalculatorPayload {
  tiers: CalculatorTier[];
  decorations: CalculatorDecoration[];
  eventDate: string;
  eventType: string;
  guestCount: number;
  venue: string;
  timeline: string;
  complexity: string;
  pricing: CalculatorPricing;
}

export interface LeadSubmissionPayload {
  name: string;
  email: string;
  phone: string;
  budget: string;
  selections: CalculatorPayload;
  notes: string;
}

export function buildCalculatorPayload(
  tiers: CalculatorTier[],
  decorations: CalculatorDecoration[],
  customerInfo: {
    eventDate: string;
    eventType: string;
    guestCount: number;
    venue: string;
    timeline: string;
  },
  complexity: string,
  pricing: CalculatorPricing
): CalculatorPayload {
  return {
    tiers: tiers.map(tier => ({
      size: tier.size,
      shape: tier.shape,
      flavor: tier.flavor,
      servings: tier.servings,
      basePrice: tier.basePrice
    })),
    decorations: decorations.map(d => ({
      id: d.id,
      name: d.name,
      price: d.price
    })),
    eventDate: customerInfo.eventDate,
    eventType: customerInfo.eventType,
    guestCount: customerInfo.guestCount,
    venue: customerInfo.venue,
    timeline: customerInfo.timeline,
    complexity,
    pricing: {
      baseCake: pricing.baseCake,
      decorations: pricing.decorations,
      delivery: pricing.delivery,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      total: pricing.total
    }
  };
}

export function parseCalculatorPayload(payload: any): CalculatorPayload | null {
  if (!payload) return null;
  
  try {
    return {
      tiers: Array.isArray(payload.tiers) ? payload.tiers : [],
      decorations: Array.isArray(payload.decorations) ? payload.decorations : [],
      eventDate: payload.eventDate || '',
      eventType: payload.eventType || '',
      guestCount: Number(payload.guestCount) || 0,
      venue: payload.venue || '',
      timeline: payload.timeline || '',
      complexity: payload.complexity || 'simple',
      pricing: {
        baseCake: Number(payload.pricing?.baseCake) || 0,
        decorations: Number(payload.pricing?.decorations) || 0,
        delivery: Number(payload.pricing?.delivery) || 0,
        subtotal: Number(payload.pricing?.subtotal) || 0,
        tax: Number(payload.pricing?.tax) || 0,
        total: Number(payload.pricing?.total) || 0
      }
    };
  } catch {
    return null;
  }
}

export function calculatorPayloadToQuoteItems(payload: CalculatorPayload): Array<{
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}> {
  const items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
  }> = [];

  for (const tier of payload.tiers) {
    items.push({
      name: `${tier.size} ${tier.flavor ? `(${tier.flavor})` : ''} ${tier.shape ? `- ${tier.shape}` : ''}`.trim(),
      description: `Serves ${tier.servings} guests`,
      quantity: 1,
      unitPrice: tier.basePrice,
      totalPrice: tier.basePrice,
      category: 'cake'
    });
  }

  for (const deco of payload.decorations) {
    items.push({
      name: deco.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: 'Decoration',
      quantity: 1,
      unitPrice: deco.price,
      totalPrice: deco.price,
      category: 'decoration'
    });
  }

  if (payload.pricing.delivery > 0) {
    items.push({
      name: 'Delivery',
      description: payload.venue ? `Delivery to ${payload.venue}` : 'Delivery fee',
      quantity: 1,
      unitPrice: payload.pricing.delivery,
      totalPrice: payload.pricing.delivery,
      category: 'delivery'
    });
  }

  if (payload.pricing.tax > 0) {
    items.push({
      name: 'Tax',
      description: 'Estimated tax',
      quantity: 1,
      unitPrice: payload.pricing.tax,
      totalPrice: payload.pricing.tax,
      category: 'tax'
    });
  }

  return items;
}
