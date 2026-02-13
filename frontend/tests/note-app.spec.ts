import { test, expect } from '@playwright/test';

test.describe('Note App E2E', () => {
  test('should load the app and show header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Note Master')).toBeVisible();
    await expect(page.getByText('Premium note management for your thoughts.')).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    await page.goto('/');
    
    const title = `Test Note ${Date.now()}`;
    const content = 'This is a test note content created by Playwright.';
    
    await page.getByPlaceholder('Give it a name...').fill(title);
    await page.getByPlaceholder('Start writing...').fill(content);
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    // Wait for the note to appear in the list
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(content)).toBeVisible();
  });

  test('should edit an existing note', async ({ page }) => {
    await page.goto('/');
    
    // Ensure we have at least one note to edit
    const title = `Edit Test ${Date.now()}`;
    await page.getByPlaceholder('Give it a name...').fill(title);
    await page.getByPlaceholder('Start writing...').fill('Original content');
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    const noteCard = page.locator('div.group').filter({ hasText: title });
    await noteCard.scrollIntoViewIfNeeded();
    
    // Hover to show buttons and click edit
    await noteCard.hover();
    await noteCard.locator('button').first().click(); // Pencil icon is first
    
    const updatedTitle = `${title} (Updated)`;
    await page.locator('input[value="' + title + '"]').fill(updatedTitle);
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText(updatedTitle)).toBeVisible();
  });

  test('should delete a note', async ({ page }) => {
    await page.goto('/');
    
    const title = `Delete Test ${Date.now()}`;
    await page.getByPlaceholder('Give it a name...').fill(title);
    await page.getByPlaceholder('Start writing...').fill('To be deleted');
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    const noteCard = page.locator('div.group').filter({ hasText: title });
    await expect(noteCard).toBeVisible();
    
    await noteCard.hover();
    await noteCard.locator('button').nth(1).click(); // Trash icon is second
    
    await expect(page.getByText(title)).not.toBeVisible();
  });
});
