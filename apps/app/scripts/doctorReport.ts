#!/usr/bin/env tsx
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  category: string;
  status: 'PASS' | 'FAIL';
  details: string[];
  missing?: string[];
}

const results: CheckResult[] = [];

// 1. Check ENV FLAGS
function checkEnvFlags(): CheckResult {
  const details: string[] = [];
  const missing: string[] = [];
  
  // Check VITE flags
  const viteEnvPath = join(process.cwd(), 'client/.env');
  if (existsSync(viteEnvPath)) {
    const viteEnv = readFileSync(viteEnvPath, 'utf-8');
    if (!viteEnv.includes('VITE_DEMO_MODE=true')) missing.push('VITE_DEMO_MODE=true in client/.env');
    if (!viteEnv.includes('VITE_AI_ENABLED=true')) missing.push('VITE_AI_ENABLED=true in client/.env');
  } else {
    missing.push('client/.env file');
  }
  
  // Check server env
  const serverEnvPath = join(process.cwd(), 'server/.env');
  if (existsSync(serverEnvPath)) {
    const serverEnv = readFileSync(serverEnvPath, 'utf-8');
    if (!serverEnv.includes('DEMO_MODE=true')) missing.push('DEMO_MODE=true in server/.env');
  } else {
    // Check root .env or process.env
    if (!process.env.DEMO_MODE) {
      details.push('⚠️  DEMO_MODE not set (check Replit secrets or .env)');
    } else {
      details.push(`✓ DEMO_MODE=${process.env.DEMO_MODE}`);
    }
  }
  
  return {
    category: 'ENV FLAGS',
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    details,
    missing
  };
}

// 2. Check CLIENT ROUTES
function checkClientRoutes(): CheckResult {
  const details: string[] = [];
  const missing: string[] = [];
  
  const appTsxPath = join(process.cwd(), 'client/src/App.tsx');
  if (!existsSync(appTsxPath)) {
    return {
      category: 'CLIENT ROUTES',
      status: 'FAIL',
      details: ['client/src/App.tsx not found'],
      missing: ['client/src/App.tsx']
    };
  }
  
  const appTsx = readFileSync(appTsxPath, 'utf-8');
  
  const requiredRoutes = [
    { path: '/baker/dashboard', component: 'Dashboard' },
    { path: '/quotes', component: 'QuoteList' },
    { path: '/contracts', component: 'ContractsList' },
    { path: '/invoices', component: 'InvoiceList' },
    { path: '/ai-lab', component: 'AILab' }
  ];
  
  for (const route of requiredRoutes) {
    if (!appTsx.includes(route.path)) {
      missing.push(`Route: ${route.path}`);
    } else {
      details.push(`✓ ${route.path}`);
    }
  }
  
  return {
    category: 'CLIENT ROUTES',
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    details,
    missing
  };
}

// 3. Check SERVER ENDPOINTS
function checkServerEndpoints(): CheckResult {
  const details: string[] = [];
  const missing: string[] = [];
  
  const routesPath = join(process.cwd(), 'server/routes.ts');
  if (!existsSync(routesPath)) {
    return {
      category: 'SERVER ENDPOINTS',
      status: 'FAIL',
      details: ['server/routes.ts not found'],
      missing: ['server/routes.ts']
    };
  }
  
  const routes = readFileSync(routesPath, 'utf-8');
  
  const requiredEndpoints = [
    'GET /api/quotes',
    'POST /api/quotes/:id/approve',
    'GET /api/contracts',
    'POST /api/contracts/:id/sign',
    'GET /api/invoices',
    'POST /api/invoices',
    'POST /api/invoices/:id/paid',
    'GET /api/contracts/:id/events',
    'GET /api/invoices/:id/events',
    'GET /api/charts/quote-pipeline',
    'POST /api/ai/suggest-items',
    'POST /api/ai/summarize-quote',
    'POST /api/ai/generate-contract'
  ];
  
  for (const endpoint of requiredEndpoints) {
    const [method, path] = endpoint.split(' ');
    const pattern = path.replace(/:\w+/g, ':\\w+');
    const regex = new RegExp(`app\\.${method.toLowerCase()}\\(['"\`]${pattern.replace(/\//g, '\\/')}`);
    
    if (!regex.test(routes)) {
      missing.push(endpoint);
    } else {
      details.push(`✓ ${endpoint}`);
    }
  }
  
  return {
    category: 'SERVER ENDPOINTS',
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    details,
    missing
  };
}

