import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authCookie = '';
let customerId = '';

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
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}

    return {
      ok: response.ok,
      status: response.status,
      text,
      json,
      headers: response.headers,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      text: error.message,
      json: null,
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
    {
      name: 'Get Customers List',
      path: '/api/customers',
      method: 'GET',
      validate: (response: any) => {
        if (response.json && Array.isArray(response.json)) {
          if (response.json.length > 0) {
            customerId = response.json[0].id;
          }
          return true;
        }
        return false;
      }
    },
    {
      name: 'Upsert Customer (New)',
      path: '/api/customers/upsert',
      method: 'POST',
      body: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '555-1234'
      },
      validate: (response: any) => {
        if (response.json?.customer?.id) {
          customerId = response.json.customer.id;
          return true;
        }
        return false;
      }
    },
    {
      name: 'Upsert Customer (Update)',
      path: '/api/customers/upsert',
      method: 'POST',
      body: () => ({
        id: customerId,
        name: 'Test Customer Updated',
        email: 'test@example.com',
        phone: '555-5678'
      }),
      validate: (response: any) => {
        return response.json?.customer?.phone === '555-5678';
      }
    },
    {
      name: 'Save Estimate as Quote',
      path: '/api/estimates/save-as-quote',
      method: 'POST',
      body: () => ({
        customer: {
          id: customerId,
          name: 'Test Customer Updated',
          email: 'test@example.com',
          phone: '555-5678'
        },
        title: 'Test Quote from Calculator',
        items: [
          { name: '3-Tier Wedding Cake', qty: 1, unit: 'ea', price: 350, notes: 'Vanilla with buttercream' },
          { name: 'Cake Topper', qty: 1, unit: 'ea', price: 50, notes: 'Custom design' }
        ],
        taxRate: 0.0875,
        discount: 25,
        depositPct: 0.5,
        notes: 'Test quote from smoke test'
      }),
      validate: (response: any) => {
        return response.json?.quoteId;
      }
    },
  ];

  console.log('🧪 Running Baker Calculator smoke tests...\n');

  for (const test of tests) {
    const body = typeof test.body === 'function' ? test.body() : test.body;
    const response = await request(test.path, test.method, body);
    
    let isPassing = response.ok;
    
    if (isPassing && test.validate) {
      isPassing = test.validate(response);
    }

    results.push({
      name: test.name,
      path: test.path,
      method: test.method,
      status: isPassing ? 'PASS' : 'FAIL',
      code: response.status,
      error: isPassing ? undefined : response.text.substring(0, 150),
    });
  }

  return results;
}

function printResults(results: TestResult[]) {
  console.log('\n📊 Baker Calculator Test Results:\n');

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.method} ${result.path} - ${result.code || 'N/A'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log();
  });

  console.log(`\n📈 Summary: ${passCount} passed, ${failCount} failed\n`);

  return failCount === 0;
}

async function main() {
  console.log('🚀 Baker Calculator Smoke Test\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  const authenticated = await login();
  if (!authenticated) {
    process.exit(1);
  }

  const results = await runTests();
  const success = printResults(results);

  process.exit(success ? 0 : 1);
}

main();
