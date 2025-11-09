import { Page, expect } from '@playwright/test';

/**
 * Wait for loading spinners to disappear
 * @param page - Playwright page instance
 */
export async function waitForLoadingComplete(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for common loading indicators to disappear
  await page.waitForSelector('[data-testid="loading"], .animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
}

/**
 * Take a screenshot with a descriptive name
 * @param page - Playwright page instance
 * @param name - Screenshot name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Check for console errors
 * @param page - Playwright page instance
 */
export function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Navigate and wait for page to be ready
 * @param page - Playwright page instance
 * @param url - URL to navigate to
 */
export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await waitForLoadingComplete(page);
}

/**
 * Fill form field by label
 * @param page - Playwright page instance
 * @param label - Form field label
 * @param value - Value to fill
 */
export async function fillByLabel(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

/**
 * Click button by text
 * @param page - Playwright page instance
 * @param text - Button text
 */
export async function clickButton(page: Page, text: string) {
  await page.getByRole('button', { name: text }).click();
}

/**
 * Verify toast/notification appears
 * @param page - Playwright page instance
 * @param message - Expected message text
 */
export async function verifyNotification(page: Page, message: string) {
  const notification = page.locator('[role="alert"], .toast, .notification').filter({ hasText: message });
  await expect(notification).toBeVisible({ timeout: 5000 });
}

/**
 * Random string generator for unique test data
 * @param prefix - Prefix for the string
 */
export function randomString(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
