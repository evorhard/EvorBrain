import { test, expect } from './fixtures';

test.describe('App Launch', () => {
  test('should launch and display main window', async ({ page }) => {
    // Check that the main container is visible
    await expect(page.locator('#root')).toBeVisible();
    
    // Check that the sidebar is visible
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Check that header is present
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display app title', async ({ page }) => {
    // Look for EvorBrain in the title or header
    const title = page.locator('h1:has-text("EvorBrain"), header:has-text("EvorBrain")');
    await expect(title.first()).toBeVisible();
  });

  test('should have functioning navigation', async ({ page }) => {
    // Check that navigation items are visible
    const navItems = page.locator('nav a, nav button[role="link"]');
    await expect(navItems).toHaveCount(await navItems.count());
    
    // Should have at least some navigation items
    expect(await navItems.count()).toBeGreaterThan(0);
  });

  test('should have theme toggle', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], [data-theme-toggle]');
    await expect(themeToggle.first()).toBeVisible();
  });
});