// 4. Check EVENT TRACKING
function checkEventTracking(): CheckResult {
  const details: string[] = [];
  const missing: string[] = [];
  
  // Check contracts service
  const contractsServicePath = join(process.cwd(), 'server/services/contracts.ts');
  if (existsSync(contractsServicePath)) {
    const contractsService = readFileSync(contractsServicePath, 'utf-8');
    if (contractsService.includes('contractEvents') && contractsService.includes("type: 'created'")) {
      details.push('✓ Contract created event tracking');
    } else {
      missing.push('Contract created event in services/contracts.ts');
    }
  } else {
    missing.push('server/services/contracts.ts');
  }
  
  // Check invoices service
  const invoicesServicePath = join(process.cwd(), 'server/services/invoices.ts');
  if (existsSync(invoicesServicePath)) {
    const invoicesService = readFileSync(invoicesServicePath, 'utf-8');
    if (invoicesService.includes('invoiceEvents') && invoicesService.includes("type: 'created'")) {
      details.push('✓ Invoice created event tracking');
    } else {
      missing.push('Invoice created event in services/invoices.ts');
    }
  } else {
    missing.push('server/services/invoices.ts');
  }
  
  // Check routes for signed/paid events
  const routesPath = join(process.cwd(), 'server/routes.ts');
  if (existsSync(routesPath)) {
    const routes = readFileSync(routesPath, 'utf-8');
    
    if (routes.includes("type: 'signed'") && routes.includes('contractEvents')) {
      details.push('✓ Contract signed event tracking');
    } else {
      missing.push('Contract signed event in routes.ts');
    }
    
    if (routes.includes("type: 'paid'") && routes.includes('invoiceEvents')) {
      details.push('✓ Invoice paid event tracking');
    } else {
      missing.push('Invoice paid event in routes.ts');
    }
  }
  
  return {
    category: 'EVENT TRACKING',
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    details,
    missing
  };
}

// 5. Check NAV & LAYOUT
async function checkNavLayout(): Promise<CheckResult> {
  const details: string[] = [];
  const missing: string[] = [];
  
  const pagesDir = join(process.cwd(), 'client/src/pages');
  if (!existsSync(pagesDir)) {
    return {
      category: 'NAV & LAYOUT',
      status: 'FAIL',
      details: ['client/src/pages directory not found'],
      missing: ['client/src/pages']
    };
  }
  
  // Check for AppLayout usage
  const { execSync } = await import('child_process');
  try {
    const appLayoutCount = execSync('grep -r "import.*AppLayout" client/src/pages/ 2>/dev/null | wc -l', { 
      cwd: process.cwd(),
      encoding: 'utf-8' 
    }).trim();
    
    const appShellCount = execSync('grep -r "import.*AppShell" client/src/pages/ 2>/dev/null | wc -l', { 
      cwd: process.cwd(),
      encoding: 'utf-8' 
    }).trim();
    
    details.push(`✓ ${appLayoutCount} pages using AppLayout`);
    
    if (parseInt(appShellCount) > 0) {
      missing.push(`${appShellCount} pages still using legacy AppShell`);
    }
    
    // Check if enforcement script exists
    const enforceScriptPath = join(process.cwd(), 'scripts/enforceAppLayout.ts');
    if (existsSync(enforceScriptPath)) {
      details.push('✓ enforceAppLayout.ts exists');
    } else {
      missing.push('scripts/enforceAppLayout.ts');
    }
    
  } catch (error) {
    details.push('⚠️  Could not count AppLayout usage');
  }
  
  return {
    category: 'NAV & LAYOUT',
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    details,
    missing
  };
}

// Run all checks
console.log('\n' + '='.repeat(60));
console.log('🏥  BAKERIQ SYSTEM DOCTOR REPORT');
console.log('='.repeat(60) + '\n');

results.push(checkEnvFlags());
results.push(checkClientRoutes());
results.push(checkServerEndpoints());
results.push(checkEventTracking());
results.push(await checkNavLayout());

// Print results
for (const result of results) {
  const statusIcon = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${statusIcon} ${result.category}: ${result.status}`);
  
  if (result.details.length > 0) {
    result.details.forEach(detail => console.log(`   ${detail}`));
  }
  
  if (result.missing && result.missing.length > 0) {
    console.log(`   Missing:`);
    result.missing.forEach(item => console.log(`      - ${item}`));
  }
  
  console.log('');
}

// Overall summary
const allPass = results.every(r => r.status === 'PASS');
console.log('='.repeat(60));
console.log(`\n📊 OVERALL: ${allPass ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}\n`);

if (!allPass) {
  console.log('🔧 NEXT ACTIONS:');
  console.log('   1. Run: pnpm tsx apps/app/scripts/enforceAppLayout.ts --write');
  console.log('   2. Run: pnpm tsx apps/app/scripts/routesDoctor.ts');
  console.log('   3. Run: pnpm tsx apps/app/server/scripts/backfillContractInvoiceEvents.ts');
  console.log('   4. Run: pnpm -w -r build');
  console.log('   5. Re-run this report\n');
}

console.log('='.repeat(60) + '\n');

process.exit(allPass ? 0 : 1);
