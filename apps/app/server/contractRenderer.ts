// server/contractRenderer.ts
// Purpose: Server-side contract template rendering with payment info

import type { Baker, Quote, Customer, Contract } from '@shared/schema';

interface RenderContext {
  baker: Baker;
  customer: Customer;
  quote?: Quote;
  contract: Partial<Contract>;
}

interface PaymentMethodSnapshot {
  method: string;
  label: string;
  value: string;
  instructions: string;
  qr_url?: string;
}

/**
 * Resolve payment method from baker's payment links
 * Priority: Zelle > PayPal > CashApp > Venmo > Other
 */
export function resolvePaymentMethod(baker: Baker): PaymentMethodSnapshot | null {
  const links = baker.paymentLinks as any || {};
  
  // Zelle (most common for bakeries)
  if (links.zelle) {
    return {
      method: 'zelle',
      label: 'Zelle',
      value: sanitizePaymentHandle(links.zelle),
      instructions: `Send payment via Zelle to: ${sanitizePaymentHandle(links.zelle)}`,
    };
  }
  
  // PayPal
  if (links.paypal) {
    const isPayPalMe = links.paypal.includes('paypal.me');
    
    return {
      method: 'paypal',
      label: 'PayPal',
      value: sanitizePaymentHandle(links.paypal),
      instructions: isPayPalMe 
        ? `Pay online at: ${sanitizePaymentHandle(links.paypal)}`
        : `Send payment to PayPal: ${sanitizePaymentHandle(links.paypal)}`,
    };
  }
  
  // CashApp
  if (links.cashapp) {
    return {
      method: 'cashapp',
      label: 'Cash App',
      value: sanitizePaymentHandle(links.cashapp),
      instructions: `Send payment via Cash App to: ${sanitizePaymentHandle(links.cashapp)}`,
    };
  }
  
  // Venmo
  if (links.venmo) {
    return {
      method: 'venmo',
      label: 'Venmo',
      value: sanitizePaymentHandle(links.venmo),
      instructions: `Send payment via Venmo to: ${sanitizePaymentHandle(links.venmo)}`,
    };
  }
  
  // Other payment methods
  if (links.other && Array.isArray(links.other) && links.other.length > 0) {
    const first = links.other[0];
    return {
      method: 'other',
      label: first.label,
      value: sanitizePaymentHandle(first.url),
      instructions: `Payment method: ${first.label} - ${sanitizePaymentHandle(first.url)}`,
    };
  }
  
  return null;
}

/**
 * Sanitize payment handles/links to prevent XSS and validate format
 */
function sanitizePaymentHandle(value: string): string {
  // Remove any HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  
  // Validate common patterns
  if (sanitized.includes('@')) {
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      console.warn(`[SECURITY] Invalid email format in payment handle`);
    }
  } else if (sanitized.startsWith('http')) {
    // URL format
    try {
      new URL(sanitized);
    } catch {
      console.warn(`[SECURITY] Invalid URL format in payment handle`);
    }
  }
  
  // Trim and return
  return sanitized.trim();
}

/**
 * Format currency for display
 */
function formatCurrency(amount: string | number | null | undefined): string {
  if (!amount) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)}`;
}

/**
 * Format date for display
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'TBD';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Render contract template with variable replacement
 */
export function renderContractTemplate(
  template: string,
  context: RenderContext
): { content: string; paymentSnapshot: PaymentMethodSnapshot | null } {
  const { baker, customer, quote, contract } = context;
  
  // Resolve payment method
  const paymentMethod = resolvePaymentMethod(baker);
  
  // Build variable map
  const variables: Record<string, string> = {
    // Baker info
    '{{baker_name}}': baker.name || '',
    '{{baker_email}}': baker.email || '',
    '{{baker_phone}}': baker.phone || '',
    '{{baker_address}}': baker.address || '',
    '{{baker_business_name}}': baker.businessName || baker.name || '',
    
    // Customer info
    '{{customer_name}}': customer.name || '',
    '{{customer_email}}': customer.email || '',
    '{{customer_phone}}': customer.phone || '',
    '{{customer_address}}': (customer as any).address || '',
    '{{partner_name}}': (customer as any).partnerName || '',
    
    // Event details
    '{{event_date}}': formatDate(contract.eventDate || quote?.eventDate || customer.eventDate),
    '{{event_type}}': (contract as any).eventType || quote?.eventType || customer.eventType || 'wedding',
    '{{guest_count}}': String(quote?.guestCount || customer.guestCount || 'TBD'),
    '{{delivery_address}}': contract.deliveryAddress || quote?.deliveryAddress || '',
    '{{setup_time}}': contract.setupTime || quote?.setupTime || '',
    
    // Financial details
    '{{total_amount}}': formatCurrency(contract.totalAmount || quote?.total),
    '{{deposit_amount}}': formatCurrency(contract.depositAmount || quote?.depositAmount),
    '{{remaining_balance}}': formatCurrency(contract.remainingBalance),
    '{{subtotal}}': formatCurrency(quote?.subtotal),
    '{{tax_amount}}': formatCurrency(quote?.taxAmount),
    
    // Contract details
    '{{contract_number}}': contract.contractNumber || 'DRAFT',
    '{{contract_title}}': contract.title || '',
    
    // Payment method info
    '{{payment_method_label}}': paymentMethod?.label || 'Contact baker for payment details',
    '{{payment_link}}': paymentMethod?.value || '',
    '{{payment_instructions}}': paymentMethod?.instructions || 'Payment details will be provided upon request',
    '{{payment_qr_url}}': paymentMethod?.qr_url || '',
    
    // Dates
    '{{today}}': formatDate(new Date()),
  };
  
  // Replace all variables in template
  let rendered = template;
  for (const [placeholder, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  
  // Log warning if unreplaced variables remain (helps debug template issues)
  const unreplacedMatches = rendered.match(/\{\{[^}]+\}\}/g);
  if (unreplacedMatches) {
    console.warn(`[CONTRACT] Unrecognized template variables: ${unreplacedMatches.join(', ')}`);
  }
  
  return {
    content: rendered,
    paymentSnapshot: paymentMethod,
  };
}
