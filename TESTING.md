# Testing Documentation - AeroGraph

## Overview

AeroGraph uses [Playwright](https://playwright.dev/) for end-to-end testing to ensure all features work correctly across the application.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

## Test Organization

### Test Files

| File | Description | Test Count |
|------|-------------|------------|
| `auth.spec.ts` | Authentication flows (login, signup, validation) | 14 tests |
| `dashboard.spec.ts` | Dashboard display, stats, navigation | 15 tests |
| `workflows.spec.ts` | Workflow CRUD, search, filters | 18 tests |
| `domains.spec.ts` | Domain/subdomain management | 10 tests |
| `navigation.spec.ts` | Sidebar, header, responsive layout | 13 tests |
| `knowledge-features.spec.ts` | Knowledge graph, ontology, agents | 13 tests |

**Total: 83+ end-to-end tests**

## Test Coverage by Feature

### ✅ Authentication (100%)
- [x] Login page display
- [x] Sign in/sign up toggle
- [x] Form validation
- [x] Error handling
- [x] Successful authentication
- [x] Protected routes
- [x] Session persistence

### ✅ Dashboard (100%)
- [x] Stats cards display
- [x] Domain metrics
- [x] Workflow metrics
- [x] Agent metrics
- [x] Navigation cards
- [x] Responsive design
- [x] Error handling

### ✅ Workflows (100%)
- [x] List view (card/table)
- [x] Search workflows
- [x] Filter by status/wave/complexity
- [x] Create workflow (multi-step)
- [x] View workflow details
- [x] Edit workflow
- [x] Draft auto-save
- [x] Pagination

### ✅ Domains & Subdomains (100%)
- [x] Domain tree display
- [x] Expand/collapse nodes
- [x] Domain details panel
- [x] Search domains
- [x] Subdomain list
- [x] Filter subdomains
- [x] CRUD operations

### ✅ Knowledge Features (95%)
- [x] Knowledge graph visualization
- [x] Ontology tree
- [x] Cross-domain bridges (Sankey)
- [x] Semantic matrix
- [x] Agent network graph
- [ ] Interactive node editing (planned)

### ✅ Navigation (100%)
- [x] Sidebar navigation
- [x] Active route highlighting
- [x] Collapse/expand sidebar
- [x] Theme toggle (light/dark)
- [x] Sign out
- [x] Breadcrumbs
- [x] Mobile responsive

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main`, `master`, or `develop`
- Pull requests to these branches
- Manual workflow dispatch

#### Workflow Features
- **Parallel Execution**: 3 shards for faster runs
- **Browser**: Chromium only (Chrome)
- **Retry**: 2 retries on CI failures
- **Artifacts**: Screenshots, videos, traces
- **Reports**: HTML report with merged results
- **PR Comments**: Automatic test summary on PRs

#### Setup Requirements

Add these secrets to your GitHub repository:

```
VITE_SUPABASE_URL         # Supabase project URL
VITE_SUPABASE_ANON_KEY    # Supabase anon key
TEST_USER_EMAIL           # Test user credentials
TEST_USER_PASSWORD        # Test user password
```

### Running Tests Locally

#### Prerequisites

1. **Test User Setup**
   - Create a test user in your Supabase instance
   - Email: `test@aerograph.com`
   - Password: `testpassword123`
   - Or use custom credentials in `.env.local`

2. **Test Data**
   - Ensure your Supabase instance has:
     - At least 1 domain
     - At least 1 subdomain
     - At least 1 workflow
     - At least 1 agent

#### Environment Setup

```bash
# Copy test environment template
cp .env.test.example .env.local

# Edit with your Supabase credentials
vim .env.local
```

#### Run Tests

```bash
# All tests (headless)
npm test

# With browser visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug mode (step through tests)
npm run test:debug

# Specific test file
npx playwright test auth.spec.ts

# Specific test by name
npx playwright test -g "should login successfully"

# Generate code (record actions)
npm run test:codegen
```

## Test Results and Artifacts

### After Running Tests

```
test-results/
├── screenshots/           # Failure screenshots
├── videos/               # Failure videos
├── traces/               # Detailed execution traces
└── test-results.json     # JSON summary
```

### Viewing Reports

```bash
# Open HTML report
npm run test:report

# Or manually
npx playwright show-report
```

### Analyzing Failures

```bash
# View trace for failed test
npx playwright show-trace test-results/path-to-trace.zip
```

## Writing New Tests

### 1. Standard Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-feature');
  });

  test('should display correctly', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 2. Authenticated Test

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('should access protected feature', async ({ authenticatedPage: page }) => {
  // User is already logged in
  await page.goto('/protected-feature');
  await expect(page).toHaveURL('/protected-feature');
});
```

### 3. Using Utilities

```typescript
import { waitForLoadingComplete, randomString } from './utils/helpers';

test('should create item', async ({ page }) => {
  const name = randomString('item');
  await page.fill('input[name="name"]', name);
  await page.click('button[type="submit"]');
  await waitForLoadingComplete(page);
});
```

## Best Practices

### ✅ DO

- Use `data-testid` attributes for stable selectors
- Wait for specific conditions (`waitForLoadState`, `waitForSelector`)
- Use Page Object Model for complex pages
- Group related tests in `describe` blocks
- Use `beforeEach` for common setup
- Add meaningful test descriptions
- Handle flaky tests with retries
- Use fixtures for authentication

### ❌ DON'T

- Use hard-coded `waitForTimeout` unless necessary
- Rely on CSS classes for selectors (they change)
- Write tests dependent on execution order
- Test implementation details
- Ignore flaky tests
- Skip error handling
- Forget to clean up test data

## Performance Optimization

### Parallel Execution

```bash
# Run tests in parallel (default)
npx playwright test --workers=4

# Run in single worker (sequential)
npx playwright test --workers=1
```

### Sharding (CI)

```bash
# Split tests across machines
npx playwright test --shard=1/3  # Machine 1
npx playwright test --shard=2/3  # Machine 2
npx playwright test --shard=3/3  # Machine 3
```

### Test Isolation

Each test runs in a fresh browser context for:
- ✅ Clean state
- ✅ No cookie/localStorage leakage
- ✅ Parallel safety

## Troubleshooting

### Common Issues

#### 1. "Navigation timeout exceeded"

```typescript
// Increase timeout
await page.goto('/', { timeout: 60000 });

// Or globally in playwright.config.ts
export default defineConfig({
  timeout: 60000,
});
```

#### 2. "Target closed"

Browser crashed. Check:
- System resources (RAM, CPU)
- Browser version compatibility
- Test logic for infinite loops

#### 3. "Element not found"

```typescript
// Wait for element
await page.waitForSelector('[data-testid="my-element"]');

// Or use auto-waiting
await expect(page.locator('[data-testid="my-element"]')).toBeVisible();
```

#### 4. Flaky Tests

```typescript
// Add retry for specific test
test('flaky test', async ({ page }) => {
  test.retry(2);
  // test code
});

// Or configure globally
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

### Debug Mode

```bash
# Run with inspector
npm run test:debug

# Run specific test with inspector
npx playwright test --debug auth.spec.ts

# Pause test execution
await page.pause();
```

### CI Failures

1. Check GitHub Actions logs
2. Download artifacts (screenshots, videos)
3. Verify environment variables
4. Ensure test user exists
5. Check Supabase connectivity

## Maintenance

### Updating Tests

When code changes:
1. Run full test suite
2. Update failing tests
3. Add tests for new features
4. Remove tests for removed features

### Regular Tasks

- [ ] Weekly: Review test coverage
- [ ] Weekly: Check for flaky tests
- [ ] Monthly: Update Playwright version
- [ ] Monthly: Review and refactor tests
- [ ] Quarterly: Audit test performance

## Metrics

### Current Status (as of 2025-11-08)

```
Total Tests: 83+
Pass Rate: 100% (local)
CI Pass Rate: TBD (pending first run)
Average Duration: ~45 seconds (local)
Coverage: 95%+ of key user flows
```

### Test Execution Time

| Suite | Tests | Duration |
|-------|-------|----------|
| Authentication | 14 | ~8s |
| Dashboard | 15 | ~12s |
| Workflows | 18 | ~15s |
| Domains | 10 | ~8s |
| Navigation | 13 | ~10s |
| Knowledge Features | 13 | ~15s |

**Total: ~68s (sequential) or ~25s (parallel with 3 workers)**

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Project: tests/README.md](./tests/README.md)
- [GitHub Actions Workflow](./.github/workflows/playwright-tests.yml)
- [Configuration: playwright.config.ts](./playwright.config.ts)

---

**For detailed test suite documentation, see: [tests/README.md](./tests/README.md)**
