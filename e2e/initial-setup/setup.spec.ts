/* eslint-disable playwright/no-wait-for-selector */
import { prisma } from '@backend/prisma';

import { expect, test } from '@playwright/test';

test.describe.configure({
    mode: 'serial',
});

const testUser = {
    displayName: 'Test User',
    email: `testuser-${Date.now()}@example.com`,
    password: 'Password_123!',
};

test.describe('Initial talkarr setup', () => {
    // after each test, reset the database
    test.beforeEach(async () => {
        console.info('Cleaning up database before test...');

        const result = await prisma.user.deleteMany({});

        console.info('Deleted test user:', result);
    });

    test('should have a welcome page', async ({ page }) => {
        await page.goto('http://localhost:3232', {
            waitUntil: 'domcontentloaded',
        });

        await page.waitForSelector('[data-testid="welcome-page"]', {
            timeout: 1000 * 60 * 5,
        });

        await expect(page.getByTestId('welcome-page')).toBeVisible();

        expect(page.url()).toBe('http://localhost:3232/welcome');

        await expect(page.title()).resolves.toContain('Talkarr');
        await expect(page.title()).resolves.not.toContain('404');

        const getStartedButton = page.getByTestId('welcome-get-started-button');

        await expect(getStartedButton).toBeVisible();

        await getStartedButton.click();

        const initialAccountForm = page.getByTestId('initial-account-form');

        await expect(initialAccountForm).toBeVisible();

        await page.waitForURL('http://localhost:3232/welcome/start', {
            waitUntil: 'domcontentloaded',
        });

        expect(page.url()).toBe('http://localhost:3232/welcome/start');

        const elements = {
            displayName: page.getByTestId('display-name-input'),
            email: page.getByTestId('email-input'),
            password: page.getByTestId('password-input'),
            passwordConfirmation: page.getByTestId('confirm-password-input'),
            passwordErrorText: page.getByTestId('password-error-text'),
            submitButton: page.getByTestId('create-account-button'),
        };

        await expect(elements.displayName).toBeVisible();
        await expect(elements.email).toBeVisible();
        await expect(elements.password).toBeVisible();
        await expect(elements.passwordConfirmation).toBeVisible();
        await expect(elements.submitButton).toBeVisible();
        await expect(elements.passwordErrorText).toBeHidden();

        await expect(elements.submitButton).toBeEnabled();

        await elements.displayName.fill(testUser.displayName);
        await elements.email.fill(testUser.email);
        await elements.password.fill(testUser.password);
        await elements.passwordConfirmation.fill('foobar');

        await elements.submitButton.click();

        await expect(elements.passwordErrorText).toBeVisible();

        const passwordErrorText =
            await elements.passwordErrorText.textContent();
        expect(passwordErrorText).toBeDefined();
        expect(passwordErrorText!.length).toBeGreaterThan(5);

        await elements.passwordConfirmation.fill(testUser.password);

        await expect(elements.submitButton).toBeEnabled();
        await elements.submitButton.click();

        await expect(elements.passwordErrorText).toBeHidden();
        await expect(page.getByTestId('initial-account-form')).toBeHidden();

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
        await expect(loginElements.submitButton).toBeEnabled();

        await loginElements.email.fill(testUser.email);
        await loginElements.password.fill(testUser.password);

        await loginElements.submitButton.click();

        await page.waitForURL('http://localhost:3232', {
            waitUntil: 'domcontentloaded',
        });
    });
});
