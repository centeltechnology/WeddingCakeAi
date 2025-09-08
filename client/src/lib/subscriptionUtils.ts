// Utility functions for handling subscription errors and upgrade prompts

export interface SubscriptionError {
  code: 'UPGRADE_REQUIRED';
  message: string;
  requiredPlan: string;
  currentPlan: string;
}

export function isSubscriptionError(error: any): error is SubscriptionError {
  return error && error.code === 'UPGRADE_REQUIRED';
}

export function parseSubscriptionError(error: any): SubscriptionError | null {
  if (error && typeof error === 'object') {
    // Handle axios error structure
    if (error.response?.data) {
      const data = error.response.data;
      if (data.code === 'UPGRADE_REQUIRED') {
        return {
          code: 'UPGRADE_REQUIRED',
          message: data.message || 'This feature requires a plan upgrade.',
          requiredPlan: data.requiredPlan || 'professional',
          currentPlan: data.currentPlan || 'starter'
        };
      }
    }
    
    // Handle direct error object
    if (error.code === 'UPGRADE_REQUIRED') {
      return {
        code: 'UPGRADE_REQUIRED',
        message: error.message || 'This feature requires a plan upgrade.',
        requiredPlan: error.requiredPlan || 'professional',
        currentPlan: error.currentPlan || 'starter'
      };
    }
  }
  
  return null;
}

export function getFeatureUpgradeMessage(feature: string, requiredPlan: string): string {
  const featureMessages = {
    'unlimited_leads': `Unlimited leads are available in ${requiredPlan} plan and above.`,
    'advanced_analytics': `Advanced analytics require the ${requiredPlan} plan.`,
    'custom_branding': `Custom branding is available in ${requiredPlan} and Enterprise plans.`,
    'api_access': `API access is exclusive to the ${requiredPlan} plan.`,
    'portfolio_management': `You've reached your portfolio limit. Upgrade to ${requiredPlan} for unlimited portfolio images.`,
    'lead_creation': `You've reached your monthly lead limit. Upgrade to ${requiredPlan} for more leads.`,
  };
  
  return featureMessages[feature as keyof typeof featureMessages] || 
    `This feature requires the ${requiredPlan} plan or higher.`;
}