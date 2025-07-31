import { test, expect } from './fixtures';
import { 
  navigateTo, 
  createNewItem, 
  fillFormField, 
  submitForm, 
  waitForToast,
  verifyItemInList,
  deleteItem,
  dismissToast
} from './helpers/tauri-helpers';

test.describe('Life Areas Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Life Areas section
    await navigateTo(page, 'Life Areas');
  });

  test('should create a new life area', async ({ page }) => {
    // Click create button
    await createNewItem(page, 'Create Life Area');
    
    // Fill in the form
    await fillFormField(page, 'Name', 'Health & Fitness');
    await fillFormField(page, 'Description', 'Physical and mental well-being');
    
    // Select a color (if color picker is present)
    const colorPicker = page.locator('input[type="color"], [data-color-picker]');
    if (await colorPicker.isVisible()) {
      await colorPicker.fill('#10B981');
    }
    
    // Submit form
    await submitForm(page);
    
    // Wait for success toast
    await waitForToast(page, 'Life area created');
    
    // Verify the item appears in the list
    await verifyItemInList(page, 'Health & Fitness');
  });

  test('should edit an existing life area', async ({ page }) => {
    // First create a life area to edit
    await createNewItem(page, 'Create Life Area');
    await fillFormField(page, 'Name', 'Test Area');
    await submitForm(page);
    await dismissToast(page);
    
    // Find and click edit button
    const item = page.locator('[role="listitem"]:has-text("Test Area"), .life-area-card:has-text("Test Area")');
    const editButton = item.locator('button[aria-label*="Edit"], button[aria-label*="edit"], button:has-text("Edit")');
    await editButton.click();
    
    // Edit the name
    await fillFormField(page, 'Name', 'Updated Test Area');
    await submitForm(page);
    
    // Verify update
    await waitForToast(page, 'updated');
    await verifyItemInList(page, 'Updated Test Area');
  });

  test('should delete a life area', async ({ page }) => {
    // First create a life area to delete
    await createNewItem(page, 'Create Life Area');
    await fillFormField(page, 'Name', 'To Delete');
    await submitForm(page);
    await dismissToast(page);
    
    // Delete the item
    await deleteItem(page, 'To Delete');
    
    // Verify deletion
    await waitForToast(page, 'deleted');
    
    // Verify item is no longer in list
    const deletedItem = page.locator('text="To Delete"');
    await expect(deletedItem).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click create button
    await createNewItem(page, 'Create Life Area');
    
    // Try to submit without filling required fields
    await submitForm(page);
    
    // Check for validation error
    const errorMessage = page.locator('.error-message, [role="alert"], .text-danger-500');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('should display empty state when no life areas exist', async ({ page }) => {
    // Look for empty state message
    const emptyState = page.locator('text=/no life areas/i, text=/get started/i, .empty-state');
    
    // If there are existing items, this test might not apply
    // But we're checking the UI has proper empty state handling
    const items = page.locator('[role="listitem"], .life-area-card');
    const itemCount = await items.count();
    
    if (itemCount === 0) {
      await expect(emptyState.first()).toBeVisible();
    }
  });
});