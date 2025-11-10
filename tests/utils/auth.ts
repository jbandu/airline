import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
}

/**
 * Default test user credentials
 * Note: These should be created in your test Supabase instance
 */
export const TEST_USER: TestUser = {
  email: process.env.TEST_USER_EMAIL || 'test@aerograph.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
};

/**
 * Login helper function
 * @param page - Playwright page instance
 * @param user - User credentials (optional, defaults to TEST_USER)
 */
export async function login(page: Page, user: TestUser = TEST_USER) {
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('/');
}

/**
 * Logout helper function
 * @param page - Playwright page instance
 */
export async function logout(page: Page) {
  // Click the user menu or sign out button
  await page.click('[data-testid="sign-out"], button:has-text("Sign Out")');
  await page.waitForURL('/login');
}

/**
 * Check if user is logged in
 * @param page - Playwright page instance
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Try to find elements that only appear when logged in
    const dashboard = await page.locator('[data-testid="dashboard"], h1:has-text("Dashboard")').count();
    return dashboard > 0;
  } catch {
    return false;
  }
}
