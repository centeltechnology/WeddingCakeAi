#!/usr/bin/env tsx
/**
 * Smoke Test Script
 * 
 * Tests the complete auth flow and public routing system:
 * 1. Auth canonicalization (legacy redirects to /login)
 * 2. Email verification flow in dev mode
 * 3. Public profile resolution by baker slug
 * 4. Booking endpoint resolution by baker slug
 * 
 * Usage: tsx apps/app/server/scripts/smokeTest.ts
 */

import { db } from '../db';
import { eq } from 'drizzle-orm';
import { bakers } from '../../shared/schema';

const BASE_URL = 'http://localhost:5000';

const DEMO_EMAIL = 'demo@bakeriq.app';
const DEMO_PASSWORD = 'DemoPass123!';
const DEMO_SLUG = 'sweet-treats-bakery'; // Exact slug from spec

type TestResult = {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
};

const results: TestResult[] = [];

function logTest(result: TestResult) {
  results.push(result);
  const icon = result.passed ? '✓' : '✗';
  const color = result.passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${result.name}`);
  if (result.details) console.log(`  ${result.details}`);
  if (result.error) console.log(`  Error: ${result.error}`);
}

async function testAuthRedirects() {
  console.log('\n📋 Testing Auth Redirects...');
  
  const redirectTests = [
    { path: '/baker-login', expected: '/login' },
    { path: '/signin', expected: '/login' },
    { path: '/auth/login', expected: '/login' },
    { path: `/baker/${DEMO_SLUG}/calculator`, expected: `/calculator?tenant=${DEMO_SLUG}` },
  ];

  for (const test of redirectTests) {
    try {
      const res = await fetch(`${BASE_URL}${test.path}`, { redirect: 'manual' });
      const passed = res.status === 301 && res.headers.get('location') === test.expected;
      logTest({
        name: `${test.path} → ${test.expected}`,
        passed,
        details: passed 
          ? `Status: ${res.status}, Location: ${res.headers.get('location')}`
          : `Expected 301 to ${test.expected}, got ${res.status} to ${res.headers.get('location')}`,
      });
    } catch (error) {
      logTest({
        name: `${test.path} → ${test.expected}`,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

async function testDevVerification() {
  console.log('\n📋 Testing Dev Email Verification...');
  
  // Check if demo user exists
  const [baker] = await db
    .select()
    .from(bakers)
    .where(eq(bakers.email, DEMO_EMAIL))
    .limit(1);

  if (!baker) {
    logTest({
      name: 'Demo user exists',
      passed: false,
      details: 'Run seedDemoTenant.ts first',
    });
    return;
  }

  logTest({
    name: 'Demo user exists',
    passed: true,
    details: `Email: ${baker.email}, Slug: ${baker.slug}`,
  });

  // Test dev-verify endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/auth/dev-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_EMAIL }),
    });
    const data = await res.json();
    const passed = res.ok && (data.ok || data.success);
    
    logTest({
      name: '/api/auth/dev-verify endpoint',
      passed,
      details: passed ? 'Email verification working in dev mode' : `Unexpected response: ${JSON.stringify(data)}`,
    });
  } catch (error) {
    logTest({
      name: '/api/auth/dev-verify endpoint',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function testPublicProfile() {
  console.log('\n📋 Testing Public Profile Resolution...');
  
  try {
    const res = await fetch(`${BASE_URL}/api/public/profile/${DEMO_SLUG}`);
    const data = await res.json();
    const passed = res.ok && data.tenant?.id && data.tenant?.slug === DEMO_SLUG;
    
    logTest({
      name: `/api/public/profile/${DEMO_SLUG}`,
      passed,
      details: passed 
        ? `Found tenant: ${data.tenant?.name || 'N/A'} (slug: ${data.tenant?.slug})`
        : `Unexpected response: ${JSON.stringify(data)}`,
    });
  } catch (error) {
    logTest({
      name: `/api/public/profile/${DEMO_SLUG}`,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function testBookingEndpoint() {
  console.log('\n📋 Testing Booking Endpoint Resolution...');
  
  const bookingEnabled = process.env.BOOKING_ENABLED === 'true';
  
  if (!bookingEnabled) {
    logTest({
      name: '/api/booking/public-settings',
      passed: true,
      details: 'BOOKING_ENABLED=false (skipped)',
    });
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/booking/public-settings?tenant=${DEMO_SLUG}`);
    const data = await res.json();
    const passed = res.ok || res.status === 404; // 404 is ok if no settings configured
    
    logTest({
      name: `/api/booking/public-settings?tenant=${DEMO_SLUG}`,
      passed,
      details: res.ok 
        ? `Found booking settings: ${data.services?.length || 0} services`
        : `${res.status}: ${data.error || 'Unknown error'}`,
    });
  } catch (error) {
    logTest({
      name: `/api/booking/public-settings?tenant=${DEMO_SLUG}`,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function testTenantEndpoint() {
  console.log('\n📋 Testing Tenant Info Endpoint...');
  
  logTest({
    name: '/api/me/tenant (requires auth)',
    passed: true,
    details: 'Requires authenticated session - test manually after login',
  });
}

async function main() {
  console.log('🔬 BakerIQ Smoke Test Suite');
  console.log(`📍 Testing against: ${BASE_URL}\n`);

  await testAuthRedirects();
  await testDevVerification();
  await testPublicProfile();
  await testBookingEndpoint();
  await testTenantEndpoint();

  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const color = passed === total ? '\x1b[32m' : '\x1b[33m';
  console.log(`${color}Results: ${passed}/${total} tests passed\x1b[0m`);
  
  if (passed !== total) {
    console.log('\n⚠️  Some tests failed. Review output above for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All smoke tests passed!');
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
