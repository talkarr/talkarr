/* eslint-disable playwright/no-wait-for-selector */
import { navigationItems } from '@components/Navigation/navigation';
import { expect, test } from '@playwright/test';

test.setTimeout(60_000);

test('should be able to navigate to the home page', async ({ page }) => {
    const logs: { msg: string; type: string }[] = [];

    page.on('console', msg => {
        logs.push({ msg: msg.text(), type: msg.type() });
    });

    await page.goto('http://localhost:3232', {
        waitUntil: 'domcontentloaded',
    });

    // wait for data-testid="navigation" to be visible
    await page.waitForSelector('[data-testid="navigation"]', {
        timeout: 1000 * 60 * 5,
    });

    await expect(page.getByTestId('navigation')).toBeVisible();

    await expect(page.title()).resolves.toBe('Talkarr');

    await expect(page.title()).resolves.not.toContain('404');

    // check console logs for any errors
    const errors = logs.filter(log => log.type === 'error');

    // check if hydration errors are present
    const hydrationErrors = errors.filter(
        log =>
            log.msg.toLowerCase().includes('hydration failed') ||
            log.msg.toLowerCase().includes('minified react error #418'),
    );

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (hydrationErrors.length > 0) {
        console.error('Hydration errors found:', hydrationErrors);
    }

    expect(hydrationErrors).toHaveLength(0);
    expect(hydrationErrors).toEqual([]);
});

test('should be able to navigate to each page', async ({ page }) => {
    // eslint-disable-next-line unicorn/no-array-reduce
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
