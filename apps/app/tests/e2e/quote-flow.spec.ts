import { test, expect } from '@playwright/test';

test.describe('Quote Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/baker-login');
    await page.fill('input[name="email"]', 'baker@demo.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new quote', async ({ page }) => {
    await page.goto('/quotes');
    await page.click('text=New Quote');
    
    await page.fill('input[name="customerName"]', 'Test Customer');
    await page.fill('input[name="customerEmail"]', 'test@example.com');
    await page.fill('textarea[name="eventDetails"]', 'Wedding on June 15th');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Quote created successfully')).toBeVisible();
  });

  test('should view quote list', async ({ page }) => {
    await page.goto('/quotes');
    await expect(page.locator('h1')).toContainText('Quotes');
    await expect(page.locator('table')).toBeVisible();
  });
});
