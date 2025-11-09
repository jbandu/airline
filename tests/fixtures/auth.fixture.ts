import { test as base } from '@playwright/test';
import { login, TEST_USER } from '../utils/auth';

/**
 * Extended test fixture with authenticated user
 * Usage: import { test } from './fixtures/auth.fixture'
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    await login(page);
    // Use the authenticated page
    await use(page);
  },
});

export { expect } from '@playwright/test';
