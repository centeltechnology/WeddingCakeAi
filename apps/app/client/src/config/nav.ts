import type { ReactNode } from 'react';

export type NavNode = { 
  label: string; 
  href?: string; 
  icon?: ReactNode; 
  feature?: 'ai' | 'booking' | 'calculator';
  children?: NavNode[];
};

export const NAV: NavNode[] = [
  { label: 'Dashboard', href: '/baker/dashboard' },
  { 
    label: 'Customers', 
    children: [
      { label: 'Baker Calculator', href: '/baker/calculator' },
      { label: 'Leads', href: '/leads' },
      { label: 'Quotes', href: '/quotes' },
      { label: 'Contracts', href: '/contracts' },
      { label: 'Invoices', href: '/invoices' },
    ]
  },
  { label: 'Bookings', href: '/bookings', feature: 'booking' },
  { label: 'AI Lab', href: '/ai-lab', feature: 'ai' },
  { label: 'Templates', href: '/settings?tab=templates' },
  { label: 'Settings', href: '/settings' },
];

export function featureOn(f?: NavNode['feature']): boolean {
  if (!f) return true;
  if (f === 'ai') return import.meta.env.VITE_AI_ENABLED === 'true';
  if (f === 'booking') return import.meta.env.VITE_BOOKING_ENABLED === 'true';
  if (f === 'calculator') return import.meta.env.VITE_CALCULATOR_ENABLED === 'true';
  return true;
}

export type NavItem = NavNode;
export const MAIN_NAV = NAV;
