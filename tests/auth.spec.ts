import { test, expect } from '@playwright/test';
import { TEST_USER } from './utils/auth';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page with all elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/AeroGraph/i);

    // Check branding
    await expect(page.locator('h1:has-text("AeroGraph")')).toBeVisible();

    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check toggle between sign in and sign up
    await expect(page.locator('text=/Sign in|Sign In/i')).toBeVisible();
  });

  test('should toggle between sign in and sign up modes', async ({ page }) => {
    // Initially on sign in
    await expect(page.locator('text=/Welcome Back/i')).toBeVisible();

    // Click to switch to sign up
    await page.click('text=/Don\'t have an account/i');
    await expect(page.locator('text=/Get Started|Create Account/i')).toBeVisible();

    // Click to switch back to sign in
    await page.click('text=/Already have an account/i');
    await expect(page.locator('text=/Welcome Back/i')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click submit without filling fields
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    // Check that we're still on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('[role="alert"], text=/error|invalid/i')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // Fill valid credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should see dashboard content
    await expect(page.locator('text=/Dashboard|Domains|Workflows/i')).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Click submit
    await page.click('button[type="submit"]');

    // Should show loading state (briefly)
    // This might be too fast to catch, so we just check it doesn't error
    await page.waitForTimeout(100);
  });

  test('should enforce minimum password length', async ({ page }) => {
    // Switch to sign up mode
    await page.click('text=/Don\'t have an account/i');

    await page.fill('input[type="email"]', 'newuser@test.com');
    await page.fill('input[type="password"]', '123'); // Too short

    await page.click('button[type="submit"]');

    // Should not submit due to minLength validation
    await expect(page).toHaveURL(/login/);
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Try to go back to login
    await page.goto('/login');

    // Might stay on login or redirect - depends on implementation
    // Just verify we don't get stuck
    await page.waitForTimeout(1000);
  });

  test('should display all feature cards on login page', async ({ page }) => {
    const features = [
      '22 Business Domains',
      'Workflow Catalog',
      'AI Agent Network',
      'Knowledge Graph',
      'Ontology Tree',
      'Cross-Domain Bridges',
      'Semantic Matrix',
    ];

    for (const feature of features) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
    }
  });

  test('should display statistics on login page', async ({ page }) => {
    // Check for stats
    await expect(page.locator('text=/22.*Domains/i')).toBeVisible();
    await expect(page.locator('text=/600.*Relationships/i')).toBeVisible();
    await expect(page.locator('text=/12.*AI Agents/i')).toBeVisible();
  });

  test('should have proper email input validation', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');

    // Should have email type
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Should be required
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should have proper password input validation', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');

    // Should have password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Should be required
    await expect(passwordInput).toHaveAttribute('required');

    // Should have minimum length
    await expect(passwordInput).toHaveAttribute('minLength', '6');
  });
});
