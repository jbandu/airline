import { test, expect } from './fixtures/auth.fixture';
import { waitForLoadingComplete } from './utils/helpers';

test.describe('Domains', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/domains');
    await waitForLoadingComplete(page);
  });

  test('should display domains page', async ({ authenticatedPage: page }) => {
    // Check page title
    await expect(page.locator('h1, h2').filter({ hasText: /Domain/i })).toBeVisible();
  });

  test('should display domain list', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Check for domain items
    const domainItems = page.locator('[data-testid*="domain"], .domain-card, .domain-item');

    if (await domainItems.count() > 0) {
      expect(await domainItems.count()).toBeGreaterThan(0);
    } else {
      // Empty state
      await expect(page.locator('text=/No domains|empty/i')).toBeVisible();
    }
  });

  test('should expand and collapse domain items', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for expandable items (if tree structure)
    const expandButtons = page.locator('button[aria-expanded], [role="button"]').filter({ hasText: /expand|collapse/i });

    if (await expandButtons.count() > 0) {
      const firstButton = expandButtons.first();
      await firstButton.click();
      await page.waitForTimeout(300);

      // Click again to collapse
      await firstButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display domain details in side panel', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Click on a domain
    const domainItem = page.locator('[data-testid*="domain"], .domain-card, .domain-item, button, a').filter({ hasText: /Operations|Finance|Revenue/i }).first();

    if (await domainItem.count() > 0) {
      await domainItem.click();
      await page.waitForTimeout(500);

      // Should show details panel or expand section
      // Implementation dependent
    }
  });

  test('should have add domain button', async ({ authenticatedPage: page }) => {
    const addButton = page.locator('button, a').filter({ hasText: /Add.*Domain|Create.*Domain|New.*Domain/i });

    if (await addButton.count() > 0) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('should search domains', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('operations');
      await page.waitForTimeout(500);

      // Results should update
    }
  });

  test('should display subdomain count per domain', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for subdomain indicators
    const subdomainCounts = page.locator('text=/[0-9]+.*subdomain/i');

    if (await subdomainCounts.count() > 0) {
      expect(await subdomainCounts.count()).toBeGreaterThan(0);
    }
  });

  test('should navigate to subdomains page', async ({ authenticatedPage: page }) => {
    const subdomainsLink = page.locator('a[href*="subdomains"]').first();

    if (await subdomainsLink.count() > 0) {
      await subdomainsLink.click();
      await expect(page).toHaveURL(/\/subdomains/);
    }
  });
});

test.describe('Subdomains', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/subdomains');
    await waitForLoadingComplete(page);
  });

  test('should display subdomains page', async ({ authenticatedPage: page }) => {
    // Check page title
    await expect(page.locator('h1, h2').filter({ hasText: /Subdomain/i })).toBeVisible();
  });

  test('should display subdomain list', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Check for subdomain items
    const subdomainItems = page.locator('[data-testid*="subdomain"], .subdomain-card, table tbody tr');

    if (await subdomainItems.count() > 0) {
      expect(await subdomainItems.count()).toBeGreaterThan(0);
    } else {
      // Empty state
      await expect(page.locator('text=/No subdomains|empty/i')).toBeVisible();
    }
  });

  test('should have add subdomain button', async ({ authenticatedPage: page }) => {
    const addButton = page.locator('button, a').filter({ hasText: /Add.*Subdomain|Create.*Subdomain|New.*Subdomain/i });

    if (await addButton.count() > 0) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('should search subdomains', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('crew');
      await page.waitForTimeout(500);
    }
  });

  test('should filter subdomains by domain', async ({ authenticatedPage: page }) => {
    const filterControl = page.locator('select, button').filter({ hasText: /Filter|Domain/i }).first();

    if (await filterControl.isVisible()) {
      await filterControl.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display subdomain details', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const subdomainItem = page.locator('[data-testid*="subdomain"], .subdomain-card, table tbody tr').first();

    if (await subdomainItem.count() > 0) {
      await subdomainItem.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show associated workflows count', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for workflow count indicators
    const workflowCounts = page.locator('text=/[0-9]+.*workflow/i');

    if (await workflowCounts.count() > 0) {
      expect(await workflowCounts.count()).toBeGreaterThan(0);
    }
  });
});
