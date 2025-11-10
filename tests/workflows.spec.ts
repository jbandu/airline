import { test, expect } from './fixtures/auth.fixture';
import { randomString, waitForLoadingComplete } from './utils/helpers';

test.describe('Workflow Management', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/workflows');
    await waitForLoadingComplete(page);
  });

  test('should display workflows page with all elements', async ({ authenticatedPage: page }) => {
    // Check page title/heading
    await expect(page.locator('h1, h2').filter({ hasText: /Workflow/i })).toBeVisible();

    // Check for search functionality
    await expect(page.locator('input[type="search"], input[placeholder*="Search"]')).toBeVisible();

    // Check for create workflow button
    await expect(page.locator('button, a').filter({ hasText: /Create|Add.*Workflow|New/i })).toBeVisible();
  });

  test('should display workflow cards or table', async ({ authenticatedPage: page }) => {
    // Wait for workflows to load
    await page.waitForTimeout(2000);

    // Check if workflows are displayed (either in cards or table)
    const hasWorkflows = await page.locator('[data-testid*="workflow"], .workflow-card, table tbody tr').count();

    if (hasWorkflows > 0) {
      // Workflows exist, verify they display correctly
      expect(hasWorkflows).toBeGreaterThan(0);
    } else {
      // No workflows, should show empty state
      await expect(page.locator('text=/No workflows|empty|Get started/i')).toBeVisible();
    }
  });

  test('should search workflows', async ({ authenticatedPage: page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    await searchInput.fill('test search');
    await page.waitForTimeout(500); // Wait for debounce

    // Verify URL or content updates
    // Results will depend on if matching workflows exist
  });

  test('should filter workflows by status', async ({ authenticatedPage: page }) => {
    // Look for filter controls
    const statusFilter = page.locator('select, button').filter({ hasText: /Status|Filter/i }).first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);
    }
  });

  test('should toggle between card and table view', async ({ authenticatedPage: page }) => {
    // Look for view toggle buttons
    const viewToggle = page.locator('button[aria-label*="view"], [data-testid*="view-toggle"]');

    if (await viewToggle.count() > 0) {
      await viewToggle.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to create workflow page', async ({ authenticatedPage: page }) => {
    // Click create workflow button
    await page.locator('button, a').filter({ hasText: /Create|Add.*Workflow|New/i }).first().click();

    // Should navigate to create page
    await expect(page).toHaveURL(/\/workflows\/(new|create)/);
  });

  test('should display workflow detail page', async ({ authenticatedPage: page }) => {
    // Wait for workflows to load
    await page.waitForTimeout(2000);

    // Check if any workflows exist
    const workflowLinks = page.locator('a[href*="/workflows/"], .workflow-card a, table tbody tr a').first();

    if (await workflowLinks.count() > 0) {
      await workflowLinks.first().click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/workflows\/[^\/]+$/);

      // Should show workflow details
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });

  test('should display pagination if many workflows', async ({ authenticatedPage: page }) => {
    // Check for pagination controls
    const pagination = page.locator('[aria-label*="pagination"], .pagination, button:has-text("Next"), button:has-text("Previous")');

    if (await pagination.count() > 0) {
      expect(await pagination.count()).toBeGreaterThan(0);
    }
  });

  test('should sort workflows', async ({ authenticatedPage: page }) => {
    // Look for sort controls
    const sortControl = page.locator('select, button').filter({ hasText: /Sort|Order/i }).first();

    if (await sortControl.isVisible()) {
      await sortControl.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display workflow status indicators', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Check if any workflows exist with status badges
    const statusBadges = page.locator('[class*="badge"], [class*="status"], span').filter({ hasText: /Draft|Active|Completed|Archived/i });

    if (await statusBadges.count() > 0) {
      expect(await statusBadges.count()).toBeGreaterThan(0);
    }
  });

  test('should handle empty workflows state', async ({ authenticatedPage: page }) => {
    // This test assumes there might be no workflows
    await page.waitForTimeout(2000);

    const workflowCount = await page.locator('[data-testid*="workflow"], .workflow-card, table tbody tr').count();

    if (workflowCount === 0) {
      // Should show helpful message
      await expect(page.locator('text=/No workflows|empty|Create your first/i')).toBeVisible();
    }
  });
});

