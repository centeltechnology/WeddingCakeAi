/**
 * Mustache-lite Template Engine
 * 
 * Supports:
 * - {{variable}} - Escaped variable substitution
 * - {{{raw_variable}}} - Unescaped HTML output
 * - {{#if condition}}...{{/if}} - Conditional sections
 * - {{#each array}}...{{/each}} - Array iteration
 */

interface RenderContext {
  [key: string]: any;
}

/**
 * Escape HTML special characters for safe rendering
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Get value from nested object path (e.g., 'customer.name')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Check if a value is truthy for template conditionals
 */
function isTruthy(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * Extract all variables used in a template
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();
  
  // Match {{var}}, {{{var}}}, {{#if var}}, {{#each var}}
  const patterns = [
    /\{\{([^#\/][^}]*)\}\}/g,  // {{var}}
    /\{\{\{([^}]*)\}\}\}/g,     // {{{var}}}
    /\{\{#if\s+([^}]+)\}\}/g,   // {{#if var}}
    /\{\{#each\s+([^}]+)\}\}/g, // {{#each var}}
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(template)) !== null) {
      const varName = match[1].trim();
      // Extract just the root variable name (before any dots)
      const rootVar = varName.split('.')[0].split(' ')[0];
      if (rootVar) {
        variables.add(rootVar);
      }
    }
  });
  
  return Array.from(variables);
}

/**
 * Render a template with the given context
 */
export function renderTemplate(template: string, context: RenderContext): string {
  let output = template;
  
  // Process {{#each}} loops first (innermost to outermost)
  const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  output = output.replace(eachRegex, (match, arrayPath, loopContent) => {
    const array = getNestedValue(context, arrayPath.trim());
    if (!Array.isArray(array) || array.length === 0) return '';
    
    return array.map((item, index) => {
      // Create context with both item properties and special variables
      const loopContext = {
        ...context,
        ...item,
        _index: index,
        _first: index === 0,
        _last: index === array.length - 1,
      };
      return renderTemplate(loopContent, loopContext);
    }).join('');
  });
  
  // Process {{#if}} conditionals
  const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  output = output.replace(ifRegex, (match, condition, content) => {
    const value = getNestedValue(context, condition.trim());
    return isTruthy(value) ? renderTemplate(content, context) : '';
  });
  
  // Process {{{raw_html}}} - unescaped variables
  const rawRegex = /\{\{\{([^}]+)\}\}\}/g;
  output = output.replace(rawRegex, (match, varName) => {
    const value = getNestedValue(context, varName.trim());
    return value !== null && value !== undefined ? String(value) : '';
  });
  
  // Process {{variable}} - escaped variables
  const varRegex = /\{\{([^#\/][^}]*)\}\}/g;
  output = output.replace(varRegex, (match, varName) => {
    const value = getNestedValue(context, varName.trim());
    return value !== null && value !== undefined ? escapeHtml(String(value)) : '';
  });
  
  return output;
}

/**
 * Build context data for quote rendering
 */
export function buildQuoteContext(quote: any, customer: any, items: any[]): RenderContext {
  return {
    customer: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
    },
    quote: {
      number: quote?.quoteNumber || '',
      title: quote?.title || '',
      description: quote?.description || '',
      eventDate: quote?.eventDate || '',
      eventType: quote?.eventType || '',
      guestCount: quote?.guestCount || 0,
      deliveryAddress: quote?.deliveryAddress || '',
      setupTime: quote?.setupTime || '',
      validUntil: quote?.validUntil || '',
      customerNotes: quote?.customerNotes || '',
      terms: quote?.terms || '',
    },
    items: items.map(item => ({
      name: item.name || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
      category: item.category || '',
    })),
    totals: {
      subtotal: quote?.subtotal || 0,
      taxRate: quote?.taxRate || 0,
      taxAmount: quote?.taxAmount || 0,
      total: quote?.total || 0,
      depositAmount: quote?.depositAmount || 0,
      depositPercentage: quote?.depositPercentage || 0,
    },
  };
}

/**
 * Build context data for contract rendering
 */
export function buildContractContext(contract: any, quote: any, customer: any, items: any[]): RenderContext {
  const quoteContext = quote ? buildQuoteContext(quote, customer, items) : {
    customer: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    },
    items: [],
    totals: {},
  };
  
  return {
    ...quoteContext,
    contract: {
      number: contract?.contractNumber || '',
      title: contract?.title || '',
      totalAmount: contract?.totalAmount || 0,
      depositAmount: contract?.depositAmount || 0,
      remainingBalance: contract?.remainingBalance || 0,
      eventDate: contract?.eventDate || '',
      deliveryDate: contract?.deliveryDate || '',
      setupTime: contract?.setupTime || '',
      deliveryAddress: contract?.deliveryAddress || '',
      specialInstructions: contract?.specialInstructions || '',
      status: contract?.status || '',
    },
  };
}

/**
 * Example template for testing
 */
export const EXAMPLE_QUOTE_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <h1>Quote #{{quote.number}}</h1>
  <h2>{{quote.title}}</h2>
  
  <div style="margin: 20px 0;">
    <h3>Customer Information</h3>
    <p><strong>Name:</strong> {{customer.name}}</p>
    <p><strong>Email:</strong> {{customer.email}}</p>
    {{#if customer.phone}}<p><strong>Phone:</strong> {{customer.phone}}</p>{{/if}}
  </div>
  
  <div style="margin: 20px 0;">
    <h3>Event Details</h3>
    <p><strong>Event Date:</strong> {{quote.eventDate}}</p>
    <p><strong>Event Type:</strong> {{quote.eventType}}</p>
    <p><strong>Guest Count:</strong> {{quote.guestCount}}</p>
    {{#if quote.deliveryAddress}}<p><strong>Delivery:</strong> {{quote.deliveryAddress}}</p>{{/if}}
  </div>
  
  <div style="margin: 20px 0;">
    <h3>Items</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid #000;">
          <th style="text-align: left; padding: 8px;">Item</th>
          <th style="text-align: right; padding: 8px;">Qty</th>
          <th style="text-align: right; padding: 8px;">Unit Price</th>
          <th style="text-align: right; padding: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px;">
            <strong>{{name}}</strong>
            {{#if description}}<br><small>{{description}}</small>{{/if}}
          </td>
          <td style="text-align: right; padding: 8px;">{{quantity}}</td>
          <td style="text-align: right; padding: 8px;">\${{unitPrice}}</td>
          <td style="text-align: right; padding: 8px;">\${{totalPrice}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
  
  <div style="margin: 20px 0; text-align: right;">
    <p><strong>Subtotal:</strong> \${{totals.subtotal}}</p>
    <p><strong>Tax ({{totals.taxRate}}%):</strong> \${{totals.taxAmount}}</p>
    <p style="font-size: 1.2em;"><strong>Total:</strong> \${{totals.total}}</p>
    {{#if totals.depositAmount}}<p><strong>Deposit Required:</strong> \${{totals.depositAmount}}</p>{{/if}}
  </div>
  
  {{#if quote.terms}}
  <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 4px;">
    <h3>Terms & Conditions</h3>
    <p>{{{quote.terms}}}</p>
  </div>
  {{/if}}
</div>
`.trim();
