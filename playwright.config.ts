import type { TestOptions } from './e2e/talks.spec';

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const excludeMobile = process.env.EXCLUDE_MOBILE; // || process.env.CI;

export default defineConfig<TestOptions>({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    // reporter: process.env.CI ? 'github' : 'html',
    reporter: process.env.CI
        ? [['github'], ['html'], ['json', { outputFile: 'results.json' }]]
        : 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on', // 'retain-on-first-failure',
        screenshot: {
            mode: 'only-on-failure',
        },
        video: process.env.CI ? 'off' : 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], searchItemIndex: 0 },
        },

        {
            name: 'firefox',
            // for some reason, firefox sometimes fails on local machine
            retries: process.env.CI ? undefined : 5,
            timeout: process.env.CI ? undefined : 30000,
            use: { ...devices['Desktop Firefox'], searchItemIndex: 1 },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'], searchItemIndex: 2 },
        },

        /* Test against mobile viewports. */
        ...(excludeMobile
            ? []
            : [
                  {
                      name: 'Mobile Chrome',
                      use: { ...devices['Pixel 7'], searchItemIndex: 3 },
                  },
                  {
                      name: 'Mobile Safari',
                      use: { ...devices['iPhone 15'], searchItemIndex: 4 },
                  },
              ]),
    ],

    webServer: {
        // CI always has to start its own server
        command: 'exit 1',
        port: 3232,
        reuseExistingServer: true,
    },
});
