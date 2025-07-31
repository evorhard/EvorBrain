import { test as base } from '@playwright/test';
import { waitForTauriApp } from './helpers/tauri-helpers';

/**
 * Custom test fixtures for EvorBrain E2E tests
 */

type TestFixtures = {
  appReady: void;
};

/**
 * Extend base test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  // Automatically wait for app to be ready before each test
  appReady: [async ({ page }, use) => {
    await waitForTauriApp(page);
    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';