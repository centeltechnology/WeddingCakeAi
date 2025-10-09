export type NavItem = { 
  label: string; 
  href: string; 
  demoOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/baker/dashboard' },
  { label: 'Quotes', href: '/quotes' },
  { label: 'Contracts', href: '/contracts' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'AI Lab', href: '/ai-lab' },
];
