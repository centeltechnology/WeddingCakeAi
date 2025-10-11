import { Router } from 'express';
import { db } from '../db';
import { leads, catalogItems } from '@shared/schema';
import { 
  parseCSV, 
  csvToObjects, 
  validateCsvData,
  CustomerLeadCsvSchema,
  CatalogItemCsvSchema,
  CUSTOMER_LEAD_CSV_TEMPLATE,
  CATALOG_ITEM_CSV_TEMPLATE,
} from '../lib/csv-validator';
import { nanoid } from 'nanoid';

const router = Router();

// Download CSV templates
router.get('/template/customers', (_req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="customer-lead-template.csv"');
  res.send(CUSTOMER_LEAD_CSV_TEMPLATE);
});

router.get('/template/catalog', (_req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="catalog-items-template.csv"');
  res.send(CATALOG_ITEM_CSV_TEMPLATE);
});

// Validate customer/lead CSV (preview)
router.post('/validate/customers', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV data is required' });
    }
    
    const rows = parseCSV(csvData);
    const objects = csvToObjects(rows, []);
    const validation = validateCsvData(objects, CustomerLeadCsvSchema);
    
    res.json({
      total: objects.length,
      valid: validation.valid.length,
      invalid: validation.invalid.length,
      errors: validation.invalid,
      preview: validation.valid.slice(0, 5), // First 5 valid rows
    });
  } catch (error) {
    console.error('CSV validation error:', error);
    res.status(500).json({ error: 'Failed to validate CSV' });
  }
});

// Validate catalog item CSV (preview)
router.post('/validate/catalog', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV data is required' });
    }
    
    const rows = parseCSV(csvData);
    const objects = csvToObjects(rows, []);
    const validation = validateCsvData(objects, CatalogItemCsvSchema);
    
    res.json({
      total: objects.length,
      valid: validation.valid.length,
      invalid: validation.invalid.length,
      errors: validation.invalid,
      preview: validation.valid.slice(0, 5), // First 5 valid rows
    });
  } catch (error) {
    console.error('CSV validation error:', error);
    res.status(500).json({ error: 'Failed to validate CSV' });
  }
});

// Import customers/leads
router.post('/customers', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const tenantId = (req as any).tenantId;
    
    if (!userId || !tenantId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV data is required' });
    }
    
    const rows = parseCSV(csvData);
    const objects = csvToObjects(rows, []);
    const validation = validateCsvData(objects, CustomerLeadCsvSchema);
    
    if (validation.invalid.length > 0) {
      return res.status(400).json({
        error: 'CSV contains invalid data',
        invalid: validation.invalid,
      });
    }
    
    // Insert valid leads
    const imported = [];
    for (const lead of validation.valid) {
      const result = await db.insert(leads).values({
        tenantId,
        customerName: lead.name,
        customerEmail: lead.email,
        customerPhone: lead.phone || null,
        source: lead.source || 'csv_import',
        weddingDate: lead.eventDate || null,
        budget: lead.budget || null,
        notes: lead.notes || null,
      }).returning();
      
      imported.push(result[0]);
    }
    
    res.json({
      success: true,
      imported: imported.length,
      leads: imported,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import customers/leads' });
  }
});

// Import catalog items
router.post('/catalog', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const tenantId = (req as any).tenantId;
    
    if (!userId || !tenantId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV data is required' });
    }
    
    const rows = parseCSV(csvData);
    const objects = csvToObjects(rows, []);
    const validation = validateCsvData(objects, CatalogItemCsvSchema);
    
    if (validation.invalid.length > 0) {
      return res.status(400).json({
        error: 'CSV contains invalid data',
        invalid: validation.invalid,
      });
    }
    
    // Insert valid catalog items
    const imported = [];
    for (const item of validation.valid) {
      // Parse numeric values with validation
      const basePrice = parseFloat(item.basePrice);
      if (isNaN(basePrice)) {
        throw new Error(`Invalid base price: ${item.basePrice}`);
      }
      
      let servings = null;
      if (item.servings && item.servings.trim() !== '') {
        servings = parseInt(item.servings, 10);
        if (isNaN(servings)) {
          throw new Error(`Invalid servings: ${item.servings}`);
        }
      }
      
      const result = await db.insert(catalogItems).values({
        tenantId,
        name: item.name,
        category: item.category,
        basePrice: basePrice.toFixed(2), // Ensure 2 decimal places
        servings,
        description: item.description || null,
        flavors: item.flavors ? item.flavors.split('|').map(f => f.trim()) : [],
        allergens: item.allergens ? item.allergens.split('|').map(a => a.trim()) : [],
      }).returning();
      
      imported.push(result[0]);
    }
    
    res.json({
      success: true,
      imported: imported.length,
      items: imported,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import catalog items' });
  }
});

export default router;
