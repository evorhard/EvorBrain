import { Page } from '@playwright/test';

/**
 * Helper functions for Tauri E2E testing
 */

/**
 * Wait for the Tauri application to fully load
 */
export async function waitForTauriApp(page: Page) {
  // Wait for the app container to be visible with longer timeout
  await page.waitForSelector('#root', { state: 'visible', timeout: 30000 });
  
  // Wait for initial data load (adjust selector based on your app)
  await page.waitForLoadState('networkidle');
  
  // Additional wait to ensure app is interactive
  await page.waitForTimeout(2000);
}

/**
 * Helper to interact with Tauri's window controls
 */
export async function tauriWindowControls(page: Page) {
  return {
    minimize: async () => {
      await page.locator('[data-tauri-drag-region] button[aria-label="Minimize"]').click();
    },
    maximize: async () => {
      await page.locator('[data-tauri-drag-region] button[aria-label="Maximize"]').click();
    },
    close: async () => {
      await page.locator('[data-tauri-drag-region] button[aria-label="Close"]').click();
    },
  };
}

/**
 * Navigate through the app sidebar
 */
export async function navigateTo(page: Page, section: string) {
  const sidebarItem = page.locator(`nav button:has-text("${section}")`);
  await sidebarItem.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to create a new item (Life Area, Goal, etc.)
 */
export async function createNewItem(page: Page, buttonText: string) {
  const createButton = page.locator(`button:has-text("${buttonText}")`);
  await createButton.click();
  
  // Wait for modal/form to appear
  await page.waitForSelector('[role="dialog"], form', { state: 'visible' });
}

/**
 * Fill form field helper
 */
export async function fillFormField(page: Page, label: string, value: string) {
  const field = page.locator(`label:has-text("${label}") + input, label:has-text("${label}") + textarea`);
  await field.fill(value);
}

/**
 * Submit form helper
 */
export async function submitForm(page: Page, submitButtonText = 'Save') {
  const submitButton = page.locator(`button[type="submit"]:has-text("${submitButtonText}")`);
  await submitButton.click();
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, expectedText?: string) {
  const toast = page.locator('[role="alert"], .toast, [data-toast]');
  await toast.waitFor({ state: 'visible' });
  
  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }
  
  return toast;
}

/**
 * Dismiss toast notification
 */
export async function dismissToast(page: Page) {
  const toast = await waitForToast(page);
  const closeButton = toast.locator('button[aria-label="Close"], button:has-text("×")');
  
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
  
  await toast.waitFor({ state: 'hidden' });
}

/**
 * Helper to verify data in list/table
 */
export async function verifyItemInList(page: Page, itemText: string) {
  const listItem = page.locator(`[role="list"] >> text="${itemText}", table >> text="${itemText}"`);
  await expect(listItem).toBeVisible();
}

/**
 * Delete item helper
 */
export async function deleteItem(page: Page, itemText: string) {
  const item = page.locator(`[role="listitem"]:has-text("${itemText}"), tr:has-text("${itemText}")`);
  const deleteButton = item.locator('button[aria-label*="Delete"], button[aria-label*="delete"], button:has-text("Delete")');
  
  await deleteButton.click();
  
  // Handle confirmation dialog if present
  const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"):visible');
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }
}

/**
 * Theme toggle helper
 */
export async function toggleTheme(page: Page) {
  const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], [data-theme-toggle]');
  await themeToggle.click();
}

/**
 * Get current theme
 */
export async function getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
  const htmlElement = page.locator('html');
  const classList = await htmlElement.getAttribute('class') || '';
  return classList.includes('dark') ? 'dark' : 'light';
}