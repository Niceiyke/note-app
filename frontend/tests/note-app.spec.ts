import { test, expect } from '@playwright/test';

test.describe('Note App E2E', () => {
  test('should load the app and show header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Note App', { exact: true })).toBeVisible();
    await expect(page.getByText('Stay organized and productive.')).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    await page.goto('/');
    
    const id = Date.now();
    const title = `Test Note ${id}`;
    const content = `This is a test note content created by Playwright ${id}.`;
    
    await page.getByPlaceholder('Enter title...').fill(title);
    await page.getByPlaceholder('Write your note here...').fill(content);
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    // Wait for the note to appear in the list
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(content)).toBeVisible();
  });

  test('should delete a note', async ({ page }) => {
    await page.goto('/');
    
    const id = Date.now();
    const title = `Delete Test ${id}`;
    const content = `To be deleted ${id}`;
    await page.getByPlaceholder('Enter title...').fill(title);
    await page.getByPlaceholder('Write your note here...').fill(content);
    await page.getByRole('button', { name: 'Create Note' }).click();
    
    const noteCard = page.locator('.group').filter({ hasText: title });
    await expect(noteCard).toBeVisible();
    
    await noteCard.hover();
    await noteCard.locator('button').last().click(); // Trash button is the last one
    
    await expect(page.getByText(title)).not.toBeVisible();
  });
});
