# BakerIQ Test Suite

## Overview
Comprehensive testing infrastructure using Playwright for both E2E and API testing.

## Setup
```bash
npm install
npx playwright install chromium
```

## Running Tests

### All Tests
```bash
npm test
```

### E2E Tests Only
```bash
npm run test:e2e
```

### API Tests Only
```bash
npm run test:api
```

### Interactive UI Mode
```bash
npm run test:ui
```

### View Test Report
```bash
npm run test:report
```

## Test Structure

### E2E Tests (`tests/e2e/`)
- `auth.spec.ts` - Authentication flows (login, validation, redirects)
- `quote-flow.spec.ts` - Quote creation and management workflows

### API Tests (`tests/api/`)
- `health.test.ts` - Health check and diagnostics endpoints
- `quotes.test.ts` - Quote API CRUD operations

## Writing New Tests

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('feature name', async ({ page }) => {
  await page.goto('/your-page');
  await expect(page.locator('h1')).toContainText('Expected Text');
});
```

### API Test Example
```typescript
import { test, expect } from '@playwright/test';

test('API endpoint', async ({ request }) => {
  const response = await request.get('/api/endpoint');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data).toBeDefined();
});
```

## Configuration
- Configuration file: `playwright.config.ts`
- Base URL: `http://localhost:5000`
- Test directory: `./tests`
- Reporter: HTML report (viewable with `npm run test:report`)

## CI/CD Integration
Tests are configured for CI environments with:
- Retry on failure (2 retries in CI)
- Serial execution in CI (parallel in local)
- Automatic server startup via webServer config
