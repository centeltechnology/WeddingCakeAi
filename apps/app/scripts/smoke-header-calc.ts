import fetch from 'node-fetch';
const base = 'http://localhost:5000';

async function check(path: string) {
  const r = await fetch(base + path, { method: 'GET', redirect: 'manual' });
  return { path, status: r.status, loc: r.headers.get('location') || '' };
}

(async () => {
  const rows = [];
  rows.push(await check('/baker/sweet-treats-bakery/calculator')); // should 301 -> /calculator?tenant=...
  rows.push(await check('/calculator?tenant=sweet-treats-bakery')); // should be 200 (no redirect)
  console.table(rows);
  const bad = rows.find(r => !(r.path.includes('/baker/') ? r.status === 301 : r.status === 200));
  if (bad) {
    console.error('HEADER CALC LINK FAIL ❌');
    process.exit(1);
  }
  console.log('HEADER CALC LINK PASS ✅');
})();
