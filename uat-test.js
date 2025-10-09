// UAT Test Script - Full Customer Journey Validation
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const BAKER_ID = 'baker-demo-1';
const TENANT_ID = 'tenant-demo-1';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiYWtlci1kZW1vLTEiLCJ1c2VySWQiOiJiYWtlci1kZW1vLTEiLCJyb2xlIjoiYmFrZXIiLCJ0ZW5hbnRJZCI6InRlbmFudC1kZW1vLTEiLCJpYXQiOjE3NjAwMjcwMjEsImV4cCI6MTc2MDAzMDYyMX0.trtr093OmSG09ALtQ_8F2TKivQq-nMwx6AF70qhKqP4';

// Test data
const results = {
  customer: null,
  quote: null,
  quoteApprovalUrl: null,
  quoteShortlink: null,
  contract: null,
  contractApprovalUrl: null,
  contractShortlink: null,
  invoice: null,
  events: [],
  errors: []
};

async function makeRequest(method, path, body = null, auth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (auth) {
    options.headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();
  
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { rawResponse: text };
  }

  return { response, data };
}

async function step1_createCustomer() {
  console.log('\n📝 STEP 1: Creating customer...');
  
  const customerData = {
    bakerId: BAKER_ID,
    tenantId: TENANT_ID,
    name: 'UAT Test Customer',
    email: `uat-test-${Date.now()}@example.com`,
    phone: '555-0123',
    eventDate: '2025-12-15',
    eventType: 'wedding',
    guestCount: 150,
    budget: '5000',
    status: 'inquiry'
  };

  const { response, data } = await makeRequest('POST', '/api/customers', customerData);
  
  if (response.ok) {
    results.customer = data;
    console.log('✅ Customer created:', data.id, data.name);
    return data;
  } else {
    const error = `Failed to create customer: ${response.status} - ${JSON.stringify(data)}`;
    results.errors.push(error);
    throw new Error(error);
  }
}

async function step2_createQuote(customer) {
  console.log('\n📋 STEP 2: Creating quote with 2 items...');
  
  const quoteData = {
    bakerId: BAKER_ID,
    tenantId: TENANT_ID,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    title: 'UAT Wedding Cake Quote',
    description: 'Three-tier wedding cake with fondant and sugar flowers',
    eventDate: '2025-12-15',
    eventType: 'wedding',
    guestCount: 150,
    deliveryAddress: '123 Wedding Venue Rd, City, ST 12345',
    setupTime: '2:00 PM',
    subtotal: '2500.00',
    taxRate: '0.0875',
    taxAmount: '218.75',
    total: '2718.75',
    depositAmount: '1359.38',
    depositPercentage: '50.00',
    validUntil: '2025-11-15',
    terms: 'Deposit required to secure date. Balance due 7 days before event.',
    status: 'draft'
  };

  const { response, data } = await makeRequest('POST', '/api/quotes', quoteData);
  
  if (response.ok) {
    results.quote = data.quote || data;
    console.log('✅ Quote created:', results.quote.id, results.quote.quoteNumber);
    
    // Add items
    const items = [
      {
        quoteId: results.quote.id,
        name: 'Three-Tier Wedding Cake',
        description: 'Vanilla and chocolate layers with buttercream',
        quantity: '1',
        unitPrice: '2000.00',
        totalPrice: '2000.00',
        category: 'cake'
      },
      {
        quoteId: results.quote.id,
        name: 'Sugar Flower Decorations',
        description: 'Handcrafted sugar roses and peonies',
        quantity: '1',
        unitPrice: '500.00',
        totalPrice: '500.00',
        category: 'decoration'
      }
    ];

    for (const item of items) {
      const { response: itemRes, data: itemData } = await makeRequest('POST', `/api/quotes/${results.quote.id}/items`, item);
      if (itemRes.ok) {
        console.log('  ✅ Item added:', itemData.name);
      }
    }

    return results.quote;
  } else {
    const error = `Failed to create quote: ${response.status} - ${JSON.stringify(data)}`;
    results.errors.push(error);
    throw new Error(error);
  }
}

