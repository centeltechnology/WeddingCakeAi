export type NavItem = { 
  label: string; 
  href: string; 
  demoOnly?: boolean;
  requiresFlag?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/baker/dashboard' },
  { label: 'Quotes', href: '/quotes' },
  { label: 'Contracts', href: '/contracts' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Leads', href: '/leads', requiresFlag: 'VITE_LEAD_SCORING_ENABLED' },
  { label: 'Calculator', href: '/baker/calculator', requiresFlag: 'VITE_CALCULATOR_ENABLED' },
  { label: 'Bookings', href: '/bookings', requiresFlag: 'VITE_BOOKING_ENABLED' },
  { label: 'AI Lab', href: '/ai-lab' },
  { label: 'Settings', href: '/settings' },
];
