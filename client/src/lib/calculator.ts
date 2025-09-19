interface CakeConfiguration {
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
}

interface PricingResult {
  subtotal: number;
  tax: number;
  total: number;
  lineItems: Array<{ description: string; price: number }>;
}

// Base pricing structure
const BASE_PRICES = {
  tiers: {
    1: 150,
    2: 280,
    3: 420,
    4: 580,
  },
  sizeMultipliers: {
    4: 0.5,
    8: 0.8,
    10: 1.0,
    12: 1.3,
    14: 1.6,
  },
  shapeMultipliers: {
    round: 1.0,
    square: 1.1,
    hexagon: 1.2,
    heart: 1.3,
  },
  flavors: {
    vanilla: 0,
    chocolate: 20,
    'red-velvet': 35,
    lemon: 25,
    strawberry: 30,
    funfetti: 15,
  },
  fillings: {
    buttercream: 0,
    'cream-cheese': 25,
    'chocolate-ganache': 30,
    'fruit-compote': 35,
    caramel: 40,
  },
  decorations: {
    fondant: 150,
    flowers: 75,
    goldAccents: 100,
    customTopper: 50,
  },
  delivery: {
    pickup: 0,
    standard: 50,
    'white-glove': 150,
  },
  distance: {
    local: 0,
    extended: 25,
    distant: 75,
  },
};

const TAX_RATE = 0.085; // 8.5%

export function calculateTotal(config: CakeConfiguration): PricingResult {
  const lineItems: Array<{ description: string; price: number }> = [];
  
  // Base cake price
  const baseTierPrice = BASE_PRICES.tiers[config.tiers as keyof typeof BASE_PRICES.tiers] || BASE_PRICES.tiers[2];
  const sizeMultiplier = BASE_PRICES.sizeMultipliers[config.baseSize as keyof typeof BASE_PRICES.sizeMultipliers] || 1.0;
  const shapeMultiplier = BASE_PRICES.shapeMultipliers[config.shape as keyof typeof BASE_PRICES.shapeMultipliers] || 1.0;
  
  const baseCakePrice = Math.round(baseTierPrice * sizeMultiplier * shapeMultiplier);
  const tierDescription = config.tiers === 1 ? '1-Tier' : `${config.tiers}-Tier`;
  const sizeDescription = config.tiers === 1 ? `${config.baseSize}"` : `${config.baseSize}" base`;
  
  lineItems.push({
    description: `Base ${tierDescription} Cake (${sizeDescription})`,
    price: baseCakePrice,
  });

  // Flavor surcharge
  const flavorPrice = BASE_PRICES.flavors[config.cakeFlavor as keyof typeof BASE_PRICES.flavors] || 0;
  const fillingPrice = BASE_PRICES.fillings[config.filling as keyof typeof BASE_PRICES.fillings] || 0;
  
  if (flavorPrice > 0 || fillingPrice > 0) {
    const flavorName = config.cakeFlavor.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fillingName = config.filling.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    lineItems.push({
      description: `${flavorName} Cake with ${fillingName}`,
      price: flavorPrice + fillingPrice,
    });
  }

  // Decorations
  Object.entries(config.decorations).forEach(([key, enabled]) => {
    if (enabled) {
      const price = BASE_PRICES.decorations[key as keyof typeof BASE_PRICES.decorations];
      const description = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      lineItems.push({
        description,
        price,
      });
    }
  });

  // Delivery
  const deliveryPrice = BASE_PRICES.delivery[config.delivery as keyof typeof BASE_PRICES.delivery] || 0;
  if (deliveryPrice > 0) {
    const deliveryName = config.delivery.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    lineItems.push({
      description: deliveryName + ' Delivery',
      price: deliveryPrice,
    });
  }

  // Distance surcharge
  const distancePrice = BASE_PRICES.distance[config.distance as keyof typeof BASE_PRICES.distance] || 0;
  if (distancePrice > 0) {
    const distanceName = config.distance.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    lineItems.push({
      description: distanceName + ' Distance',
      price: distancePrice,
    });
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    lineItems,
  };
}
