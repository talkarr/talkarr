/* eslint-disable playwright/no-wait-for-selector */
import { navigationItems } from '@components/Navigation/navigation';
import { expect, test } from '@playwright/test';

test.setTimeout(60000);

test('should be able to navigate to the home page', async ({ page }) => {
    await page.goto('http://localhost:3232', {
        waitUntil: 'domcontentloaded',
    });

    // wait for data-testid="navigation" to be visible
    await page.waitForSelector('[data-testid="navigation"]');

    await expect(page.getByTestId('navigation')).toBeVisible();

    await expect(page.title()).resolves.toBe('Talkarr');

    await expect(page.title()).resolves.not.toContain('404');
});

test('should be able to navigate to each page', async ({ page }) => {
    const pages = navigationItems.reduce<string[]>((acc, item) => {
        if (item.visible === false) {
            return acc;
        }

        acc.push(typeof item.path === 'object' ? item.path.href : item.path);

        if (item.subitems) {
            acc.push(
                ...item.subitems
                    .filter(i => i.visible !== false)
                    .map(({ path }) =>
                        typeof path === 'object' ? path.href : path,
                    ),
            );
        }

        return acc;
    }, []);

    for await (const pageSlug of pages) {
        await page.goto(`http://localhost:3232${pageSlug}`, {
            waitUntil: 'domcontentloaded',
        });

        await page.waitForSelector('[data-testid="navigation"]');

        await expect(page.getByTestId('navigation')).toBeVisible();

        console.info('Navigated to', pageSlug);

        await expect(page.title()).resolves.toContain('Talkarr');

        await expect(page.title()).resolves.not.toContain('404');
    }
});
