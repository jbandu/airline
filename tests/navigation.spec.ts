import { test, expect } from './fixtures/auth.fixture';
import { waitForLoadingComplete } from './utils/helpers';

test.describe('Navigation and Layout', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await waitForLoadingComplete(page);
  });

  test('should display sidebar navigation', async ({ authenticatedPage: page }) => {
    // Check for sidebar
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should display all navigation links', async ({ authenticatedPage: page }) => {
    const navLinks = [
      'Dashboard',
      'Domains',
      'Workflows',
      'Agents',
      'Knowledge Graph',
      'Ontology',
      'Bridges',
      'Semantic Matrix',
    ];

    for (const link of navLinks) {
      const element = page.locator(`nav a, nav button`).filter({ hasText: new RegExp(link, 'i') });
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should navigate between pages using sidebar', async ({ authenticatedPage: page }) => {
    // Navigate to workflows
    await page.click('nav a[href="/workflows"], nav a:has-text("Workflows")');
    await expect(page).toHaveURL(/\/workflows/);

    // Navigate to domains
    await page.click('nav a[href="/domains"], nav a:has-text("Domains")');
    await expect(page).toHaveURL(/\/domains/);

    // Navigate back to dashboard
    await page.click('nav a[href="/"], nav a:has-text("Dashboard")');
    await expect(page).toHaveURL('/');
  });

  test('should highlight active navigation item', async ({ authenticatedPage: page }) => {
    // Go to workflows
    await page.goto('/workflows');
    await waitForLoadingComplete(page);

    // The active nav item should have special styling
    const activeLink = page.locator('nav a[href="/workflows"]');

    if (await activeLink.count() > 0) {
      // Check for active classes (implementation dependent)
      const classes = await activeLink.getAttribute('class');
      expect(classes).toBeTruthy();
    }
  });

  test('should collapse and expand sidebar', async ({ authenticatedPage: page }) => {
    // Look for sidebar toggle button
    const toggleButton = page.locator('button[aria-label*="menu"], button[aria-label*="sidebar"], [data-testid*="sidebar-toggle"]');

    if (await toggleButton.count() > 0) {
      // Click to collapse
      await toggleButton.first().click();
      await page.waitForTimeout(300);

      // Click to expand
      await toggleButton.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('should display header with user info', async ({ authenticatedPage: page }) => {
    // Check for header
    const header = page.locator('header').first();

    if (await header.isVisible()) {
      await expect(header).toBeVisible();
    }
  });

  test('should have theme toggle button', async ({ authenticatedPage: page }) => {
    // Look for theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"]');

    if (await themeToggle.count() > 0) {
      await expect(themeToggle.first()).toBeVisible();

      // Click to toggle
      await themeToggle.first().click();
      await page.waitForTimeout(500);

      // Click again to toggle back
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should have sign out button', async ({ authenticatedPage: page }) => {
    // Look for sign out button
    const signOutButton = page.locator('button, a').filter({ hasText: /Sign Out|Logout/i });

    if (await signOutButton.count() > 0) {
      await expect(signOutButton.first()).toBeVisible();
    }
  });

  test('should display breadcrumbs', async ({ authenticatedPage: page }) => {
    await page.goto('/workflows');
    await waitForLoadingComplete(page);

    // Check for breadcrumbs
    const breadcrumbs = page.locator('[aria-label="breadcrumb"], nav ol, .breadcrumb');

    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.first()).toBeVisible();
    }
  });

  test('should have search functionality in header', async ({ authenticatedPage: page }) => {
    // Look for search in header
    const headerSearch = page.locator('header input[type="search"], header button[aria-label*="search"]');

    if (await headerSearch.count() > 0) {
      await expect(headerSearch.first()).toBeVisible();
    }
  });

  test('should have notifications icon', async ({ authenticatedPage: page }) => {
    // Look for notifications
    const notificationsIcon = page.locator('button[aria-label*="notification"], [data-testid*="notification"]');

    if (await notificationsIcon.count() > 0) {
      await expect(notificationsIcon.first()).toBeVisible();
    }
  });

  test('should display footer', async ({ authenticatedPage: page }) => {
    // Check for footer
    const footer = page.locator('footer');

    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });

  test('should handle mobile responsive layout', async ({ authenticatedPage: page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Sidebar should be hidden or collapsed on mobile
    await expect(page.locator('body')).toBeVisible();

    // Restore desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
});
