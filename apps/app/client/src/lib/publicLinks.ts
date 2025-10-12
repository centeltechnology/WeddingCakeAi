export const buildPublicCalculatorUrl = (slug?: string | null) =>
  slug ? `/calculator?tenant=${encodeURIComponent(slug)}` : '/calculator';

export const buildBookingUrl = (slug?: string | null) =>
  slug ? `/b/${encodeURIComponent(slug)}/book` : '/book';

export const buildListingUrl = (slug?: string | null) =>
  slug ? `/p/${encodeURIComponent(slug)}` : '/p';

// Legacy function - kept for backward compatibility
export function buildMarketplaceUrl(slug?: string | null) {
  return buildListingUrl(slug);
}

// Legacy function - deprecated, use buildPublicCalculatorUrl or buildBookingUrl instead
export function buildLeadGenUrl(slug?: string | null, opts?: { preferBooking?: boolean }) {
  const preferBooking = opts?.preferBooking ?? true;
  const bookingOn = import.meta.env.VITE_BOOKING_ENABLED === 'true';
  const calcOn = import.meta.env.VITE_PUBLIC_CALCULATOR_ENABLED === 'true';
  
  if (preferBooking && bookingOn && slug) return buildBookingUrl(slug);
  if (calcOn) return buildPublicCalculatorUrl(slug);
  if (preferBooking && bookingOn && !slug) return buildBookingUrl(null);
  return '/';
}
