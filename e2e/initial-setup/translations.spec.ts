import { expect, test } from '@playwright/test';

test.describe('Translations', () => {
    test('should have translations working', async ({ page }) => {
        // load the page, check if there is a div with the id 'translations-working' and check that it does not contain 'application.name', but talkarr
        await page.goto('http://localhost:3232', {
            waitUntil: 'domcontentloaded',
        });

        const translationsDiv = page.locator('#translations-working');

        await expect(translationsDiv).toBeHidden();
        await expect(translationsDiv).toHaveText('Talkarr');
        await expect(translationsDiv).not.toHaveText('application.name');
    });
});
