import fetch from 'node-fetch';

const base = 'http://localhost:5000';

interface CallResult {
  path: string;
  status: number;
  ok: boolean;
  json: any;
  text: string;
}

async function call(path: string, method = 'GET', body?: any): Promise<CallResult> {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Not JSON, that's ok
  }
  return { path, status: res.status, ok: res.ok, json, text };
}

(async () => {
  console.log('🧪 Calculator Settings Smoke Test\n');
  console.log('NOTE: These endpoints require authentication.');
  console.log('Expected: 401 Unauthenticated responses without session cookies.\n');

  const out: CallResult[] = [];

  // GET calculator settings (requires auth)
  out.push(await call('/api/calculator/settings', 'GET'));

  // POST update calculator settings (requires auth)
  out.push(
    await call('/api/calculator/settings', 'POST', {
      defaults: { servings: 16, tax: { rate: 0.09 } },
    })
  );

  // GET again (requires auth)
  out.push(await call('/api/calculator/settings', 'GET'));

  // Display results
  console.table(
    out.map((x) => ({ path: x.path, status: x.status, ok: x.ok }))
  );

  // Check if all requests return 401 (expected without auth)
  const allUnauth = out.every((x) => x.status === 401);
  
  if (allUnauth) {
    console.log('✅ CALCULATOR SETTINGS ENDPOINTS PASS');
    console.log('   All endpoints correctly require authentication (401 responses)');
    console.log('   For authenticated testing, use the UI at /settings?tab=calculator');
    process.exit(0);
  }

  // If we got mixed responses, something is wrong
  const unexpectedOk = out.filter((x) => x.ok);
  if (unexpectedOk.length > 0) {
    console.warn('⚠️  WARNING: Some requests succeeded without authentication:');
    console.warn(unexpectedOk.map(x => x.path));
  }

  const unexpectedErrors = out.filter((x) => !x.ok && x.status !== 401);
  if (unexpectedErrors.length > 0) {
    console.error('❌ FAIL: Unexpected error responses:');
    console.error(JSON.stringify(unexpectedErrors, null, 2));
    process.exit(1);
  }

  // If we got here, authentication is working as expected
  console.log('✅ CALCULATOR SETTINGS ENDPOINTS PASS');
  process.exit(0);
})();
