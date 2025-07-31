import { test, expect } from './fixtures';
import { toggleTheme, getCurrentTheme } from './helpers/tauri-helpers';

test.describe('Theme Switching', () => {
  test('should toggle between light and dark themes', async ({ page }) => {
    // Get initial theme
    const initialTheme = await getCurrentTheme(page);
    
    // Toggle theme
    await toggleTheme(page);
    
    // Wait for theme transition
    await page.waitForTimeout(300);
    
    // Verify theme changed
    const newTheme = await getCurrentTheme(page);
    expect(newTheme).not.toBe(initialTheme);
    
    // Toggle back
    await toggleTheme(page);
    await page.waitForTimeout(300);
    
    // Verify it's back to original
    const finalTheme = await getCurrentTheme(page);
    expect(finalTheme).toBe(initialTheme);
  });

  test('should persist theme preference', async ({ page, context }) => {
    // Get initial theme
    const initialTheme = await getCurrentTheme(page);
    
    // Change theme
    await toggleTheme(page);
    const changedTheme = await getCurrentTheme(page);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify theme persisted
    const reloadedTheme = await getCurrentTheme(page);
    expect(reloadedTheme).toBe(changedTheme);
    
    // Clean up - restore original theme
    if (reloadedTheme !== initialTheme) {
      await toggleTheme(page);
    }
  });

  test('should apply correct styles in dark mode', async ({ page }) => {
    // Ensure we're in dark mode
    const currentTheme = await getCurrentTheme(page);
    if (currentTheme !== 'dark') {
      await toggleTheme(page);
    }
    
    // Check that dark mode styles are applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Dark mode should have a dark background
    // This is a simple check - adjust based on your actual dark mode colors
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)');
  });

  test('should have accessible theme toggle', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], [data-theme-toggle]').first();
    
    // Check it's keyboard accessible
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();
    
    // Check it can be activated with keyboard
    await page.keyboard.press('Enter');
    
    // Verify theme changed
    await page.waitForTimeout(300);
    
    // The theme should have changed
    const themeAfterEnter = await getCurrentTheme(page);
    
    // Press space to toggle again
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    const themeAfterSpace = await getCurrentTheme(page);
    expect(themeAfterSpace).not.toBe(themeAfterEnter);
  });
});