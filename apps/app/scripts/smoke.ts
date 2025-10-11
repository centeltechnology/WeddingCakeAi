import fetch from 'node-fetch';

async function check(path: string, method = 'GET', body?: any) {
  const r = await fetch('http://localhost:5000' + path, { 
    method, 
    headers: { 'Content-Type': 'application/json' }, 
    body: body ? JSON.stringify(body) : undefined 
  });
  return { path, ok: r.ok, status: r.status, text: await r.text() };
}

(async () => {
  const tests = [
    ['/healthz'],
    ['/api/app/stats'],
    ['/api/quotes'],
    ['/api/contracts'],
    ['/api/invoices'],
    ['/api/leads'],
    ['/api/ai/suggest-items', 'POST', {}],
    ['/api/ai/summarize-quote', 'POST', {}],
    ['/api/ai/generate-contract', 'POST', {}],
    ['/api/booking/public-settings'],
    ['/api/me/profile'],
    ['/api/me/tenant'],
    ['/api/media'],
  ];
  
  const out = [];
  for (const [p, m, b] of tests) {
    out.push(await check(p as string, m as any, b));
  }
  
  console.table(out.map(x => ({ path: x.path, ok: x.ok, status: x.status })));
  
  const fails = out.filter(x => !x.ok);
  if (fails.length) {
    console.error('FAILS:', fails.map(f => f.path));
    process.exit(1);
  }
  
  console.log('SMOKE PASS ✅');
})();
