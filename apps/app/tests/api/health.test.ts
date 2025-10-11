import { test, expect } from '@playwright/test';

test.describe('Health Endpoints', () => {
  test('GET /healthz returns ok status', async ({ request }) => {
    const response = await request.get('/healthz');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.version).toBeDefined();
    expect(data.now).toBeDefined();
  });

  test('GET /api/doctor returns diagnostics', async ({ request }) => {
    const response = await request.get('/api/doctor');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.version).toBeDefined();
    expect(data.flags).toBeDefined();
    expect(data.metrics).toBeDefined();
    expect(data.counts).toBeDefined();
    expect(data.latestEvents).toBeDefined();
  });
});
