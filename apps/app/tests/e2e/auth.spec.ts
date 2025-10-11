import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/baker-login');
    await expect(page.locator('h1')).toContainText('Baker Login');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/baker-login');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/baker-login');
    await page.fill('input[name="email"]', 'baker@demo.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});
