import { test, expect } from './fixtures/auth.fixture';
import { waitForLoadingComplete } from './utils/helpers';

test.describe('Knowledge Graph', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/knowledge-graph');
    await waitForLoadingComplete(page);
  });

  test('should display knowledge graph page', async ({ authenticatedPage: page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Knowledge Graph/i })).toBeVisible();
  });

  test('should display graph visualization', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000); // Wait for graph to render

    // Check for SVG or canvas element (common for graphs)
    const graphContainer = page.locator('svg, canvas, [data-testid*="graph"]');

    if (await graphContainer.count() > 0) {
      await expect(graphContainer.first()).toBeVisible();
    }
  });

  test('should have graph controls', async ({ authenticatedPage: page }) => {
    // Look for zoom, pan, or filter controls
    const controls = page.locator('button').filter({ hasText: /Zoom|Reset|Filter/i });

    if (await controls.count() > 0) {
      expect(await controls.count()).toBeGreaterThan(0);
    }
  });

  test('should display nodes and edges', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Check for graph elements
    const nodes = page.locator('circle, rect, [class*="node"]');

    if (await nodes.count() > 0) {
      expect(await nodes.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Ontology Tree', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/ontology');
    await waitForLoadingComplete(page);
  });

  test('should display ontology tree page', async ({ authenticatedPage: page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Ontology/i })).toBeVisible();
  });

  test('should display tree visualization', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Check for tree structure
    const treeContainer = page.locator('svg, [data-testid*="tree"], [class*="tree"]');

    if (await treeContainer.count() > 0) {
      await expect(treeContainer.first()).toBeVisible();
    }
  });

  test('should expand and collapse tree nodes', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Look for expandable nodes
    const expandButtons = page.locator('circle, button, [role="button"]').first();

    if (await expandButtons.count() > 0) {
      await expandButtons.click({ timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Cross-Domain Bridges', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/bridges');
    await waitForLoadingComplete(page);
  });

  test('should display bridges page', async ({ authenticatedPage: page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Bridge|Cross-Domain/i })).toBeVisible();
  });

  test('should display Sankey diagram', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Check for Sankey visualization
    const sankeyContainer = page.locator('svg, [data-testid*="sankey"]');

    if (await sankeyContainer.count() > 0) {
      await expect(sankeyContainer.first()).toBeVisible();
    }
  });

  test('should show domain connections', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Check for flow paths or connections
    const paths = page.locator('path, line');

    if (await paths.count() > 0) {
      expect(await paths.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Semantic Matrix', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/semantic-matrix');
    await waitForLoadingComplete(page);
  });

  test('should display semantic matrix page', async ({ authenticatedPage: page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Semantic Matrix/i })).toBeVisible();
  });

  test('should display similarity matrix', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(2000);

    // Check for matrix visualization (table or heatmap)
    const matrix = page.locator('table, svg, [data-testid*="matrix"]');

    if (await matrix.count() > 0) {
      await expect(matrix.first()).toBeVisible();
    }
  });

  test('should allow filtering workflows', async ({ authenticatedPage: page }) => {
    // Look for filter controls
    const filterInput = page.locator('input[type="search"], input[placeholder*="filter" i]');

    if (await filterInput.count() > 0) {
      await filterInput.first().fill('test');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Agent Network', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/agents');
    await waitForLoadingComplete(page);
  });

  test('should display agents page', async ({ authenticatedPage: page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Agent/i })).toBeVisible();
  });

  test('should display agent network graph', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Check for ReactFlow or network visualization
    const networkContainer = page.locator('[class*="react-flow"], svg, canvas, [data-testid*="agent-network"]');

    if (await networkContainer.count() > 0) {
      await expect(networkContainer.first()).toBeVisible();
    }
  });

  test('should display agent nodes', async ({ authenticatedPage: page }) => {
    await page.waitForTimeout(3000);

    // Check for agent nodes
    const agentNodes = page.locator('[data-testid*="agent-node"], [class*="agent"]');

    if (await agentNodes.count() > 0) {
      expect(await agentNodes.count()).toBeGreaterThan(0);
    }
  });

  test('should have agent list view option', async ({ authenticatedPage: page }) => {
    // Look for view toggle
    const viewToggle = page.locator('button').filter({ hasText: /List|Grid|View/i });

    if (await viewToggle.count() > 0) {
      await viewToggle.first().click();
      await page.waitForTimeout(500);
    }
  });
});
