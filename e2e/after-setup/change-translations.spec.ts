import { expect, test } from '@playwright/test';

test.describe('Change translations', () => {
    test('Change translations in the application', async ({ page, isMobile }) => {
        await page.goto('http://localhost:3232/');

        // check if we are a mobile device
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (isMobile) {
            // open the navigation drawer
            const openNavigationDrawerButton = page.getByTestId(
                'mobile-navigation-drawer-toggle',
            );
            // eslint-disable-next-line playwright/no-conditional-expect
            await expect(openNavigationDrawerButton).toBeVisible();
            await openNavigationDrawerButton.click();
        }

        // check for the language changer
        const changeLanguageButton = page.getByTestId('change-language-button');

        await expect(changeLanguageButton).toBeVisible();
        await changeLanguageButton.click();

        const languageChangerPopover = page.getByTestId(
            'language-changer-popover',
        );
        await expect(languageChangerPopover).toBeVisible();

        // check for the language options
        const languageOptions = languageChangerPopover.getByRole('menuitem');

        // there should be at least three menu items found (english, german and the weblate link).
        // we should check for > 3
        const languageOptionsCount = await languageOptions.count();
        expect(languageOptionsCount).toBeGreaterThan(2);

        // select the menu item with the text "English"
        const englishOption = languageOptions.filter({ hasText: 'English' });
        await expect(englishOption).toBeVisible();
        await englishOption.click();

        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveAttribute('lang', 'en');

        // now with german
        await changeLanguageButton.click();
        await expect(languageChangerPopover).toBeVisible();

        const germanOption = languageOptions.filter({ hasText: 'Deutsch' });
        await expect(germanOption).toBeVisible();
        await germanOption.click();

        await expect(htmlElement).toHaveAttribute('lang', 'de');
    });
});
