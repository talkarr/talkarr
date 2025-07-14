import { testUser } from '../initial-setup/setup.spec';

import { expect, test } from '@playwright/test';

test('authenticate', async ({ page }) => {
    await page.waitForURL('http://localhost:3232/login', {
        waitUntil: 'domcontentloaded',
    });

    expect(page.url()).toBe('http://localhost:3232/login');

    const loginElements = {
        email: page.getByTestId('login-form-email'),
        password: page.getByTestId('login-form-password'),
        submitButton: page.getByTestId('login-form-submit'),
    };

    await expect(loginElements.email).toBeVisible();
    await expect(loginElements.password).toBeVisible();
    await expect(loginElements.submitButton).toBeVisible();

    await expect(loginElements.submitButton).toContainText('Login');
    await expect(loginElements.submitButton).toBeEnabled();

    await loginElements.email.fill(testUser.email);
    await loginElements.password.fill(testUser.password);

    await loginElements.submitButton.click();

    await page.waitForURL('http://localhost:3232', {
        waitUntil: 'domcontentloaded',
    });

    // check that /api/user/info returns success=true
    const response = await page.request.get('/api/user/info');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
});
