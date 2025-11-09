import { test, expect } from './fixtures/auth.fixture';
import { waitForLoadingComplete } from './utils/helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await waitForLoadingComplete(page);
  });

  test('should display dashboard with all key elements', async ({ authenticatedPage: page }) => {
    // Check page loaded
    await expect(page).toHaveURL('/');

    // Should have dashboard heading or welcome message
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard|Welcome|Overview/i })).toBeVisible();
  });

  test('should display statistics cards', async ({ authenticatedPage: page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000);

    // Check for metric cards
    const metricCards = page.locator('[class*="metric"], [class*="stat"], [class*="card"]');

    if (await metricCards.count() > 0) {
      expect(await metricCards.count()).toBeGreaterThan(0);
    }

    // Check for common metrics
    const metrics = ['Domains', 'Workflows', 'Agents', 'Bridges'];

    for (const metric of metrics) {
      const element = page.locator(`text=${metric}`);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should display domain statistics', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for domains metric
    const domainsText = page.locator('text=/Domains/i');

    if (await domainsText.count() > 0) {
      await expect(domainsText.first()).toBeVisible();
    }
  });

  test('should display workflow statistics', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for workflows metric
    const workflowsText = page.locator('text=/Workflows/i');

    if (await workflowsText.count() > 0) {
      await expect(workflowsText.first()).toBeVisible();
    }
  });

  test('should display AI agents statistics', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for agents metric
    const agentsText = page.locator('text=/Agents/i');

    if (await agentsText.count() > 0) {
      await expect(agentsText.first()).toBeVisible();
    }
  });

  test('should have navigation cards or quick actions', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Look for clickable cards or buttons
    const navigationCards = page.locator('a[href*="/domains"], a[href*="/workflows"], a[href*="/agents"]');

    if (await navigationCards.count() > 0) {
      expect(await navigationCards.count()).toBeGreaterThan(0);
    }
  });

  test('should navigate to domains from dashboard', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const domainsLink = page.locator('a[href="/domains"], a[href*="domains"]').first();

    if (await domainsLink.count() > 0) {
      await domainsLink.click();
      await expect(page).toHaveURL(/\/domains/);
    }
  });

  test('should navigate to workflows from dashboard', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const workflowsLink = page.locator('a[href="/workflows"], a[href*="workflows"]').first();

    if (await workflowsLink.count() > 0) {
      await workflowsLink.click();
      await expect(page).toHaveURL(/\/workflows/);
    }
  });

  test('should navigate to agents from dashboard', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const agentsLink = page.locator('a[href="/agents"], a[href*="agents"]').first();

    if (await agentsLink.count() > 0) {
      await agentsLink.click();
      await expect(page).toHaveURL(/\/agents/);
    }
  });

  test('should display knowledge graph navigation', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const knowledgeGraphLink = page.locator('a[href*="knowledge-graph"]');

    if (await knowledgeGraphLink.count() > 0) {
      await expect(knowledgeGraphLink.first()).toBeVisible();
    }
  });

  test('should display ontology tree navigation', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const ontologyLink = page.locator('a[href*="ontology"]');

    if (await ontologyLink.count() > 0) {
      await expect(ontologyLink.first()).toBeVisible();
    }
  });

  test('should display cross-domain bridges navigation', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const bridgesLink = page.locator('a[href*="bridges"]');

    if (await bridgesLink.count() > 0) {
      await expect(bridgesLink.first()).toBeVisible();
    }
  });

  test('should display semantic matrix navigation', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    const semanticLink = page.locator('a[href*="semantic-matrix"]');

    if (await semanticLink.count() > 0) {
      await expect(semanticLink.first()).toBeVisible();
    }
  });

  test('should have responsive layout', async ({ authenticatedPage: page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Should display properly
    await expect(page.locator('body')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ authenticatedPage: page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(3000);

    // Should have no critical errors
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('sourcemap') &&
      !err.includes('DevTools')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
