export type NavItem = { 
  label: string; 
  href?: string;
  children?: NavItem[];
  demoOnly?: boolean;
  requiresFlag?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/baker/dashboard' },
  { 
    label: 'Clients',
    children: [
      { label: 'Leads', href: '/leads', requiresFlag: 'VITE_LEAD_SCORING_ENABLED' },
      { label: 'Quotes', href: '/quotes' },
      { label: 'Contracts', href: '/contracts' },
      { label: 'Invoices', href: '/invoices' },
    ]
  },
  { label: 'Calculator', href: '/baker/calculator', requiresFlag: 'VITE_CALCULATOR_ENABLED' },
  { label: 'Bookings', href: '/bookings', requiresFlag: 'VITE_BOOKING_ENABLED' },
  { label: 'AI Lab', href: '/ai-lab' },
  { label: 'Settings', href: '/settings' },
];
