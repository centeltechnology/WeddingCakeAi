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
  { label: 'Calculator', href: '/baker/calculator', requiresFlag: 'VITE_CALCULATOR_ENABLED' },
  { label: 'AI Lab', href: '/ai-lab' },
];
