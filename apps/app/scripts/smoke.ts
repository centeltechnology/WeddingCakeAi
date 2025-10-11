import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authCookie = '';

interface TestResult {
  name: string;
  path: string;
  method: string;
  status: 'PASS' | 'FAIL';
  code?: number;
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
    return {
      ok: response.ok,
      status: response.status,
      text,
      headers: response.headers,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      text: error.message,
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
  console.error('Response:', response.status, response.text);
  return false;
}

async function runTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const tests = [
    // Health & Public Endpoints
    { name: 'Health Check', path: '/healthz', method: 'GET' },
    { name: 'App Stats', path: '/api/app/stats', method: 'GET' },
    
    // Core Features
    { name: 'List Quotes', path: '/api/quotes', method: 'GET' },
    { name: 'List Contracts', path: '/api/contracts', method: 'GET' },
    { name: 'List Invoices', path: '/api/invoices', method: 'GET' },
    { name: 'List Leads', path: '/api/leads', method: 'GET' },
    { name: 'Sample Leads', path: '/api/leads/sample', method: 'GET' },
    
    // AI Lab
    { name: 'AI Suggest Items', path: '/api/ai/suggest-items', method: 'POST', body: {} },
    { name: 'AI Summarize Quote', path: '/api/ai/summarize-quote', method: 'POST', body: {} },
    { name: 'AI Generate Contract', path: '/api/ai/generate-contract', method: 'POST', body: {} },
    
    // Settings & Profile
    { name: 'Business Profile', path: '/api/me/profile', method: 'GET' },
    { name: 'Tenant Info', path: '/api/me/tenant', method: 'GET' },
    { name: 'Media Library', path: '/api/media', method: 'GET' },
    { name: 'Templates List', path: '/api/templates', method: 'GET' },
    
    // Booking
    { name: 'Booking Public Settings', path: '/api/booking/public-settings', method: 'GET' },
    { name: 'Booking Settings', path: '/api/booking/settings', method: 'GET' },
    
    // Calculator
    { 
      name: 'Calculator Estimate', 
      path: '/api/calculator/estimate', 
      method: 'POST', 
      body: { servings: 50, complexity: 'standard', rush: false, deliveryMiles: 10 }
    },
  ];

  console.log('🧪 Running smoke tests...\n');

  for (const test of tests) {
    const response = await request(test.path, test.method, test.body);
    
    results.push({
      name: test.name,
      path: test.path,
      method: test.method,
      status: response.ok ? 'PASS' : 'FAIL',
      code: response.status,
      error: response.ok ? undefined : response.text.substring(0, 100),
    });
  }

  return results;
}

function printResults(results: TestResult[]) {
  console.log('\n📊 Test Results:\n');
  
  console.table(results.map(r => ({
    Test: r.name,
    Path: r.path,
    Method: r.method,
    Status: r.status,
    Code: r.code,
  })));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`   ${r.name} (${r.method} ${r.path}) - Code ${r.code}`);
        if (r.error) {
          console.log(`      Error: ${r.error}`);
        }
      });
  }
}

async function main() {
  console.log('🚀 BakerIQ Smoke Test\n');

  const authenticated = await login();
  if (!authenticated) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  const results = await runTests();
  printResults(results);

  const failed = results.filter(r => r.status === 'FAIL').length;
  
  if (failed > 0) {
    console.log('\n❌ SMOKE TEST FAILED');
    process.exit(1);
  }

  console.log('\n✅ SMOKE TEST PASSED');
  process.exit(0);
}

main().catch(error => {
  console.error('💥 Smoke test crashed:', error);
  process.exit(1);
});
