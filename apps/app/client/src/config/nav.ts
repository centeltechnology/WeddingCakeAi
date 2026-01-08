import type { ReactNode } from 'react';

export type NavNode = { 
  label: string; 
  href?: string; 
  icon?: ReactNode; 
  feature?: 'ai' | 'booking' | 'calculator' | 'contracts' | 'invoices';
  children?: NavNode[];
};

// MVP Navigation - focused on core lead capture and quote workflow
export const NAV: NavNode[] = [
  { label: 'Dashboard', href: '/baker/dashboard' },
  { label: 'Leads', href: '/leads' },
  { label: 'Quotes', href: '/quotes' },
  { label: 'Contracts', href: '/contracts', feature: 'contracts' },
  { label: 'Invoices', href: '/invoices', feature: 'invoices' },
  { label: 'Bookings', href: '/bookings', feature: 'booking' },
  { label: 'AI Lab', href: '/ai-lab', feature: 'ai' },
  { label: 'Pricing', href: '/settings?tab=pricing' },
  { label: 'Settings', href: '/settings' },
];

export function featureOn(f?: NavNode['feature']): boolean {
  if (!f) return true;
  if (f === 'ai') return import.meta.env.VITE_AI_ENABLED === 'true';
  if (f === 'booking') return import.meta.env.VITE_BOOKING_ENABLED === 'true';
  if (f === 'calculator') return import.meta.env.VITE_CALCULATOR_ENABLED === 'true';
  // Hide contracts and invoices for MVP (can be enabled later)
  if (f === 'contracts') return import.meta.env.VITE_CONTRACTS_ENABLED === 'true';
  if (f === 'invoices') return import.meta.env.VITE_INVOICES_ENABLED === 'true';
  return true;
}

export type NavItem = NavNode;
export const MAIN_NAV = NAV;
