// SECURE SUBSCRIPTION CONFIGURATION - SERVER CONTROLS ALL PRICING
// This file owns all plan-to-price mappings and subscription logic
// Clients cannot tamper with pricing by sending different plan names

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripePriceId: string;
  features: string[];
  monthlyPrice: number; // Price in dollars for display
  maxLeads?: number;
  maxPortfolioImages?: number;
  trialDays?: number;
}

// SECURITY: Server-only plan configuration - never expose price IDs to client
const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    stripePriceId: '', // Free plan - no Stripe price ID
    features: ['Basic profile listing', '5 leads per month', 'Up to 5 portfolio images'],
    monthlyPrice: 0,
    maxLeads: 5,
    maxPortfolioImages: 5
  },
  professional: {
    id: 'professional', 
    name: 'Professional',
    stripePriceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL || '',
    features: ['Unlimited leads', 'Unlimited portfolio', 'Custom domain', 'Quote templates'],
    monthlyPrice: 19,
    trialDays: 14
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise', 
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    features: ['Everything in Professional', 'Bulk email to leads', 'CSV data export', 'Priority placement', 'Advanced analytics', 'API access'],
    monthlyPrice: 39,
    trialDays: 14
  }
};

// Validate that required environment variables are set
function validateConfiguration() {
  const errors: string[] = [];
  
  if (!process.env.STRIPE_PRICE_ID_PROFESSIONAL) {
    errors.push('STRIPE_PRICE_ID_PROFESSIONAL environment variable is required');
  }
  
  if (!process.env.STRIPE_PRICE_ID_ENTERPRISE) {
    errors.push('STRIPE_PRICE_ID_ENTERPRISE environment variable is required');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Subscription configuration warnings:');
    errors.forEach(error => console.warn('  -', error));
    console.warn('⚠️ Paid subscriptions will be disabled until these are set');
  }
  
  return errors.length === 0;
}

// Public API for safe plan access
export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private isConfigValid: boolean;

  private constructor() {
    this.isConfigValid = validateConfiguration();
  }

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  // Get plan by ID with security validation
  getPlan(planId: string): SubscriptionPlan | null {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      console.error(`❌ Invalid plan ID requested: ${planId}`);
      return null;
    }
    return plan;
  }

  // Get all available plans (without sensitive price IDs)
  getAvailablePlans(): Array<Omit<SubscriptionPlan, 'stripePriceId'>> {
    return Object.values(SUBSCRIPTION_PLANS).map(({ stripePriceId, ...plan }) => plan);
  }

  // Validate if a plan requires payment
  isPaidPlan(planId: string): boolean {
    const plan = this.getPlan(planId);
    return plan ? plan.monthlyPrice > 0 : false;
  }

  // Get Stripe price ID for a plan (server-only function)
  getStripePriceId(planId: string): string | null {
    if (!this.isConfigValid) {
      console.error('❌ Cannot get Stripe price ID - configuration invalid');
      return null;
    }

    const plan = this.getPlan(planId);
    if (!plan || !plan.stripePriceId) {
      console.error(`❌ No Stripe price ID configured for plan: ${planId}`);
      return null;
    }

    return plan.stripePriceId;
  }

  // Validate plan transition (business logic)
  canUpgradeToPlan(currentPlan: string, newPlan: string): { allowed: boolean; reason?: string } {
    const current = this.getPlan(currentPlan);
    const target = this.getPlan(newPlan);

    if (!current || !target) {
      return { allowed: false, reason: 'Invalid plan specified' };
    }

    // Allow downgrading only at period end (handled by subscription)
    if (target.monthlyPrice < current.monthlyPrice) {
      return { allowed: true }; // Stripe will handle proration
    }

    // Allow upgrading immediately with proration
    return { allowed: true };
  }

  // Map legacy plan names from client (security layer)
  normalizePlanId(clientPlanId: string): string {
    const mapping: Record<string, string> = {
      'free': 'starter',
      'pro': 'professional', 
      'plus': 'enterprise',
      'starter': 'starter',
      'professional': 'professional',
      'enterprise': 'enterprise'
    };

    const normalized = mapping[clientPlanId];
    if (!normalized) {
      console.warn(`⚠️ Unknown plan ID from client: ${clientPlanId}, defaulting to starter`);
      return 'starter';
    }

    return normalized;
  }

  // Feature gating: Check if a plan has access to a specific feature
  hasFeatureAccess(planId: string | null | undefined, feature: string): boolean {
    const normalizedPlanId = planId ? this.normalizePlanId(planId) : 'starter';
    
    // Define feature access matrix
    const featureAccess: Record<string, string[]> = {
      'bulk_email': ['enterprise'],
      'csv_export': ['enterprise'],
      'quote_templates': ['professional', 'enterprise'],
      'contract_management': ['professional', 'enterprise'],
      'payment_processing': ['professional', 'enterprise'],
      'email_automation': ['professional', 'enterprise'],
      'advanced_analytics': ['enterprise'],
      'api_access': ['enterprise'],
      'priority_placement': ['enterprise']
    };

    const allowedPlans = featureAccess[feature];
    if (!allowedPlans) {
      console.warn(`⚠️ Unknown feature requested: ${feature}`);
      return false;
    }

    return allowedPlans.includes(normalizedPlanId);
  }

  // Check if a plan is enterprise tier
  isEnterprisePlan(planId: string | null | undefined): boolean {
    const normalizedPlanId = planId ? this.normalizePlanId(planId) : 'starter';
    return normalizedPlanId === 'enterprise';
  }

  // Check if a plan is professional or higher
  isProfessionalOrHigher(planId: string | null | undefined): boolean {
    const normalizedPlanId = planId ? this.normalizePlanId(planId) : 'starter';
    return normalizedPlanId === 'professional' || normalizedPlanId === 'enterprise';
  }

  // Generate secure plan metadata for Stripe
  generatePlanMetadata(planId: string, bakerId: string): Record<string, string> {
    const plan = this.getPlan(planId);
    return {
      bakerId,
      planId,
      planName: plan?.name || 'Unknown',
      source: 'bakewise_platform'
    };
  }
}

// Export singleton instance
export const subscriptionManager = SubscriptionManager.getInstance();