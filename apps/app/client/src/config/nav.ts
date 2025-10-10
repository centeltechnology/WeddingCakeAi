export type NavItem = { 
  label: string; 
  href: string; 
  feature?: 'calculator' | 'booking' | 'ai';
  exact?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/baker/dashboard', exact: true },
  { label: 'Leads', href: '/leads' },
  { label: 'Quotes', href: '/quotes' },
  { label: 'Contracts', href: '/contracts' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Calculator', href: '/baker/calculator', feature: 'calculator' },
  { label: 'Bookings', href: '/bookings', feature: 'booking' },
  { label: 'Customers', href: '/customers' },
  { label: 'AI Lab', href: '/ai-lab', feature: 'ai' },
  { label: 'Settings', href: '/settings' },
];

export function featureOn(feature?: NavItem['feature']): boolean {
  if (!feature) return true;
  if (feature === 'calculator') return import.meta.env.VITE_CALCULATOR_ENABLED === 'true';
  if (feature === 'booking') return import.meta.env.VITE_BOOKING_ENABLED === 'true';
  if (feature === 'ai') return import.meta.env.VITE_AI_ENABLED === 'true';
  return true;
}