async function step3_sendQuote(quote) {
  console.log('\n📧 STEP 3: Sending quote...');
  
  const { response, data } = await makeRequest('POST', `/api/quotes/${quote.id}/send`);
  
  if (response.ok) {
    console.log('✅ Quote sent successfully');
    
    // Get approval link
    const { response: linkRes, data: linkData } = await makeRequest('POST', `/api/quotes/${quote.id}/generate-approval-link`);
    if (linkRes.ok) {
      results.quoteApprovalUrl = linkData.approvalUrl;
      results.quoteShortlink = `${BASE_URL}/q/${quote.id}`;
      console.log('  📎 Approval URL:', results.quoteApprovalUrl);
      console.log('  🔗 Shortlink:', results.quoteShortlink);
    }
    
    return data.quote || data;
  } else {
    const error = `Failed to send quote: ${response.status} - ${JSON.stringify(data)}`;
    results.errors.push(error);
    throw new Error(error);
  }
}

async function step4_approveQuote(quote) {
  console.log('\n✅ STEP 4: Approving quote (public)...');
  
  // Extract token from approval URL or get from DB
  const tokenQuery = await fetch(`${BASE_URL}/api/quotes/${quote.id}`, {
    headers: { 'x-baker-token': BAKER_ID }
  });
  const quoteData = await tokenQuery.json();
  const token = quoteData.approvalToken;
  
  if (!token) {
    throw new Error('No approval token found');
  }

  // First, view the quote (should record 'viewed' event)
  console.log('  👁️  Viewing quote (public)...');
  const { response: viewRes, data: viewData } = await makeRequest('GET', `/api/quotes/approve/${token}`, null, false);
  
  if (viewRes.ok) {
    console.log('  ✅ Quote viewed, event should be recorded');
  }

  // Wait a moment for event to be recorded
  await new Promise(resolve => setTimeout(resolve, 500));

  // Approve the quote
  console.log('  ✅ Approving quote...');
  const { response: approveRes, data: approveData } = await makeRequest('POST', `/api/quotes/approve/${token}`, {}, false);
  
  if (approveRes.ok) {
    console.log('  ✅ Quote approved successfully');
    results.quote = approveData.quote;
    
    // Check if contract was created
    const { response: contractRes, data: contracts } = await makeRequest('GET', `/api/contracts?quoteId=${quote.id}`);
    if (contractRes.ok && contracts.length > 0) {
      results.contract = contracts[0];
      console.log('  ✅ Contract auto-created:', results.contract.id);
    } else {
      console.log('  ℹ️  No contract auto-created, will create manually');
    }
    
    return approveData.quote;
  } else {
    const error = `Failed to approve quote: ${approveRes.status} - ${JSON.stringify(approveData)}`;
    results.errors.push(error);
    throw new Error(error);
  }
}

async function step5_createAndSignContract(quote, customer) {
  console.log('\n📄 STEP 5: Creating and signing contract...');
  
  if (!results.contract) {
    // Create contract manually
    const contractData = {
      bakerId: BAKER_ID,
      tenantId: TENANT_ID,
      customerId: customer.id,
      quoteId: quote.id,
      title: 'Wedding Cake Contract',
      eventDate: '2025-12-15',
      totalAmount: quote.total,
      depositAmount: quote.depositAmount,
      status: 'draft'
    };

    const { response: createRes, data: createData } = await makeRequest('POST', '/api/contracts', contractData);
    if (createRes.ok) {
      results.contract = createData;
      console.log('  ✅ Contract created:', results.contract.id);
    } else {
      const error = `Failed to create contract: ${createRes.status} - ${JSON.stringify(createData)}`;
      results.errors.push(error);
      throw new Error(error);
    }
  }

  // Send contract
  console.log('  📧 Sending contract...');
  const { response: sendRes, data: sendData } = await makeRequest('POST', `/api/contracts/${results.contract.id}/send`);
  
  if (sendRes.ok) {
    console.log('  ✅ Contract sent');
    
    // Get approval token
    const { response: contractRes, data: contractData } = await makeRequest('GET', `/api/contracts/${results.contract.id}`);
    const token = contractData.approvalToken;
    
    if (token) {
      results.contractApprovalUrl = `${BASE_URL}/contract-approval/${token}`;
      results.contractShortlink = `${BASE_URL}/c/${results.contract.id}`;
      console.log('  📎 Contract approval URL:', results.contractApprovalUrl);
      console.log('  🔗 Contract shortlink:', results.contractShortlink);
    }

    // Sign contract (public)
    console.log('  ✍️  Signing contract...');
    const signatureData = {
      customerName: customer.name,
      customerEmail: customer.email,
      signedAt: new Date().toISOString()
    };

    const { response: signRes, data: signData } = await makeRequest('POST', `/api/contracts/sign/${token}`, signatureData, false);
    
    if (signRes.ok) {
      results.contract = signData.contract;
      console.log('  ✅ Contract signed successfully');
      
      // Check if invoice was created
      const { response: invoiceRes, data: invoices } = await makeRequest('GET', `/api/invoices?customerId=${customer.id}`);
      if (invoiceRes.ok && invoices.length > 0) {
        results.invoice = invoices[0];
        console.log('  ✅ Invoice auto-created:', results.invoice.id, `$${results.invoice.total}`);
      }
    } else {
      const error = `Failed to sign contract: ${signRes.status} - ${JSON.stringify(signData)}`;
      results.errors.push(error);
      console.log('  ❌', error);
    }
  }
}

