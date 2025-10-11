import { test, expect } from '@playwright/test';

test.describe('Quote API', () => {
  let authCookie: string;

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'baker@demo.com',
        password: 'demo123',
      },
    });
    
    const cookies = response.headers()['set-cookie'];
    if (cookies) {
      authCookie = cookies;
    }
  });

  test('GET /api/quotes returns quote list', async ({ request }) => {
    const response = await request.get('/api/quotes', {
      headers: {
        Cookie: authCookie,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST /api/quotes creates a new quote', async ({ request }) => {
    const response = await request.post('/api/quotes', {
      headers: {
        Cookie: authCookie,
      },
      data: {
        customerName: 'API Test Customer',
        customerEmail: 'apitest@example.com',
        eventType: 'wedding',
        eventDate: '2025-12-15',
        servings: 100,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBeDefined();
  });
});
