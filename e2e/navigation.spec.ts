import { expect, test } from '@playwright/test';

test('should be able to navigate to the home page', async ({ page }) => {
    await page.goto('http://localhost:3232');

    await expect(page.title()).resolves.toBe('Talkarr');

    await expect(page.getByText('404')).not.toBeVisible();
});