async function step6_testInvoice() {
  console.log('\n💰 STEP 6: Testing invoice...');
  
  if (!results.invoice) {
    console.log('  ⚠️  No invoice found');
    return;
  }

  // Open invoice details
  const { response, data } = await makeRequest('GET', `/api/invoices/${results.invoice.id}`);
  
  if (response.ok) {
    console.log('  ✅ Invoice details loaded:', data.id);
    console.log('    - Status:', data.status);
    console.log('    - Total:', `$${data.total}`);
    console.log('    - Due Date:', data.dueDate);
  } else {
    results.errors.push(`Failed to load invoice: ${response.status}`);
  }

  // Try to create checkout session
  console.log('  💳 Testing Stripe checkout...');
  const { response: checkoutRes, data: checkoutData } = await makeRequest('POST', `/api/invoices/${results.invoice.id}/checkout`);
  
  if (checkoutRes.ok) {
    console.log('  ✅ Checkout session created:', checkoutData.sessionId?.substring(0, 20) + '...');
  } else if (checkoutRes.status === 404) {
    console.log('  ℹ️  Checkout endpoint not implemented');
  } else {
    console.log('  ⚠️  Checkout failed:', checkoutData);
  }
}

async function step7_verifyEvents() {
  console.log('\n📊 STEP 7: Verifying quote events...');
  
  if (!results.quote) return;

  const { response, data } = await makeRequest('GET', `/api/quotes/${results.quote.id}/events`);
  
  if (response.ok) {
    results.events = data;
    console.log(`  ✅ Found ${data.length} events:`);
    data.forEach(event => {
      console.log(`    - ${event.event} at ${event.createdAt}`);
    });
  }
}

async function runUAT() {
  console.log('🚀 Starting UAT Test - Full Customer Journey\n');
  console.log('=' .repeat(60));

  try {
    const customer = await step1_createCustomer();
    const quote = await step2_createQuote(customer);
    await step3_sendQuote(quote);
    await step4_approveQuote(quote);
    await step5_createAndSignContract(quote, customer);
    await step6_testInvoice();
    await step7_verifyEvents();

    console.log('\n' + '='.repeat(60));
    console.log('\n📈 UAT TEST RESULTS\n');
    
    // Print results table
    console.log('QUOTE:');
    console.log(`  ID:          ${results.quote?.id || 'N/A'}`);
    console.log(`  Status:      ${results.quote?.status || 'N/A'}`);
    console.log(`  Viewed At:   ${results.quote?.viewedAt || 'N/A'}`);
    console.log(`  Approved At: ${results.quote?.approvedAt || 'N/A'}`);

    console.log('\nCONTRACT:');
    console.log(`  ID:          ${results.contract?.id || 'N/A'}`);
    console.log(`  Status:      ${results.contract?.status || 'N/A'}`);
    console.log(`  Signed At:   ${results.contract?.signedAt || 'N/A'}`);

    console.log('\nINVOICE:');
    console.log(`  ID:          ${results.invoice?.id || 'N/A'}`);
    console.log(`  Status:      ${results.invoice?.status || 'N/A'}`);
    console.log(`  Total:       $${results.invoice?.total || '0.00'}`);

    console.log('\nEVENTS:', results.events.length);
    results.events.forEach(e => {
      console.log(`  - ${e.event} (${new Date(e.createdAt).toLocaleString()})`);
    });

    console.log('\nURLs:');
    console.log(`  Quote Approval:    ${results.quoteApprovalUrl || 'N/A'}`);
    console.log(`  Quote Shortlink:   ${results.quoteShortlink || 'N/A'}`);
    console.log(`  Contract Approval: ${results.contractApprovalUrl || 'N/A'}`);
    console.log(`  Contract Shortlink: ${results.contractShortlink || 'N/A'}`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ ALL TESTS PASSED!');
    }

  } catch (error) {
    console.error('\n❌ UAT FAILED:', error.message);
    console.error('\nPartial results:', JSON.stringify(results, null, 2));
  }
}

// Run the test
runUAT().catch(console.error);
