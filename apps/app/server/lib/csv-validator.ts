import { z } from 'zod';

// Customer/Lead CSV Schema
export const CustomerLeadCsvSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  source: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerLeadCsvRow = z.infer<typeof CustomerLeadCsvSchema>;

// Catalog Item CSV Schema
export const CatalogItemCsvSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['cake', 'cupcake', 'cookie', 'pastry', 'other'], {
    errorMap: () => ({ message: 'Category must be: cake, cupcake, cookie, pastry, or other' }),
  }),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Base price must be a valid number with up to 2 decimal places'),
  servings: z.string().regex(/^\d+$/, 'Servings must be a valid positive integer').optional().or(z.literal('')),
  description: z.string().optional(),
  flavors: z.string().optional(), // Comma-separated
  allergens: z.string().optional(), // Comma-separated
});

export type CatalogItemCsvRow = z.infer<typeof CatalogItemCsvSchema>;

// CSV parsing helper
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split('\n');
  return lines.map(line => {
    // Simple CSV parser (handles basic cases)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return values;
  });
}

// Convert CSV rows to objects
export function csvToObjects<T>(
  rows: string[][],
  headers: string[]
): Record<string, string>[] {
  const [firstRow, ...dataRows] = rows;
  const actualHeaders = headers.length > 0 ? headers : firstRow;
  
  return dataRows.map(row => {
    const obj: Record<string, string> = {};
    actualHeaders.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Validation result type
export interface ValidationResult<T> {
  valid: T[];
  invalid: Array<{
    row: number;
    data: Record<string, string>;
    errors: string[];
  }>;
}

// Validate CSV data
export function validateCsvData<T>(
  data: Record<string, string>[],
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const result: ValidationResult<T> = {
    valid: [],
    invalid: [],
  };
  
  data.forEach((row, index) => {
    const parsed = schema.safeParse(row);
    
    if (parsed.success) {
      result.valid.push(parsed.data);
    } else {
      result.invalid.push({
        row: index + 2, // +2 because index 0 is row 2 (after header)
        data: row,
        errors: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      });
    }
  });
  
  return result;
}

// Template generators
export const CUSTOMER_LEAD_CSV_TEMPLATE = `name,email,phone,source,eventType,eventDate,budget,notes
Jane Smith,jane@example.com,555-0123,Website,wedding,2025-06-15,5000,Prefers vanilla
John Doe,john@example.com,555-0124,Referral,birthday,2025-08-20,1500,Chocolate cake requested`;

export const CATALOG_ITEM_CSV_TEMPLATE = `name,category,basePrice,servings,description,flavors,allergens
Wedding Tier Cake,cake,450.00,100,3-tier elegant wedding cake,vanilla|chocolate|red velvet,eggs|dairy|wheat
Birthday Cupcakes,cupcake,3.50,1,Gourmet cupcakes with custom frosting,vanilla|chocolate|strawberry,eggs|dairy
Sugar Cookies,cookie,2.00,1,Classic decorated sugar cookies,vanilla,eggs|dairy|wheat`;
