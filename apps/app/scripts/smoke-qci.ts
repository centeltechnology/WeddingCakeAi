import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authCookie = '';

interface TestResult {
  step: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: string;
}

async function request(path: string, method = 'GET', body?: any) {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (authCookie) {
      headers['Cookie'] = authCookie;
    }

    const response = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error.message,
      headers: null,
    };
  }
}

async function login(): Promise<boolean> {
  console.log('🔑 Authenticating...');
  
  const response = await request('/login', 'POST', {
    email: 'demo@bakeriq.com',
    password: 'demo123',
  });

  if (response.ok && response.headers) {
    const rawCookies = (response.headers as any).raw()['set-cookie'];
    if (rawCookies && rawCookies.length > 0) {
      authCookie = rawCookies[0].split(';')[0];
      console.log('✅ Authentication successful\n');
      return true;
    }
  }

  console.error('❌ Authentication failed');
  return false;
}

async function runQCIWorkflow(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let customerId: string | null = null;
  let quoteId: string | null = null;
  let contractId: string | null = null;
  let invoiceId: string | null = null;

  console.log('🧪 Running Quote → Contract → Invoice Workflow Test\n');

  // Step 1: Create or get a customer
  console.log('📝 Step 1: Creating customer...');
  try {
    const customerRes = await request('/api/customers', 'POST', {
      name: 'QCI Test Customer',
      email: `qci-test-${Date.now()}@example.com`,
      phone: '555-0123',
    });

    if (customerRes.ok && customerRes.data?.id) {
      customerId = customerRes.data.id;
      results.push({
        step: '1. Create Customer',
        status: 'PASS',
        details: `Customer ID: ${customerId}`,
      });
      console.log(`✅ Customer created: ${customerId}\n`);
    } else {
      throw new Error(customerRes.data?.error || 'Failed to create customer');
    }
  } catch (error: any) {
    results.push({
      step: '1. Create Customer',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
    return results;
  }

  // Step 2: Create a quote
  console.log('📋 Step 2: Creating quote...');
  try {
    const quoteRes = await request('/api/quotes', 'POST', {
      customerId,
      title: 'QCI Test Quote',
      description: 'Testing the complete QCI workflow',
      total: '500.00',
      depositAmount: '100.00',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    if (quoteRes.ok && quoteRes.data?.id) {
      quoteId = quoteRes.data.id;
      results.push({
        step: '2. Create Quote',
        status: 'PASS',
        details: `Quote ID: ${quoteId}`,
      });
      console.log(`✅ Quote created: ${quoteId}\n`);
    } else {
      throw new Error(quoteRes.data?.error || 'Failed to create quote');
    }
  } catch (error: any) {
    results.push({
      step: '2. Create Quote',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
    return results;
  }

  // Step 3: Approve the quote (creates contract automatically)
  console.log('✅ Step 3: Approving quote...');
  try {
    const approveRes = await request(`/api/quotes/${quoteId}/approve`, 'POST');

    if (approveRes.ok && approveRes.data?.contractId) {
      contractId = approveRes.data.contractId;
      results.push({
        step: '3. Approve Quote (Auto-create Contract)',
        status: 'PASS',
        details: `Contract ID: ${contractId}`,
      });
      console.log(`✅ Quote approved, contract created: ${contractId}\n`);
    } else {
      throw new Error(approveRes.data?.error || 'Failed to approve quote');
    }
  } catch (error: any) {
    results.push({
      step: '3. Approve Quote (Auto-create Contract)',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
    return results;
  }

  // Step 4: Sign the contract (creates deposit invoice automatically)
  console.log('✍️  Step 4: Signing contract...');
  try {
    const signRes = await request(`/api/contracts/${contractId}/sign`, 'POST', {
      signerName: 'QCI Test Customer',
      signerEmail: 'qci-test@example.com',
      signerType: 'customer',
    });

    if (signRes.ok && signRes.data?.invoiceId) {
      invoiceId = signRes.data.invoiceId;
      results.push({
        step: '4. Sign Contract (Auto-create Invoice)',
        status: 'PASS',
        details: `Invoice ID: ${invoiceId}`,
      });
      console.log(`✅ Contract signed, invoice created: ${invoiceId}\n`);
    } else {
      throw new Error(signRes.data?.error || 'Failed to sign contract');
    }
  } catch (error: any) {
    results.push({
      step: '4. Sign Contract (Auto-create Invoice)',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
    return results;
  }

  // Step 5: Verify invoice details
  console.log('🔍 Step 5: Verifying invoice details...');
  try {
    const invoiceRes = await request(`/api/invoices/${invoiceId}`, 'GET');

    if (invoiceRes.ok && invoiceRes.data?.id === invoiceId) {
      const invoice = invoiceRes.data;
      const isDeposit = invoice.title?.toLowerCase().includes('deposit');
      results.push({
        step: '5. Verify Invoice',
        status: 'PASS',
        details: `Invoice verified: ${invoice.invoiceNumber}, Type: ${isDeposit ? 'Deposit' : 'Full'}, Amount: $${invoice.total}`,
      });
      console.log(`✅ Invoice verified: ${invoice.invoiceNumber}\n`);
    } else {
      throw new Error('Invoice not found or invalid');
    }
  } catch (error: any) {
    results.push({
      step: '5. Verify Invoice',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
    return results;
  }

  // Step 6: Mark invoice as paid
  console.log('💰 Step 6: Marking invoice as paid...');
  try {
    const paidRes = await request(`/api/invoices/${invoiceId}/paid`, 'POST');

    if (paidRes.ok && paidRes.data?.ok) {
      results.push({
        step: '6. Mark Invoice as Paid',
        status: 'PASS',
        details: 'Invoice payment recorded',
      });
      console.log(`✅ Invoice marked as paid\n`);
    } else {
      throw new Error(paidRes.data?.error || 'Failed to mark invoice as paid');
    }
  } catch (error: any) {
    results.push({
      step: '6. Mark Invoice as Paid',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
    return results;
  }

  // Step 7: Verify timeline events
  console.log('📅 Step 7: Verifying timeline events...');
  try {
    const [quoteEvents, contractEvents, invoiceEvents] = await Promise.all([
      request(`/api/quotes/${quoteId}/events`, 'GET'),
      request(`/api/contracts/${contractId}/events`, 'GET'),
      request(`/api/invoices/${invoiceId}/events`, 'GET'),
    ]);

    const quoteEventsCount = quoteEvents.ok ? (quoteEvents.data?.length || 0) : 0;
    const contractEventsCount = contractEvents.ok ? (contractEvents.data?.length || 0) : 0;
    const invoiceEventsCount = invoiceEvents.ok ? (invoiceEvents.data?.length || 0) : 0;

    if (quoteEventsCount > 0 && contractEventsCount > 0 && invoiceEventsCount > 0) {
      results.push({
        step: '7. Verify Timeline Events',
        status: 'PASS',
        details: `Quote: ${quoteEventsCount} events, Contract: ${contractEventsCount} events, Invoice: ${invoiceEventsCount} events`,
      });
      console.log(`✅ Timeline events verified\n`);
    } else {
      throw new Error(`Missing events - Quote: ${quoteEventsCount}, Contract: ${contractEventsCount}, Invoice: ${invoiceEventsCount}`);
    }
  } catch (error: any) {
    results.push({
      step: '7. Verify Timeline Events',
      status: 'FAIL',
      error: error.message,
    });
    console.log(`❌ Failed: ${error.message}\n`);
  }

  return results;
}

function printResults(results: TestResult[]) {
  console.log('\n📊 QCI Workflow Test Results:\n');
  
  console.table(results.map(r => ({
    Step: r.step,
    Status: r.status,
    Details: r.details || r.error || '',
  })));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed Steps:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   ${r.step}`);
        if (r.error) {
          console.log(`      Error: ${r.error}`);
        }
      });
  }
}

async function main() {
  console.log('🚀 BakerIQ QCI Workflow Smoke Test\n');
  console.log('Testing: Quote → Contract → Invoice → Payment\n');

  const authenticated = await login();
  if (!authenticated) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  const results = await runQCIWorkflow();
  printResults(results);

  const failed = results.filter(r => r.status === 'FAIL').length;
  
  if (failed > 0) {
    console.log('\n❌ QCI WORKFLOW TEST FAILED');
    process.exit(1);
  }

  console.log('\n✅ QCI WORKFLOW TEST PASSED');
  console.log('\n🎉 Complete workflow validated: Quote → Contract → Invoice → Payment');
  process.exit(0);
}

main().catch(error => {
  console.error('💥 QCI smoke test crashed:', error);
  process.exit(1);
});
