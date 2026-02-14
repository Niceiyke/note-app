import { test, expect } from '@playwright/test';

test.describe('Note App E2E', () => {
  test('should load the app and show header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'NOTES' })).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Create Note' }).first().click(); // Open form

    const id = Date.now();
    const title = `Test Note ${id}`;
    const content = `This is a test note content created by Playwright ${id}.`;
    
    await page.getByPlaceholder('Give it a title...').fill(title);
    await page.getByPlaceholder('Meeting notes, project details...').fill(content);
    await page.getByRole('button', { name: 'SAVE NOTE' }).click();
    
    // Wait for the note to appear in the list
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(content)).toBeVisible();
  });

  test('should delete a note', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Create Note' }).first().click(); // Open form

    const id = Date.now();
    const title = `Delete Test ${id}`;
    const content = `To be deleted ${id}`;
    await page.getByPlaceholder('Give it a title...').fill(title);
    await page.getByPlaceholder('Meeting notes, project details...').fill(content);
    await page.getByRole('button', { name: 'SAVE NOTE' }).click();
    
    const noteCard = page.locator('.group').filter({ hasText: title });
    await expect(noteCard).toBeVisible();
    
    await noteCard.hover();
    await noteCard.locator('button').filter({ has: page.locator('svg') }).click(); // Trash button
    
    await expect(page.getByText(title)).not.toBeVisible();
  });
});
