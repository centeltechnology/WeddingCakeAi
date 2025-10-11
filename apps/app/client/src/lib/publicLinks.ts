export function buildMarketplaceUrl(slug?: string | null) {
  return slug ? `/p/${slug}` : '/p/demo';
}

export function buildLeadGenUrl(slug?: string | null, opts?: { preferBooking?: boolean }) {
  const preferBooking = opts?.preferBooking ?? true;
  const bookingOn = import.meta.env.VITE_BOOKING_ENABLED === 'true';
  const calcOn = import.meta.env.VITE_PUBLIC_CALCULATOR_ENABLED === 'true';
  
  if (preferBooking && bookingOn && slug) return `/b/${slug}/book`;
  if (calcOn) return `/calculator`;
  if (preferBooking && bookingOn && !slug) return `/book`;
  return '/';
}
