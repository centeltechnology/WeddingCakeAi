#!/usr/bin/env tsx
/**
 * Security Features Test Suite
 * Tests refresh tokens, rate limiting, and health checks
 */

import { logger } from '../lib/logger.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'password123';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const results: TestResult[] = [];

function logTest(name: string, status: 'PASS' | 'FAIL', message: string) {
  results.push({ name, status, message });
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name}: ${message}`);
}

async function testRefreshTokenFlow() {
  console.log('\n🔐 Testing Refresh Token Flow...\n');

  try {
    // Step 1: Login
    const loginRes = await fetch(`${BASE_URL}/api/bakers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      credentials: 'include'
    });

    if (!loginRes.ok) {
      logTest('Refresh Token Flow', 'FAIL', `Login failed: ${loginRes.status}`);
      return;
    }

    const loginData = await loginRes.json();
    const cookies = loginRes.headers.get('set-cookie');
    
    if (!cookies || !cookies.includes('refresh_token')) {
      logTest('Refresh Token Flow', 'FAIL', 'No refresh token cookie received');
      return;
    }

    logTest('Login with Refresh Token', 'PASS', 'User logged in, refresh token cookie set');

    // Step 2: Extract refresh token from cookie
    const refreshTokenMatch = cookies.match(/refresh_token=([^;]+)/);
    if (!refreshTokenMatch) {
      logTest('Refresh Token Flow', 'FAIL', 'Could not extract refresh token');
      return;
    }

    const refreshToken = refreshTokenMatch[1];

    // Step 3: Use refresh token to get new access token
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`
      }
    });

    if (!refreshRes.ok) {
      logTest('Token Refresh', 'FAIL', `Refresh failed: ${refreshRes.status}`);
      return;
    }

    const refreshData = await refreshRes.json();
    if (!refreshData.user || !refreshData.user.id) {
      logTest('Token Refresh', 'FAIL', 'No user data in refresh response');
      return;
    }

    logTest('Token Refresh', 'PASS', 'Successfully refreshed access token');

    // Step 4: Try using old refresh token (should fail - rotation)
    const oldTokenRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`
      }
    });

    if (oldTokenRes.ok) {
      logTest('Token Rotation', 'FAIL', 'Old refresh token still works (should be invalidated)');
    } else {
      logTest('Token Rotation', 'PASS', 'Old refresh token properly invalidated');
    }

    // Step 5: Logout
    const newRefreshCookie = refreshRes.headers.get('set-cookie');
    const newRefreshMatch = newRefreshCookie?.match(/refresh_token=([^;]+)/);
    const newRefreshToken = newRefreshMatch ? newRefreshMatch[1] : refreshToken;

    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${newRefreshToken}`
      }
    });

    if (logoutRes.ok) {
      logTest('Logout Cleanup', 'PASS', 'User logged out successfully');
    } else {
      logTest('Logout Cleanup', 'FAIL', `Logout failed: ${logoutRes.status}`);
    }

  } catch (error) {
    logTest('Refresh Token Flow', 'FAIL', `Error: ${error}`);
  }
}

async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting...\n');

  try {
    const requests = [];
    const maxAttempts = 10; // Rate limit is 5 per 15 min

    // Make rapid login attempts
    for (let i = 0; i < maxAttempts; i++) {
      requests.push(
        fetch(`${BASE_URL}/api/bakers/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'fake@test.com', password: 'wrong' })
        })
      );
    }

    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status);

    // Count how many were rate limited (429)
    const rateLimited = statuses.filter(s => s === 429).length;
    const successful = statuses.filter(s => s !== 429).length;

    if (rateLimited > 0) {
      logTest('Rate Limiting', 'PASS', `Blocked ${rateLimited}/${maxAttempts} excessive requests`);
    } else {
      logTest('Rate Limiting', 'FAIL', 'No requests were rate limited');
    }

  } catch (error) {
    logTest('Rate Limiting', 'FAIL', `Error: ${error}`);
  }
}

async function testHealthChecks() {
  console.log('\n🏥 Testing Health Checks...\n');

  try {
    // Test basic health check
    const basicRes = await fetch(`${BASE_URL}/healthz`);
    if (basicRes.ok) {
      const data = await basicRes.json();
      if (data.status === 'healthy' || data.status === 'ok') {
        logTest('Basic Health Check', 'PASS', 'Service is healthy');
      } else {
        logTest('Basic Health Check', 'FAIL', `Unexpected status: ${data.status}`);
      }
    } else {
      logTest('Basic Health Check', 'FAIL', `Failed: ${basicRes.status}`);
    }

    // Test detailed health check
    const detailedRes = await fetch(`${BASE_URL}/health/detailed`);
    if (detailedRes.ok) {
      const data = await detailedRes.json();
      const hasDb = data.checks?.database !== undefined;
      const hasMemory = data.checks?.memory !== undefined;
      
      if (hasDb && hasMemory) {
        logTest('Detailed Health Check', 'PASS', 'All health metrics reported');
      } else {
        logTest('Detailed Health Check', 'FAIL', 'Missing health metrics');
      }
    } else {
      logTest('Detailed Health Check', 'FAIL', `Failed: ${detailedRes.status}`);
    }

  } catch (error) {
    logTest('Health Checks', 'FAIL', `Error: ${error}`);
  }
}

async function testSessionSecurity() {
  console.log('\n🍪 Testing Session Cookie Security...\n');

  try {
    const loginRes = await fetch(`${BASE_URL}/api/bakers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });

    const cookies = loginRes.headers.get('set-cookie');
    
    if (!cookies) {
      logTest('Session Cookies', 'FAIL', 'No cookies received');
      return;
    }

    // Check for security flags
    const hasHttpOnly = cookies.includes('HttpOnly');
    const hasSameSite = cookies.includes('SameSite');
    const hasSecure = cookies.includes('Secure') || process.env.NODE_ENV === 'development';

    if (hasHttpOnly && hasSameSite) {
      logTest('Cookie Security Flags', 'PASS', 'HttpOnly and SameSite flags present');
    } else {
      const missing = [];
      if (!hasHttpOnly) missing.push('HttpOnly');
      if (!hasSameSite) missing.push('SameSite');
      logTest('Cookie Security Flags', 'FAIL', `Missing: ${missing.join(', ')}`);
    }

  } catch (error) {
    logTest('Session Security', 'FAIL', `Error: ${error}`);
  }
}

async function ensureTestUserVerified() {
  try {
    // Try to verify test user email using dev endpoint
    await fetch(`${BASE_URL}/api/auth/dev-verify?email=${encodeURIComponent(TEST_EMAIL)}`);
    console.log('✓ Test user email verified\n');
  } catch (error) {
    console.log('Note: Could not auto-verify test user email');
  }
}

async function main() {
  console.log('🔒 Security Test Suite');
  console.log('='.repeat(50));

  // Ensure test user is verified
  await ensureTestUserVerified();

  await testRefreshTokenFlow();
  await testRateLimiting();
  await testHealthChecks();
  await testSessionSecurity();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All security tests passed!');
    process.exit(0);
  }
}

main().catch(console.error);
