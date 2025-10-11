import { db } from '../db.js';
import { calculatorSettings, tenants } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type V1Defaults = {
  baseServingSize: number;
  baseCakeSize: number;
  frostingType: string;
  fillingType: string;
  flavor: string;
  deliveryMiles: number;
  rushOrder: boolean;
  dietary: string[];
  pricingMatrix: any;
  taxRate: number;
  depositPct: number;
};

type V2Defaults = {
  servings: number;
  cakeSizeInches: number;
  frosting: string;
  filling: string;
  flavor: string;
  delivery: { miles: number };
  modifiers: { rush: boolean; dietary: string[] };
  pricing: { matrix: any };
  tax: { rate: number };
  payment: { depositPct: number };
};

function transformV1ToV2(v1: V1Defaults): V2Defaults {
  return {
    servings: v1.baseServingSize,
    cakeSizeInches: v1.baseCakeSize,
    frosting: v1.frostingType,
    filling: v1.fillingType,
    flavor: v1.flavor,
    delivery: { miles: v1.deliveryMiles },
    modifiers: { rush: v1.rushOrder, dietary: v1.dietary },
    pricing: { matrix: v1.pricingMatrix },
    tax: { rate: v1.taxRate },
    payment: { depositPct: v1.depositPct },
  };
}

function computeHash(data: any): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

async function migrateDefaults() {
  try {
    // Read V1 defaults
    const v1JsonPath = join(__dirname, '../seeds/v1_calculator_defaults.json');
    const v1Data = JSON.parse(readFileSync(v1JsonPath, 'utf-8')) as V1Defaults;

    // Transform to V2
    const v2Defaults = transformV1ToV2(v1Data);

    // Default theme
    const defaultTheme = {
      primary: '#0F172A',
      secondary: '#475569',
      bg: '#F8FAFC',
      text: '#0B1221',
      radius: 'md',
      font: 'system'
    };

    // Compute hash for idempotency
    const newHash = computeHash({ defaults: v2Defaults, theme: defaultTheme });

    // Get all active tenants (or use DEMO tenant if specified)
    const demoTenantId = process.env.DEMO_TENANT_ID;
    
    let tenantsToMigrate;
    if (demoTenantId) {
      console.log(`Migrating DEMO tenant: ${demoTenantId}`);
      tenantsToMigrate = await db.select().from(tenants).where(eq(tenants.id, demoTenantId)).limit(1);
    } else {
      console.log('Migrating all active tenants...');
      tenantsToMigrate = await db.select().from(tenants).where(eq(tenants.isActive, true));
    }

    if (tenantsToMigrate.length === 0) {
      console.log('No tenants found to migrate.');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const tenant of tenantsToMigrate) {
      // Check if settings already exist
      const existing = await db
        .select()
        .from(calculatorSettings)
        .where(eq(calculatorSettings.tenantId, tenant.id))
        .limit(1);

      if (existing.length > 0) {
        // Compute hash of existing to check if update needed
        const existingHash = computeHash({
          defaults: existing[0].defaults,
          theme: existing[0].theme
        });

        if (existingHash === newHash) {
          console.log(`✓ Tenant ${tenant.name} (${tenant.id}): Skipped (unchanged)`);
          skippedCount++;
          continue;
        }
      }

      // Upsert settings
      if (existing.length > 0) {
        await db
          .update(calculatorSettings)
          .set({
            defaults: v2Defaults,
            theme: defaultTheme,
            updatedAt: new Date()
          })
          .where(eq(calculatorSettings.tenantId, tenant.id));
        console.log(`✓ Tenant ${tenant.name} (${tenant.id}): Updated`);
      } else {
        await db.insert(calculatorSettings).values({
          tenantId: tenant.id,
          defaults: v2Defaults,
          theme: defaultTheme,
        });
        console.log(`✓ Tenant ${tenant.name} (${tenant.id}): Inserted`);
      }

      migratedCount++;
    }

    console.log(`\n✅ Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDefaults();
