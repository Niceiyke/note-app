import { test, expect } from '@playwright/test';

test.describe('Note App New Features', () => {
  test('should auto-save draft while typing', async ({ page }) => {
    await page.goto('/');
    
    // Open new note form
    await page.getByRole('button', { name: 'Create Note' }).first().click();

    const title = `Draft Title ${Date.now()}`;
    const content = `Draft content that should auto-save.`;
    
    await page.getByPlaceholder('Give it a title...').fill(title);
    await page.getByPlaceholder('Meeting notes, project details...').fill(content);
    
    // Wait for auto-save indicator
    await expect(page.getByText('AUTOSAVING DRAFT...')).toBeVisible();
    
    // Wait for it to disappear (saved)
    await expect(page.getByText('AUTOSAVING DRAFT...')).not.toBeVisible({ timeout: 15000 });

    // Close form without clicking "SAVE NOTE"
    await page.getByLabel('Close').click();

    // Check if the note exists in the list (it should have been auto-saved)
    await expect(page.getByRole('main').getByText(title)).toBeVisible();
  });

  test('should show task summary report and allow editing', async ({ page }) => {
    await page.goto('/');
    
    // Create a task note
    await page.getByRole('button', { name: 'Create Note' }).first().click();
    const taskTitle = `Task for Report ${Date.now()}`;
    await page.getByPlaceholder('Give it a title...').fill(taskTitle);
    
    // Select Tasks category in the form
    await page.locator('form').getByRole('button', { name: 'Tasks' }).click();
    
    await page.getByPlaceholder('Add checklist items...').fill(`Item 1\nItem 2`);
    await page.getByRole('button', { name: 'SAVE NOTE' }).click();

    // Open Report
    await page.getByRole('button', { name: 'Report' }).click();
    
    await expect(page.getByText('TASK SUMMARY')).toBeVisible();
    
    // Click Edit in report
    // Using force: true because the button might be hidden until hover
    // Using .group to target the task row container
    await page.locator('div.z-50 .group').filter({ has: page.locator('h4', { hasText: taskTitle }) }).getByRole('button', { name: 'Edit' }).click({ force: true });

    // Report should close and Edit Note form should open
    await expect(page.getByText('TASK SUMMARY')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'EDIT NOTE' })).toBeVisible();
    await expect(page.getByPlaceholder('Give it a title...')).toHaveValue(taskTitle);
  });
});
