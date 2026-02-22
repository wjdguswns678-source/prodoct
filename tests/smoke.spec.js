const { test, expect } = require('@playwright/test');

test('renders lotto numbers on generate', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByRole('button', { name: /dark mode|light mode/i });
  await expect(toggle).toBeVisible();

  const generate = page.getByRole('button', { name: /generate numbers/i });
  await generate.click();

  const balls = page.locator('lotto-number');
  await expect(balls).toHaveCount(6);

  for (let i = 0; i < 6; i += 1) {
    await expect(balls.nth(i)).toHaveText(/\d+/);
  }
});

test('toggles theme', async ({ page }) => {
  await page.goto('/');

  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: /dark mode|light mode/i });

  const initialTheme = await html.getAttribute('data-theme');
  await toggle.click();

  const nextTheme = await html.getAttribute('data-theme');
  expect(nextTheme).not.toBe(initialTheme);
});
