#!/usr/bin/env tsx
/**
 * Smoke Test: Public Calculator Submission
 * 
 * Verifies that the public calculator submission endpoint:
 * - Resolves tenant by slug
 * - Creates/upserts customer
 * - Creates lead with source='calculator'
 * - Creates draft quote
 */

import { db } from '../server/db';
import { leads, customers, quotes } from '../shared/schema';
import { eq } from 'drizzle-orm';

const API_BASE = 'http://localhost:5000';

async function testPublicCalculatorSubmit() {
  console.log('\n🧪 Starting Public Calculator Submission Smoke Test...\n');

  const testEmail = `test-calc-${Date.now()}@example.com`;
  const testName = 'Calculator Test User';
  const testPhone = '+1234567890';

  try {
    // 1) Submit calculator with tenant slug
    console.log('✅ Step 1: Submit calculator for tenant "sweet-treats-bakery"');
    const response = await fetch(`${API_BASE}/api/public/calculator/submit?tenant=sweet-treats-bakery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        phone: testPhone,
        selections: {
          flavor: 'chocolate',
          size: '8-inch',
          servings: 12
        },
        notes: 'Test calculator submission'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Submit failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log(`   ✓ Submission successful: leadId=${result.leadId}, quoteId=${result.quoteId}`);

    // 2) Verify customer was created
    console.log('\n✅ Step 2: Verify customer was created');
    const [customer] = await db.select().from(customers)
      .where(eq(customers.email, testEmail))
      .limit(1);

    if (!customer) {
      throw new Error('Customer not found in database');
    }
    console.log(`   ✓ Customer found: id=${customer.id}, name=${customer.name}`);

    // 3) Verify lead was created with source='calculator'
    console.log('\n✅ Step 3: Verify lead was created');
    const [lead] = await db.select().from(leads)
      .where(eq(leads.id, result.leadId))
      .limit(1);

    if (!lead) {
      throw new Error('Lead not found in database');
    }
    if (lead.source !== 'calculator') {
      throw new Error(`Lead has wrong source: ${lead.source}, expected 'calculator'`);
    }
    if (lead.customerId !== customer.id) {
      throw new Error(`Lead not linked to customer: customerId=${lead.customerId}, expected ${customer.id}`);
    }
    console.log(`   ✓ Lead found: id=${lead.id}, source=${lead.source}, customerId=${lead.customerId}`);

    // 4) Verify draft quote was created
    if (result.quoteId) {
      console.log('\n✅ Step 4: Verify draft quote was created');
      const [quote] = await db.select().from(quotes)
        .where(eq(quotes.id, result.quoteId))
        .limit(1);

      if (!quote) {
        throw new Error('Quote not found in database');
      }
      if (quote.status !== 'draft') {
        throw new Error(`Quote has wrong status: ${quote.status}, expected 'draft'`);
      }
      if (quote.customerId !== customer.id) {
        throw new Error(`Quote not linked to customer: customerId=${quote.customerId}, expected ${customer.id}`);
      }
      if (quote.leadId !== lead.id) {
        throw new Error(`Quote not linked to lead: leadId=${quote.leadId}, expected ${lead.id}`);
      }
      console.log(`   ✓ Quote found: id=${quote.id}, status=${quote.status}, customerId=${quote.customerId}, leadId=${quote.leadId}`);
    }

    console.log('\n✨ All tests passed! Public calculator submission is working correctly.\n');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run test
testPublicCalculatorSubmit();
