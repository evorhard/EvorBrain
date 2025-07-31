# E2E Testing Guide for EvorBrain

This guide explains how to write and run end-to-end tests for EvorBrain using Playwright.

## Overview

End-to-end (E2E) tests simulate real user interactions with the EvorBrain desktop application. These tests ensure that the entire application stack (frontend + Tauri backend) works correctly together.

## Setup

The E2E testing environment is configured with:
- **Playwright** for browser automation and testing
- **Tauri** integration for desktop app testing
- Custom helpers and fixtures for EvorBrain-specific functionality

## Running E2E Tests

```bash
# Run all e2e tests
bun run test:e2e

# Run tests with UI mode (recommended for development)
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed

# Debug a specific test
bun run test:e2e:debug
```

## Writing E2E Tests

### Test Structure

E2E tests are located in the `/e2e` directory. Each test file should follow the naming convention `*.spec.ts`.

```typescript
import { test, expect } from './fixtures';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

### Using Custom Fixtures

We provide a custom test fixture that automatically waits for the Tauri app to load:

```typescript
import { test, expect } from './fixtures';

test('my test', async ({ page, appReady }) => {
  // App is automatically ready here
  await expect(page.locator('#root')).toBeVisible();
});
```

### Helper Functions

The `e2e/helpers/tauri-helpers.ts` file provides useful helper functions:

#### Navigation
```typescript
import { navigateTo } from './helpers/tauri-helpers';

await navigateTo(page, 'Life Areas');
await navigateTo(page, 'Goals');
```

#### Creating Items
```typescript
import { createNewItem, fillFormField, submitForm } from './helpers/tauri-helpers';

await createNewItem(page, 'Create Life Area');
await fillFormField(page, 'Name', 'Health & Fitness');
await fillFormField(page, 'Description', 'Physical well-being');
await submitForm(page);
```

#### Handling Toasts
```typescript
import { waitForToast, dismissToast } from './helpers/tauri-helpers';

await waitForToast(page, 'Item created successfully');
await dismissToast(page);
```

#### Theme Testing
```typescript
import { toggleTheme, getCurrentTheme } from './helpers/tauri-helpers';

const theme = await getCurrentTheme(page);
await toggleTheme(page);
```

### Best Practices

1. **Use Data Attributes**: Add `data-testid` attributes to elements for reliable selection:
   ```tsx
   <button data-testid="create-life-area">Create Life Area</button>
   ```

2. **Wait for Elements**: Always wait for elements before interacting:
   ```typescript
   await page.waitForSelector('[data-testid="submit-button"]');
   await page.click('[data-testid="submit-button"]');
   ```

3. **Use Semantic Selectors**: Prefer role-based and accessible selectors:
   ```typescript
   await page.click('button[role="button"]:has-text("Save")');
   await page.fill('input[aria-label="Name"]', 'Test Name');
   ```

4. **Handle Async Operations**: Wait for network requests and state changes:
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('.success-message');
   ```

5. **Clean Up After Tests**: Reset state when necessary:
   ```typescript
   test.afterEach(async ({ page }) => {
     // Clean up created test data
   });
   ```

## Common Test Scenarios

### Testing CRUD Operations

```typescript
test('should create, edit, and delete an item', async ({ page }) => {
  // Create
  await createNewItem(page, 'Create Item');
  await fillFormField(page, 'Name', 'Test Item');
  await submitForm(page);
  await waitForToast(page, 'created');
  
  // Edit
  await page.click('button[aria-label="Edit Test Item"]');
  await fillFormField(page, 'Name', 'Updated Item');
  await submitForm(page);
  await waitForToast(page, 'updated');
  
  // Delete
  await deleteItem(page, 'Updated Item');
  await waitForToast(page, 'deleted');
});
```

### Testing Form Validation

```typescript
test('should show validation errors', async ({ page }) => {
  await createNewItem(page, 'Create Item');
  
  // Submit without required fields
  await submitForm(page);
  
  // Check for error messages
  const error = page.locator('.error-message:has-text("required")');
  await expect(error).toBeVisible();
});
```

### Testing Navigation

```typescript
test('should navigate between sections', async ({ page }) => {
  await navigateTo(page, 'Life Areas');
  await expect(page).toHaveURL(/.*life-areas/);
  
  await navigateTo(page, 'Goals');
  await expect(page).toHaveURL(/.*goals/);
});
```

## Debugging E2E Tests

### Using Playwright Inspector

Run tests with the `--debug` flag to open Playwright Inspector:

```bash
bun run test:e2e:debug
```

### Taking Screenshots

Playwright automatically captures screenshots on failure. Find them in:
- `test-results/[test-name]/test-failed-1.png`

### Viewing Test Reports

After running tests, view the HTML report:

```bash
bunx playwright show-report
```

### Using Page Console Logs

Access browser console logs in tests:

```typescript
page.on('console', msg => console.log('Browser log:', msg.text()));
```

## CI/CD Integration

The Playwright config is set up to work in CI environments:

- Tests run in headless mode by default
- Retries are enabled on CI
- Parallel execution is disabled on CI for stability

Example GitHub Actions workflow:

```yaml
- name: Install Playwright Browsers
  run: bunx playwright install --with-deps chromium

- name: Run E2E Tests
  run: bun run test:e2e
  env:
    CI: true
```

## Troubleshooting

### Tests Timing Out

If tests are timing out, increase the timeout in the config:

```typescript
test.setTimeout(60000); // 60 seconds
```

### Tauri App Not Starting

Ensure the dev server starts correctly:

```bash
# Test manually
bun run tauri:dev

# Check the port is available
lsof -i :1420
```

### Element Not Found

Use the Playwright Inspector to debug selectors:

```typescript
await page.pause(); // Pauses execution for debugging
```

## Advanced Topics

### Testing File Operations

For tests involving file operations, use Tauri's API:

```typescript
test('should import a file', async ({ page }) => {
  // Mock file selection if needed
  // Test import functionality
});
```

### Testing Keyboard Shortcuts

```typescript
test('should respond to keyboard shortcuts', async ({ page }) => {
  await page.keyboard.press('Control+N'); // Or 'Meta+N' on macOS
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

### Testing Offline Behavior

```typescript
test('should work offline', async ({ page, context }) => {
  await context.setOffline(true);
  // Test offline functionality
  await context.setOffline(false);
});
```

## MCP Playwright Server Integration

The project includes integration with the MCP Playwright server for enhanced testing capabilities. You can use the MCP commands for browser automation:

- `mcp__playwright__playwright_navigate` - Navigate to URLs
- `mcp__playwright__playwright_screenshot` - Take screenshots
- `mcp__playwright__playwright_click` - Click elements
- `mcp__playwright__playwright_fill` - Fill form fields

These can be useful for manual testing and debugging sessions.