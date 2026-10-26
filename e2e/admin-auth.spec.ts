import { test, expect } from '@playwright/test';

test('admin without a session redirects to the login page', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole('heading', { name: 'Admin do portfólio' })).toBeVisible();
});
