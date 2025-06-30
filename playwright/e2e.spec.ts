import { test, expect } from '@playwright/test';

test.describe('E2E Tests', () => {
  test.beforeEach(async () => {
    // Check kill switch
    const haltPipeline = process.env['HALT_PIPELINE'];
    if (haltPipeline === 'true') {
      test.skip();
    }
  });

  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for H1
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/welcome|home|app/i);
    
    // Check responsive viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(h1).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(h1).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Find and click first nav link
    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    
    if (count > 0) {
      await navLinks.first().click();
      await expect(page).toHaveURL(/.+/);
    }
  });

  test('API endpoint responds', async ({ request }) => {
    const response = await request.get('/api/hello');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('form submission (if exists)', async ({ page }) => {
    await page.goto('/');
    
    const form = page.locator('form').first();
    const formExists = await form.count() > 0;
    
    if (formExists) {
      // Fill first text input
      const textInput = form.locator('input[type="text"], input[type="email"]').first();
      if (await textInput.count() > 0) {
        await textInput.fill('test@example.com');
      }
      
      // Submit
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for response
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('accessibility basics', async ({ page }) => {
    await page.goto('/');
    
    // Check for lang attribute
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /en/i);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('performance metrics', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    // Assert reasonable load times
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });
});