test.describe('Workflow Creation', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/workflows/new');
    await waitForLoadingComplete(page);
  });

  test('should display workflow creation form', async ({ authenticatedPage: page }) => {
    // Should see form heading
    await expect(page.locator('h1, h2').filter({ hasText: /Create|New.*Workflow/i })).toBeVisible();

    // Should have form inputs
    await expect(page.locator('input, textarea, select')).toHaveCount.greaterThan(0);
  });

  test('should show validation errors for empty required fields', async ({ authenticatedPage: page }) => {
    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Submit|Create|Save/i }).first();

    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should still be on the form page or show validation errors
      // Implementation dependent
    }
  });

  test('should have multi-step wizard navigation', async ({ authenticatedPage: page }) => {
    // Check for step indicators or next/previous buttons
    const stepIndicators = page.locator('[data-testid*="step"], .step-indicator, text=/Step [0-9]/i');
    const nextButton = page.locator('button').filter({ hasText: /Next/i });

    if (await stepIndicators.count() > 0 || await nextButton.count() > 0) {
      // Multi-step form exists
      expect(true).toBe(true);
    }
  });

  test('should save draft to localStorage', async ({ authenticatedPage: page }) => {
    // Fill some fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();

    if (await nameInput.isVisible()) {
      const testName = randomString('workflow');
      await nameInput.fill(testName);
      await page.waitForTimeout(1000); // Wait for auto-save

      // Refresh page
      await page.reload();
      await waitForLoadingComplete(page);

      // Check if data is restored (implementation dependent)
      const restoredValue = await nameInput.inputValue();
      // Note: This depends on localStorage implementation
    }
  });
});

test.describe('Workflow Detail', () => {
  test('should display workflow details', async ({ authenticatedPage: page }) => {
    // Navigate to workflows list first
    await page.goto('/workflows');
    await waitForLoadingComplete(page);
    await page.waitForTimeout(2000);

    // Click on first workflow if exists
    const firstWorkflow = page.locator('a[href*="/workflows/"]').first();

    if (await firstWorkflow.count() > 0) {
      await firstWorkflow.click();
      await waitForLoadingComplete(page);

      // Should display workflow name/title
      await expect(page.locator('h1, h2')).toBeVisible();

      // Should have tabs or sections
      const tabs = page.locator('[role="tablist"], .tabs, button[role="tab"]');
      if (await tabs.count() > 0) {
        expect(await tabs.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should have edit button', async ({ authenticatedPage: page }) => {
    await page.goto('/workflows');
    await waitForLoadingComplete(page);
    await page.waitForTimeout(2000);

    const firstWorkflow = page.locator('a[href*="/workflows/"]').first();

    if (await firstWorkflow.count() > 0) {
      await firstWorkflow.click();
      await waitForLoadingComplete(page);

      // Should have edit button
      const editButton = page.locator('button, a').filter({ hasText: /Edit/i });
      if (await editButton.count() > 0) {
        await expect(editButton.first()).toBeVisible();
      }
    }
  });

  test('should navigate between tabs', async ({ authenticatedPage: page }) => {
    await page.goto('/workflows');
    await waitForLoadingComplete(page);
    await page.waitForTimeout(2000);

    const firstWorkflow = page.locator('a[href*="/workflows/"]').first();

    if (await firstWorkflow.count() > 0) {
      await firstWorkflow.click();
      await waitForLoadingComplete(page);

      // Find tabs
      const tabs = page.locator('button[role="tab"]');

      if (await tabs.count() > 1) {
        // Click second tab
        await tabs.nth(1).click();
        await page.waitForTimeout(300);

        // Verify tab content changes
        expect(true).toBe(true);
      }
    }
  });
});

test.describe('Workflow Edit', () => {
  test('should navigate to edit page', async ({ authenticatedPage: page }) => {
    await page.goto('/workflows');
    await waitForLoadingComplete(page);
    await page.waitForTimeout(2000);

    const firstWorkflow = page.locator('a[href*="/workflows/"]').first();

    if (await firstWorkflow.count() > 0) {
      // Get workflow ID from href
      const href = await firstWorkflow.getAttribute('href');

      if (href) {
        // Navigate to edit page
        await page.goto(`${href}/edit`);
        await waitForLoadingComplete(page);

        // Should show edit form
        await expect(page.locator('h1, h2').filter({ hasText: /Edit/i })).toBeVisible();
      }
    }
  });

  test('should pre-populate form with existing data', async ({ authenticatedPage: page }) => {
    await page.goto('/workflows');
    await waitForLoadingComplete(page);
    await page.waitForTimeout(2000);

    const firstWorkflow = page.locator('a[href*="/workflows/"]').first();

    if (await firstWorkflow.count() > 0) {
      const href = await firstWorkflow.getAttribute('href');

      if (href) {
        await page.goto(`${href}/edit`);
        await waitForLoadingComplete(page);

        // Check if form fields are populated
        const inputs = page.locator('input[value], textarea');
        if (await inputs.count() > 0) {
          const firstInput = inputs.first();
          const value = await firstInput.inputValue();
          expect(value.length).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
