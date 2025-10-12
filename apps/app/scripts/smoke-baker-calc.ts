import fetch from 'node-fetch';

const base = 'http://localhost:5000';

async function post(path: string, body: any, cookie?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) headers.cookie = cookie;

  const r = await fetch(base + path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const text = await r.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return { ok: r.ok, status: r.status, json, text, path };
}

// NOTE: This script requires an auth cookie. Run with a valid session cookie for testing.
(async () => {
  console.log('🧪 Baker Calculator Smoke Test\n');

  // Test 1: Upsert customer
  console.log('1️⃣  Testing customer upsert...');
  const c1 = await post('/api/customers/upsert', {
    name: 'Calc Test Customer',
    email: `calc-test-${Date.now()}@example.com`,
    phone: '555-0123'
  });

  console.table([
    { step: 'Customer Upsert', path: c1.path, status: c1.status, ok: c1.ok }
  ]);

  if (!c1.ok || !c1.json?.customer?.id) {
    console.error('❌ Customer upsert failed:', c1.json || c1.text);
    process.exit(1);
  }

  const customerId = c1.json.customer.id;
  console.log('✅ Customer created:', customerId);

  // Test 2: Save estimate as quote
  console.log('\n2️⃣  Testing save estimate as quote...');
  const q1 = await post('/api/estimates/save-as-quote', {
    customer: { id: customerId, email: c1.json.customer.email },
    title: 'Baker Calculator Test Estimate',
    items: [
      { name: '8" Round Cake', qty: 1, unit: 'ea', price: 55.00, notes: 'Vanilla' },
      { name: '10" Round Cake', qty: 1, unit: 'ea', price: 75.00, notes: 'Chocolate' }
    ],
    taxRate: 0.0825,
    discount: 5.00,
    depositPct: 0.5,
    notes: 'Smoke test from baker calculator'
  });

  console.table([
    { step: 'Save as Quote', path: q1.path, status: q1.status, ok: q1.ok }
  ]);

  if (!q1.ok || !q1.json?.quoteId) {
    console.error('❌ Save as quote failed:', q1.json || q1.text);
    process.exit(1);
  }

  if (!q1.json.totals) {
    console.error('❌ Response missing totals object');
    process.exit(1);
  }

  const quoteId = q1.json.quoteId;
  const totals = q1.json.totals;

  console.log('✅ Quote created:', quoteId);

  // Validate totals (55 + 75 = 130, -5 discount = 125, +10.3125 tax = 135.3125)
  const expectedSubtotal = 130.00;
  const expectedDiscount = 5.00;
  const expectedTax = 10.31; // 8.25% of 125
  const expectedTotal = 135.31;
  const expectedDepositPct = 0.5;

  console.log('\n📊 Validating totals...');
  const errors: string[] = [];

  if (Math.abs(totals.subtotal - expectedSubtotal) > 0.01) {
    errors.push(`Subtotal mismatch: got ${totals.subtotal}, expected ${expectedSubtotal}`);
  }
  if (Math.abs(totals.discount - expectedDiscount) > 0.01) {
    errors.push(`Discount mismatch: got ${totals.discount}, expected ${expectedDiscount}`);
  }
  if (Math.abs(totals.tax - expectedTax) > 0.01) {
    errors.push(`Tax mismatch: got ${totals.tax}, expected ${expectedTax}`);
  }
  if (Math.abs(totals.total - expectedTotal) > 0.01) {
    errors.push(`Total mismatch: got ${totals.total}, expected ${expectedTotal}`);
  }
  if (totals.depositPct !== expectedDepositPct) {
    errors.push(`Deposit % mismatch: got ${totals.depositPct}, expected ${expectedDepositPct}`);
  }

  if (errors.length > 0) {
    console.error('❌ Total validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.table([
    { label: 'Subtotal', actual: `$${totals.subtotal.toFixed(2)}`, expected: `$${expectedSubtotal.toFixed(2)}`, status: '✅' },
    { label: 'Discount', actual: `$${totals.discount.toFixed(2)}`, expected: `$${expectedDiscount.toFixed(2)}`, status: '✅' },
    { label: 'Tax', actual: `$${totals.tax.toFixed(2)}`, expected: `$${expectedTax.toFixed(2)}`, status: '✅' },
    { label: 'Total', actual: `$${totals.total.toFixed(2)}`, expected: `$${expectedTotal.toFixed(2)}`, status: '✅' },
    { label: 'Deposit %', actual: `${(totals.depositPct * 100).toFixed(0)}%`, expected: `${(expectedDepositPct * 100).toFixed(0)}%`, status: '✅' }
  ]);

  console.log('\n✅ BAKER CALCULATOR PASS ✅');
  console.log(`\nQuote ID: ${quoteId}`);
  console.log(`Customer ID: ${customerId}`);
})();
