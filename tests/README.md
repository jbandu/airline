# Playwright Test Suite for AeroGraph

This directory contains end-to-end tests for the AeroGraph airline workflow management application using [Playwright](https://playwright.dev/).

## 📁 Test Structure

```
tests/
├── fixtures/
│   └── auth.fixture.ts         # Authentication fixtures for authenticated tests
├── utils/
│   ├── auth.ts                 # Authentication helper functions
│   └── helpers.ts              # Common test utilities
├── auth.spec.ts                # Authentication flow tests
├── dashboard.spec.ts           # Dashboard page tests
├── workflows.spec.ts           # Workflow management tests
├── domains.spec.ts             # Domain/subdomain tests
├── navigation.spec.ts          # Navigation and layout tests
├── knowledge-features.spec.ts  # Knowledge graph, ontology, agents tests
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **Supabase instance** configured with test data
3. **Test user account** created in Supabase

### Installation

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Configuration

1. **Copy the test environment template:**
   ```bash
   cp .env.test.example .env.local
   ```

2. **Update `.env.local` with your test configuration:**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   TEST_USER_EMAIL=test@aerograph.com
   TEST_USER_PASSWORD=testpassword123
   ```

3. **Create a test user in Supabase:**
   - Go to your Supabase Dashboard → Authentication → Users
   - Click "Add user"
   - Use the credentials from `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`

## 🧪 Running Tests

### Run all tests (headless)
```bash
npm test
```

### Run tests with browser visible
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Generate test code using Codegen
```bash
npm run test:codegen
```

### View test report
```bash
npm run test:report
```

## 📊 Test Coverage

### Authentication Tests (`auth.spec.ts`)
- ✅ Login page display and elements
- ✅ Toggle between sign in/sign up modes
- ✅ Form validation
- ✅ Invalid credentials handling
- ✅ Successful login flow
- ✅ Protected route access
- ✅ Feature cards and statistics display

### Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard display with stats cards
- ✅ Domain, workflow, agent statistics
- ✅ Navigation cards functionality
- ✅ Quick actions and links
- ✅ Responsive layout
- ✅ Error handling

### Workflow Tests (`workflows.spec.ts`)
- ✅ Workflow list display
- ✅ Search and filter functionality
- ✅ Card/table view toggle
- ✅ Workflow creation form
- ✅ Multi-step wizard navigation
- ✅ Workflow detail view
- ✅ Edit workflow functionality
- ✅ Draft auto-save

### Domain Tests (`domains.spec.ts`)
- ✅ Domain list display
- ✅ Expand/collapse domain tree
- ✅ Domain details panel
- ✅ Search domains
- ✅ Subdomain management
- ✅ Filter by domain
- ✅ Associated workflow counts

### Navigation Tests (`navigation.spec.ts`)
- ✅ Sidebar navigation
- ✅ Active route highlighting
- ✅ Sidebar collapse/expand
- ✅ Header with user info
- ✅ Theme toggle
- ✅ Sign out functionality
- ✅ Breadcrumbs
- ✅ Responsive mobile layout

### Knowledge Features Tests (`knowledge-features.spec.ts`)
- ✅ Knowledge graph visualization
- ✅ Ontology tree display
- ✅ Cross-domain bridges (Sankey)
- ✅ Semantic matrix
- ✅ Agent network graph
- ✅ Interactive controls

## 🤖 GitHub Actions CI/CD

Tests run automatically on:
- **Push** to `main`, `master`, or `develop` branches
- **Pull requests** to these branches
- **Manual trigger** via GitHub Actions UI

### Workflow Features
- ✅ Parallel test execution (3 shards)
- ✅ Automatic browser installation
- ✅ Test artifacts upload
- ✅ HTML report generation
- ✅ PR comment with test results
- ✅ 30-day artifact retention

### Required GitHub Secrets

Add these secrets in your repository settings (Settings → Secrets → Actions):

```
VITE_SUPABASE_URL         # Your Supabase project URL
VITE_SUPABASE_ANON_KEY    # Your Supabase anonymous key
TEST_USER_EMAIL           # Test user email
TEST_USER_PASSWORD        # Test user password
```

## 📝 Writing New Tests

### 1. Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-route');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 2. Using Authentication Fixture

```typescript
import { test, expect } from './fixtures/auth.fixture';

test.describe('Protected Feature', () => {
  test('should access protected page', async ({ authenticatedPage: page }) => {
    // User is already logged in
    await page.goto('/protected-route');
    await expect(page).toHaveURL('/protected-route');
  });
});
```

### 3. Using Helper Functions

```typescript
import { test, expect } from '@playwright/test';
import { waitForLoadingComplete, randomString } from './utils/helpers';

test('should create new item', async ({ page }) => {
  await page.goto('/items/new');
  await waitForLoadingComplete(page);

  const itemName = randomString('item');
  await page.fill('input[name="name"]', itemName);
  // ...
});
```

## 🔍 Debugging Tests

### Visual Debugging
```bash
# Open Playwright Inspector
npm run test:debug

# Run with browser visible
npm run test:headed

# Use UI mode for step-by-step debugging
npm run test:ui
```

### Screenshots and Videos
Failed tests automatically capture:
- 📸 Screenshots (saved to `test-results/`)
- 🎥 Videos (saved to `test-results/`)
- 📋 Traces (view with `npx playwright show-trace trace.zip`)

### Console Logs
```typescript
// Capture console errors
test('should not have console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  expect(errors).toHaveLength(0);
});
```

## 🎯 Best Practices

### 1. Use Data Attributes
```html
<!-- Good: Use data-testid for stable selectors -->
<button data-testid="submit-button">Submit</button>
```

```typescript
// Test
await page.click('[data-testid="submit-button"]');
```

### 2. Wait for Conditions
```typescript
// ❌ Bad: Hard-coded wait
await page.waitForTimeout(5000);

// ✅ Good: Wait for specific condition
await page.waitForLoadState('networkidle');
await expect(page.locator('.spinner')).toBeHidden();
```

### 3. Use Page Object Model (Optional)
```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

### 4. Handle Flaky Tests
```typescript
// Use retry for flaky operations
await test.step('Load data', async () => {
  await page.goto('/data');
  await expect(page.locator('.data-loaded')).toBeVisible({ timeout: 10000 });
});
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [GitHub Actions Integration](https://playwright.dev/docs/ci-intro)

## 🐛 Troubleshooting

### Tests fail with "Navigation timeout"
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network connectivity

### "Target closed" errors
- Browser crashed - check system resources
- Add `await page.waitForLoadState()` after navigation

### Flaky test failures
- Use `test.retry(2)` for specific tests
- Add proper wait conditions
- Check for race conditions

### CI fails but local passes
- Check environment variables in GitHub Secrets
- Verify test user exists in production Supabase
- Review CI logs for specific errors

## 📧 Support

For issues or questions:
1. Check existing issues in GitHub
2. Review Playwright documentation
3. Contact the development team

---

**Last Updated:** 2025-11-08
**Playwright Version:** 1.56.1
**Node Version:** 18+
