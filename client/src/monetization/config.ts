export const STRIPE_LINKS = {
  proMonthly: "", // Add your Stripe payment link here
  plusMonthly: "" // Add your Stripe payment link here
};

export const DEMO_MODE = !STRIPE_LINKS.proMonthly || !STRIPE_LINKS.plusMonthly;